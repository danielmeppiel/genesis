# PR Review: microsoft/apm#1424 — feat(lsp): add first-class LSP server support

## Verdict

**REQUEST CHANGES.** One blocker-grade supply-chain trust gap must be addressed before merge; two additional high-severity hardening deficits require attention. The core architecture mirrors the established MCP integration correctly and the happy path is sound.

---

## Blockers

### SECURITY-B1 — Transitive LSP dependencies are executed with zero policy gate (CWE-829)

**File:** `src/apm_cli/install/lsp/integration.py`, line 872 (`run_lsp_integration`, `collect_transitive` call)

Every package on the system that declares LSP servers in its manifest is unconditionally trusted to contribute server configs — including `command`, `args`, and `env` fields — that Claude Code will later spawn. There is no policy gate, no explicit allowlist, no provenance check, and no user-visible warning listing what is being installed. An attacker who publishes or compromises any transitively-pulled package can inject an arbitrary shell command that executes in the user's Claude Code session. The MCP integrator applies a policy gate at the equivalent collection point; the LSP path omits it entirely.

**Required fix:** Apply the same policy gate used by the MCP `collect_transitive` path to LSP transitive dependencies. At minimum, surface a human-readable list of every transitive LSP server being installed (name, source package, command) before any write occurs. Consider an opt-in flag (`--trust-transitive-lsp`) for full parity with post-install-script gating in other package ecosystems.

---

## High Severity

### SECURITY-H1 — Arbitrary env key injection via transitive LSP packages (CWE-454)

**File:** `src/apm_cli/models/dependency/lsp.py`, line 1600 (`LSPDependency` env field validation)

The `env` field accepts any key-value map with no key-level validation. A malicious or compromised transitively-pulled package can set `LD_PRELOAD`, `DYLD_INSERT_LIBRARIES`, `PYTHONSTARTUP`, `RUBYOPT`, or equivalent loader-interception variables. When the LSP server is subsequently spawned by Claude Code, these env overrides produce code execution in the host process without any user action beyond running `apm install`.

**Suggested fix:** Introduce a blocklist of known dangerous environment variable names inside `LSPDependency.validate()`. Reject or warn on keys matching `LD_PRELOAD`, `DYLD_INSERT_LIBRARIES`, `PYTHONSTARTUP`, `RUBYOPT`, and similar process-injection vectors.

### SECURITY-H2 — `workspace_folder` field bypasses path-traversal validation (CWE-22)

**File:** `src/apm_cli/models/dependency/lsp.py`, line 1720

The `workspace_folder` field is not passed to `validate_path_segments`, whereas the `command` field receives that check. A package can set `workspace_folder` to a path that traverses into sensitive directories. This is an inconsistency in the validation surface that an attacker can exploit to scope the LSP server to a directory outside the intended plugin root.

**Suggested fix:** Call `validate_path_segments` on `workspace_folder` at the same point in `validate()` where it is called for `command`.

### CORRECTNESS-H1 — Zero-value integers silently coerced to `None` in `LSPDependency` model (logic bug)

**File:** `src/apm_cli/models/dependency/lsp.py`, line 72 (`startup_timeout`, `shutdown_timeout`, `max_restarts`)

These fields are populated using `camel_value or snake_value` — the Python `or` idiom. When a package author deliberately configures `startup_timeout: 0` (immediate fail-fast) or `max_restarts: 0` (no restart), the value `0` is falsy and is silently dropped; the fallback `snake_value` (also typically `0` or `None`) is used instead. Depending on defaults, this may mean a zero-restart policy is never honored. The `restart_on_crash` field already uses the correct `is not None` guard; these three fields do not.

**Suggested fix:** Replace `camel_value or snake_value` with `camel_value if camel_value is not None else snake_value` for `startup_timeout`, `shutdown_timeout`, and `max_restarts`.

---

## Medium Severity

- **SECURITY-M1 (CWE-367)** — `src/apm_cli/integration/lsp_integrator.py:1317`: Non-atomic read-modify-write of `~/.claude.json` with no file lock. Concurrent `apm install` processes race on this shared config. Fix: write to a temp file in the same directory and use `os.replace`; hold `fcntl.flock` during the read-modify-write cycle.

- **SECURITY-M2 (CWE-88)** — `src/apm_cli/models/dependency/lsp.py:1563`: `args` list items are not validated for null bytes or shell metacharacters. These flow unchecked into `.lsp.json` and may be passed to a subprocess by Claude Code. Fix: reject args items containing null bytes or non-printable characters in `validate()`.

- **CORRECTNESS-M1** — `src/apm_cli/models/dependency/lsp.py:68`: Same falsy-`or` bug as CORRECTNESS-H1, affecting `initialization_options` and `settings`. An explicitly provided empty dict `{}` is silently dropped. Fix: use `is not None` guards.

- **CORRECTNESS-M2** — `src/apm_cli/integration/lsp_integrator.py:133` (`get_server_names`): dict-typed dependency entries are not handled; only list entries are iterated. Stale-cleanup then misses those server names and may leave dangling or delete live entries on the next run. Fix: add a branch for `isinstance(dep, dict) and 'name' in dep`.

- **PERFORMANCE-M1** — `src/apm_cli/integration/lsp_integrator.py:313`: `install()` reads `.lsp.json` and then `remove_stale()` reads it again; two reads plus two writes per install run. Fix: read once before calling either method; write once after both complete.

- **PERFORMANCE-M2** — `src/apm_cli/integration/lsp_integrator.py:214` (`update_lockfile`): reads and writes the lockfile from disk on every call. Fix: pass a pre-loaded `LockFile` object to `update_lockfile` instead of re-reading.

- **PERFORMANCE-M3** — `src/apm_cli/integration/_shared.py:54` (`resolve_locked_apm_yml_paths`): reads the lockfile independently each call; called separately by both `LSPIntegrator` and `MCPIntegrator` during `collect_transitive`. Fix: accept a pre-loaded `LockFile` parameter; callers share one read per install run.

- **PERFORMANCE-M4** — `src/apm_cli/deps/plugin_parser.py:548`: `_lsp_servers_to_apm_deps` constructs `LSPDependency` objects for validation then discards them; `apm_package._parse_dependency_dict` re-parses the same dicts downstream. Fix: return `LSPDependency` objects directly to eliminate the second parse.

- **TEST-M1** — `src/apm_cli/integration/lsp_integrator.py:1105,1197,1223,1344,1369`: Five exception handlers across `collect_transitive`, `install`, and `remove_stale` are untested. All catch `Exception` on config read/write paths (`.lsp.json`, `~/.claude.json`, `apm.yml`). Fix: add tests for EACCES, `json.JSONDecodeError`, and disk-full scenarios on each path.

- **TEST-M2** — `src/apm_cli/install/lsp/integration.py:872`: No test for failure modes of `LSPIntegrator.collect_transitive` (e.g., one transitive package fails to parse).

- **TEST-M3** — Various: missing tests for malformed lockfile in `collect_transitive`, non-string command validation, and `apm_modules_path` missing in `run_lsp_integration`.

---

## Notes (Low / Nit)

- **SECURITY-L1 (CWE-312)** — `src/apm_cli/integration/lsp_integrator.py:1364`: `env` dict written in plaintext to world-readable `.lsp.json`. Secrets (API keys, tokens) leak to any local user. Warn if env values appear secret-shaped.

- **CORRECTNESS-L1** — `src/apm_cli/commands/install.py:540`: LSP install gate reuses the `should_install_mcp` variable. Intentional per the L853 docstring and tests at L2280+, but misleading if MCP and LSP flags ever diverge. Consider renaming to `should_install_extensions` or adding a one-line alias comment.

- **PERFORMANCE-L1** — `src/apm_cli/integration/_shared.py:35` (`deduplicate_deps`): O(N) list scan for nameless deps; O(N²) at scale. Minor at realistic dep counts.

- **PERFORMANCE-L2** — `src/apm_cli/deps/lockfile.py:464` (`is_semantically_equivalent`): allocates a fresh sorted list of `lsp_servers` on every comparison. Store already-sorted or compare in-place.

- **STYLE-H1** — `src/apm_cli/install/lsp/integration.py:834`: `logger` parameter lacks a type hint; all surrounding parameters are annotated. Should be `logger: Any` or a concrete logger type.

- **STYLE nits** (medium) — `lsp_integrator.py:1078,1132,1143`, `_shared.py:1005`, `models/dependency/lsp.py:1616,1648`: return types use bare `list`, `builtins.set`, `builtins.dict` without element types. Replace with `list[LSPDependency]`, `set[str]`, `dict[str, Any]`, etc.

- **TEST-L1** — `tests/unit/install/test_lsp_integration.py:2380`: LSP test depth is shallower than MCP coverage. Add negative-path tests to reach parity.

- **TEST-L2** — `src/apm_cli/models/dependency/lsp.py`: edge cases for `validate()` (empty string, spaces, absolute path, None with `strict=False`) and `get_*_lsp_dependencies` (mixed types, None, non-list) are absent.

---

## Lens Roll-Call

| Lens | Blocker | High | Medium | Low | Notes |
|---|---|---|---|---|---|
| Correctness | 0 | 1 | 2 | 1 | `or`-coercion of zero-valued ints; stale-cleanup name miss |
| Security | 1 | 2 | 2 | 1 | Supply-chain RCE (CWE-829) blocker; env-key (CWE-454) + path-traversal (CWE-22) HIGHs |
| Performance | 0 | 0 | 4 | 2 | Redundant lockfile + config I/O; double parse |
| Style | 0 | 1 | 7 | 1 | Missing type hints; unparameterized return types |
| Test Coverage | 0 | 5 | 5 | 3 | Exception-handler paths universally untested |
