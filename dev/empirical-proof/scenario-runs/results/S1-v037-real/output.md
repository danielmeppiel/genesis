# PR review: microsoft/apm#1424 — `feat(lsp): add first-class LSP server support to install pipeline`

**Verdict: REQUEST CHANGES.** This PR is architecturally sound (LSP integrator
mirrors the established MCP integrator) and well-tested at the happy-path
level, but it ships a load-bearing security gap: transitive LSP server
configurations are unconditionally trusted, with a validator that rejects
only path traversal — shell metacharacters and dangerous environment
variables pass freely. Combined with the auto-write to `.lsp.json` (which
Claude Code auto-discovers), the consequence is supply-chain remote-code
execution from any installed transitive dependency. That single class of
issue is a blocker on a pipeline whose explicit purpose is to wire third-
party LSP binaries into the user's editor. Fix the trust model and the
input validation, and the rest is polish.

---

## Blockers

### B1. Unconditional trust of transitive LSP server configs (supply-chain RCE)

- **File / location:** `src/apm_cli/integration/lsp_integrator.py` around
  `collect_transitive()` (~line 1087).
- **What's wrong:** Any APM package transitively pulled into the install
  graph can declare `lspServers` in its `plugin.json` or ship a `.lsp.json`
  file, and those entries are merged into the project's `.lsp.json`
  without any policy gate. Unlike MCP — which has an explicit allowlist /
  trust mechanism for transitive entries — LSP collection auto-trusts
  everything. Every transitive dependency therefore becomes a code-
  execution principal: when Claude Code spawns the LSP server, the
  attacker controls `command`, `args`, and `env`.
- **Why blocker:** A deeply nested dependency (or a typosquatted one) is
  enough to ship arbitrary commands into a developer's machine. This is
  the same threat shape MCP already mitigates; there is no reason LSP
  should be looser.
- **Suggested fix:** Add an explicit policy gate matching the MCP path —
  prompt-on-first-trust, manifest-level allowlist, or at minimum a
  visible audit log + opt-in flag for transitive LSP entries. Do not
  auto-merge transitive `lspServers` into `.lsp.json` until the user has
  acknowledged them.
- **CWE:** CWE-829 (inclusion of functionality from untrusted control
  sphere).

### B2. `command` validator rejects only `..`, lets shell metacharacters through (RCE)

- **File / location:** `src/apm_cli/models/dependency/lsp.py`,
  `validate_path_segments` / `command` validation path (~line 1704).
- **What's wrong:** The current validator checks for path traversal
  segments and rejects `..`, but it does not reject shell metacharacters
  in `command` or in `args`. So `command="sh"` with
  `args=["-c", "<arbitrary shell>"]` passes validation cleanly. Combined
  with B1, any transitive dep can land that pair in `.lsp.json`. Even
  without B1, a misconfigured first-party plugin can land it accidentally
  via `${CLAUDE_PLUGIN_ROOT}` substitution, since that substitution
  happens *before* validation in `_substitute_plugin_root()` (plugin
  parser).
- **Suggested fix:** Tighten `command` validation to a single binary
  token with no shell metacharacters (`;`, `|`, `&`, `` ` ``, `$()`,
  `{}`, `[]`, whitespace, redirection). Validate `args` entries against
  the same metachar set, or at least warn on shell-injection-shaped
  patterns. Apply substitution *after* validation, not before.
- **CWE:** CWE-78 (OS command injection).

---

## High-severity findings

### H1. `args` field has zero validation

`src/apm_cli/models/dependency/lsp.py` (~line 1596). The `args` list is
written verbatim to `.lsp.json` and passed to Claude Code, which executes
the LSP binary with them. No allowlist, no metachar check, no length
cap. A hostile dep can inject `--config=/evil`, `--exec`-style flags, or
arg-injection patterns. **Fix:** validate each arg; reject shell
metacharacters; warn on suspicious flags. (CWE-88, argument injection.)

### H2. `env` map has zero validation — `LD_PRELOAD` / `PATH` injection

`src/apm_cli/models/dependency/lsp.py` (~line 1601). Any transitive dep
can set `env={"LD_PRELOAD": "/path/to/evil.so"}`, `PATH`, `PYTHONPATH`,
`DYLD_INSERT_LIBRARIES`, etc. Those values land in `.lsp.json` and
influence the LSP binary's runtime. **Fix:** denylist of dangerous env
keys (`LD_PRELOAD`, `LD_LIBRARY_PATH`, `DYLD_*`, `PATH` overrides,
`PYTHONPATH`); reject or strip them from untrusted sources. (CWE-15.)

### H3 – H5. Test gaps on the corrupt-config fallback paths

Three call sites in `src/apm_cli/integration/lsp_integrator.py` —
`remove_stale()` at ~1326, `install()` at ~1354, and `remove_stale()`
user-scope at ~1211 — use a defensive "if `.lsp.json` is not a dict,
fall back to `{}`" pattern, but no test exercises a corrupted file
(non-dict JSON, null, array, string). The fallback runs in production
on real corruption; if it ever regresses (e.g. a future refactor changes
the fallback to "raise" or to "leave entries"), there is nothing to
catch it. **Fix:** add three regression tests, one per call site, that
seed a corrupt `.lsp.json` / `~/.claude.json` and assert the documented
fallback behaviour.

### H6. Performance: `deduplicate_deps` is O(N²) on the nameless-dep branch

`src/apm_cli/integration/_shared.py` (~line 31). The nameless-dep
fallback uses `dep not in result` against a list, giving O(N²) total. On
a project with hundreds of transitive deps this stops being free. **Fix:**
track a `set` of `id(dep)` (or equivalent) alongside the result list and
use that for membership tests.

### H7. Style: `import builtins` + qualified `builtins.set` / `builtins.dict`

Three files use `import builtins` and then write `builtins.set` /
`builtins.dict`. The rest of the codebase uses bare `set` / `dict`. This
is pattern drift, not a correctness issue, but it's the kind of drift
that tends to spread once it's in. **Files:**
`src/apm_cli/install/lsp/integration.py:816`,
`src/apm_cli/integration/lsp_integrator.py:1049`,
`src/apm_cli/integration/_shared.py:970`. **Fix:** drop the `builtins`
import and use the bare names.

---

## Medium-severity findings

- **M1. Falsy-default bug pattern in `LSPDependency.from_dict`.** Five
  fields use `d.get('camelCase') or d.get('snake_case')` to read either
  spelling. For numeric fields (`startupTimeout`, `shutdownTimeout`,
  `maxRestarts`) the value `0` is falsy and silently drops to the
  snake_case fallback (or `None`); for dict/string fields
  (`initializationOptions`, `workspaceFolder`) an empty `{}` or `""` does
  the same. `lsp.py` lines ~1601, 1604, 1605, 1607, 1610. **Fix:** use
  `is not None` / `'<key>' in d` checks instead of `or`.
- **M2. TOCTOU in `_read_lsp_file`** (`plugin_parser.py:679`). The
  `exists` / `is_file` / `is_symlink` checks are separate from the
  subsequent `open()`. **Fix:** open first with `O_NOFOLLOW`, then `stat`
  the file descriptor. (CWE-367.)
- **M3. TOCTOU on read-modify-write of `.lsp.json` and `~/.claude.json`**
  (`lsp_integrator.py:1186`). Concurrent `apm install` runs can lose
  updates. **Fix:** atomic write (`tmp + os.replace()`), advisory lock
  during the cycle. (CWE-367.)
- **M4. `workspaceFolder` accepts arbitrary absolute paths** (`lsp.py:1604`).
  An attacker can set it to `/etc`, `~/.ssh`, `/proc`, etc. **Fix:**
  reject absolute paths outside the project root. (CWE-73.)
- **M5. Lockfile re-read churn.** `resolve_locked_apm_yml_paths`
  (`_shared.py:53`) and `update_lockfile`
  (`lsp_integrator.py:215`) each call `LockFile.read()` from disk even
  though `run_lsp_integration` already holds the parsed lockfile. Result:
  the lockfile is parsed three times in a single install run. **Fix:**
  thread the already-loaded `LockFile` through as an optional parameter.
- **M6. Same-file double-read.** `remove_stale` and `install` each read
  `.lsp.json` from disk during a single install, even though they
  immediately follow each other. **Fix:** read once, pass the dict.
- **M7. Coverage gap on `collect_transitive`'s broad `except`** at
  `lsp_integrator.py:1100`. The catch-all swallows unparseable
  `apm.yml`; no test exercises that path.

---

## Low-severity / notes

- **L1. `get_server_names` silently skips dict-form deps**
  (`lsp_integrator.py:1138`). If a dict-shaped LSP dep ever flows
  through, `remove_stale` may treat it as removed and clean it up. The
  current call graph keeps this from biting today, but the asymmetry is
  a future-refactor trap. Add the `elif isinstance(dep, dict)` branch.
- **L2. Scope readability** in `install/lsp/integration.py:893`:
  `new_lsp_configs` is initialised only inside an `if`, parallel to
  `new_lsp_servers` initialised before. Hoist the init.
- **L3. Type-hint gaps** on `logger`, `diagnostics`, `project_root`
  parameters in several methods of `lsp_integrator.py` and
  `install/lsp/integration.py`, where surrounding parameters are typed.
- **L4. `initialization_options` / `settings` are `Any`** with no size
  cap (`lsp.py:1567`). Document that these are trusted-source-only and
  add a minimal type / size guard.
- **L5. Coverage gaps** on directory-as-file edge case
  (`plugin_parser.py:680`), missing `apm_modules_path`
  (`test_lsp_integration.py`), and lockfile-parse-error fallback
  (`test_lsp_integrator.py`). All low-priority but easy adds.

---

## Lens roll-call

- **Correctness:** 0 blockers, 0 high, 5 medium, 2 low. Pattern: falsy-
  `or` defaults in `from_dict`; no logic bugs in the integration wiring
  itself.
- **Security:** **1 blocker, 3 high**, 3 medium, 1 low. Pattern:
  validator scope is too narrow; trust model for transitive deps is
  missing.
- **Performance:** 0 blockers, 1 high, 3 medium. Pattern: lockfile re-
  read churn and one O(N²) on the nameless-dep dedup branch.
- **Style:** 0 blockers, 3 high (the `import builtins` drift), 8 medium
  (type-hint gaps).
- **Test coverage:** 0 blockers, 3 high, 6 medium / low. Pattern:
  defensive fallback paths exist in code but are not exercised in
  tests.

---

## Methodology

This advisory was produced by a 5-lens advisory PR review fan-out, with
each lens dispatched as a `task()` spawn under genesis v0.3.7's AUDIENCE
BOUNDARY + canonical caveman discipline (B14b/B14c). Lens spawns
received compressed caveman briefs and returned JSONL receipts; the
synthesizer (this thread) decompressed them into the prose above at the
audience boundary. Caveman fragments are paraphrased here, not quoted —
file paths, line numbers, identifiers, and CWE IDs were preserved
byte-identical per the B14b PRESERVE-EXACT contract.

Lens-to-model assignment: correctness / security / performance ran on
`claude-sonnet-4.6` (REVIEWER tier, judgement); style / test-coverage
ran on `claude-haiku-4.5` (mechanical scan, B12 MODEL ROUTER). 5 spawns
total. No GitHub writes were performed.
