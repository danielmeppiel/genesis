# APM Documentation Audit — S2N v0.3.7 Executor

**Corpus:** `dev/empirical-proof/scenario-runs/fixtures/S2N-doc-audit/docs/` (11 pages)
**Auditor:** S2N-v037-real-executor (Sonnet 4.6, monolithic A9+A7)
**Date:** 2026-05-30
**Pattern:** A9 SUPERVISED EXECUTION + A7 MONOLITHIC SYNTHESIZER (0 task() spawns)

---

## Per-Page Verdict Table

| # | File | Verdict | Severity | Issues |
|---|------|---------|----------|--------|
| 1 | `quickstart.mdx` | PASS | — | No issues in corpus scope |
| 2 | `getting-started/installation.md` | PASS | — | No issues |
| 3 | `getting-started/authentication.md` | FINDINGS | HIGH | `apm install --update` undocumented; missing generic-host row in table |
| 4 | `producer/preview-and-validate.md` | FINDINGS | MEDIUM | Broken internal link (`cli/install/` for `apm deps list`) |
| 5 | `producer/compile.md` | FINDINGS | HIGH | Broken cross-ref: `apm preview` → wrong target page; same broken link |
| 6 | `consumer/run-scripts.md` | BLOCKED | BLOCKER | `--param` behavior directly contradicts `manifest-schema.md` §3.8 |
| 7 | `consumer/install-packages.md` | FINDINGS | MEDIUM | `apm view` source inconsistency; `--update` vs `--refresh` ambiguity |
| 8 | `consumer/authentication.md` | FINDINGS | MEDIUM | Misleading "further reading" cross-reference |
| 9 | `reference/policy-schema.md` | BLOCKED | BLOCKER | Internal example inconsistency: 5 FAILs listed but CLI output shows only 4 |
| 10 | `reference/baseline-checks.md` | PASS | — | No issues |
| 11 | `reference/manifest-schema.md` | FINDINGS | HIGH | `vscode` target missing from `compile.md`; `--param` contradiction (source); `target`/`targets` guidance drift |

**Summary:** 3 PASS · 6 FINDINGS · 2 BLOCKED · 2 BLOCKERs · 4 HIGH · 3 MEDIUM · 1 LOW

---

## Top Issues with File:Line Evidence

### FINDING 1 — BLOCKER: `--param` behavior contradiction
**Severity:** BLOCKER  
**Affects:** `consumer/run-scripts.md` (line 52–54) ↔ `reference/manifest-schema.md` (line 189)

`run-scripts.md:52–54`:
```
they are interpolated into any `.prompt.md` files the command references,
not exported as shell environment variables.
```

`manifest-schema.md:189`:
```
The script body MUST support `--param key=value` substitution
(`{key}` placeholders in the command string are replaced before execution).
```

**Contradiction:** `run-scripts.md` says `--param` values reach `.prompt.md` files only (not the shell); `manifest-schema.md §3.8` says they replace `{key}` placeholders **in the command string**. These are mutually exclusive descriptions of the same feature. Developers cannot write correct scripts without knowing the truth.

**Remediation:** Align both pages on the actual runtime behavior. If params are applied to `.prompt.md` at compilation time (and the command string receives the compiled file), update manifest-schema.md §3.8 to remove the "command string" language.

---

### FINDING 2 — BLOCKER: `policy-schema.md` example self-inconsistency
**Severity:** BLOCKER  
**Affects:** `reference/policy-schema.md` (lines 87–95 vs 101–108)

The `require_pinned_constraint` code block at lines 87–95 lists **five** entries marked `# FAIL`:
- `acme/skills` (NO_REF)
- `other/lib#>=1.0.0` (OPEN_UPPER)
- `third/lib#*` (WILDCARD)
- `acme/lib#main` (BARE_BRANCH)
- `sixth_pip/lib#==1.5.3` (BARE_BRANCH — also wrong diagnostic code; pip `==` is not a bare branch)

The CLI diagnostic output example (lines 101–108) shows only **four** violations:
```
- acme/skills: no ref; resolves to default branch
- other/lib: unbounded upper; pair with '<X.Y' or use a caret range
- third/lib: wildcard '*' matches any version
- acme/lib: bare branch 'main' tracks a moving tip
```

`sixth_pip/lib#==1.5.3` is listed as `FAIL` in the code but absent from the diagnostic output. Readers cannot tell whether `==` is actually blocked or what the real error code is.

Secondary issue: the comment `(BARE_BRANCH)` on line 95 for a pip-style `==` operator is semantically wrong — `==` is not a bare branch; it should be a distinct error like `INVALID_OP` or `UNSUPPORTED_OPERATOR`.

**Remediation:** Either (a) add the `sixth_pip` entry to the CLI output example, or (b) mark it `# OK` if `==` is handled as exact pinning. Correct the diagnostic code comment on line 95.

---

### FINDING 3 — HIGH: `apm install --update` undocumented
**Severity:** HIGH  
**Affects:** `getting-started/authentication.md` (line 232) ↔ `consumer/install-packages.md` (lines 155–164)

`getting-started/authentication.md:232`:
```
`apm install --update` will succeed transparently via the bearer retry.
```

`consumer/install-packages.md:155–164` lists all `apm install` flags — `--dry-run`, `--target`, `--exclude`, `--only`, `--frozen`, `--refresh`, `--dev`, `-g`, `-v` — but **`--update` is absent**.

`install-packages.md:97` separately mentions `apm update` as a distinct command ("mirrors `npm update`"). It is unclear whether `apm install --update` and `apm update` are the same operation or different, or whether `--update` is an alias for `--refresh`. The ambiguity affects auth troubleshooting guidance.

**Remediation:** Document `--update` in the flags table in `install-packages.md`, or clarify in `authentication.md` that the correct flag is `--refresh` (if `--update` is an alias or removed).

---

### FINDING 4 — HIGH: Broken cross-reference — `apm preview` in `compile.md`
**Severity:** HIGH  
**Affects:** `producer/compile.md` (line 72)

`compile.md:72`:
```
To preview a script that wraps a `.prompt.md` file, use
[`apm preview`](../preview-and-validate/) instead.
```

The link targets `preview-and-validate.md`, but that page covers `apm compile --dry-run`, `apm view`, `apm list`, `apm outdated`, and `apm audit`. **`apm preview` does not appear in `preview-and-validate.md`.**

`run-scripts.md:62` and `install-packages.md:133` also reference `apm preview` with a link to `cli/install/` — both are broken or misleading cross-references for the same undocumented command.

**Remediation:** Create an `apm preview` CLI reference page (or add it to `run-scripts.md`) and update all three cross-references to point to the correct location.

---

### FINDING 5 — HIGH: `vscode` target in `manifest-schema.md` missing from `compile.md` accepted values
**Severity:** HIGH  
**Affects:** `reference/manifest-schema.md` (line 125) ↔ `producer/compile.md` (line 89)

`manifest-schema.md:125` lists `vscode` as an allowed value for the `target:` field (alongside `agents`, `copilot`, `claude`, `cursor`, `opencode`, `codex`, `gemini`, `windsurf`, `all`).

`compile.md:89` lists the accepted values for `--target`:
```
copilot, claude, cursor, opencode, codex, gemini, windsurf, agent-skills, all
```

`vscode` is absent from `compile.md`'s list. The manifest can declare `target: vscode`, but `apm compile --target vscode` would appear to reject it (or the CLI simply doesn't document support).

**Remediation:** Add `vscode` to `compile.md`'s accepted values list, or document that `vscode` is an alias for `copilot`/`agents` and list those together.

---

### FINDING 6 — HIGH: `consumer/authentication.md` misleading "further reading"
**Severity:** HIGH  
**Affects:** `consumer/authentication.md` (line 96)

`consumer/authentication.md:96`:
```
Token scopes, SSO authorization, Enterprise Managed Users (EMU), GHES hostnames,
multi-org `GITHUB_APM_PAT_{ORG}` setups, GitLab self-managed FQDN routing,
and the ADO bearer fallback are covered in the [enterprise authentication](../../enterprise/security/) page.
```

All of these topics are in fact covered in `getting-started/authentication.md` (the detailed auth reference in this corpus). The link to `enterprise/security/` is a different, out-of-corpus page. Sending users to `enterprise/security/` when the information is already in `getting-started/authentication.md` creates a dead end for the majority of users following the consumer ramp.

**Remediation:** Change the link target to `../../getting-started/authentication/` (or relative equivalent), which is the correct location for all listed topics.

---

### FINDING 7 — MEDIUM: `apm view` source inconsistency
**Severity:** MEDIUM  
**Affects:** `consumer/install-packages.md` (line 145) ↔ `producer/preview-and-validate.md` (line 50)

`install-packages.md:145`:
```
`apm view` reads from `apm.lock.yaml` and `apm_modules/`
```

`preview-and-validate.md:50–52`:
```
`apm view` reads from `apm_modules/` and reports the package's name, version...
```

`install-packages.md` says `apm view` reads from both the lockfile and `apm_modules/`; `preview-and-validate.md` mentions only `apm_modules/`. Users consulting one page get different mental models of what data the command uses.

**Remediation:** Align descriptions. If `apm view` uses the lockfile for some fields (e.g., locked ref and commit) and `apm_modules/` for others, both pages should say so consistently.

---

### FINDING 8 — MEDIUM: Wrong diagnostic code `BARE_BRANCH` for pip `==` operator
**Severity:** MEDIUM  
**Affects:** `reference/policy-schema.md` (line 95)

`policy-schema.md:95`:
```
- sixth_pip/lib#==1.5.3      # FAIL: pip-style operator not supported (BARE_BRANCH)
```

A pip-style `==` operator (`==1.5.3`) is not a "bare branch" — it is an unsupported version operator. The `BARE_BRANCH` diagnostic code specifically describes entries like `#main` that track a moving branch tip. Using it for a `==` operator teaches users an incorrect mental model of the error taxonomy. (This is partly subsumed by FINDING 2 above but is a distinct documentation error.)

**Remediation:** Use the correct diagnostic code (e.g., `BARE_BRANCH` → `UNSUPPORTED_OPERATOR` or `INVALID_REF_SYNTAX`) on line 95.

---

### FINDING 9 — MEDIUM: Broken link `cli/install/` for `apm deps list`
**Severity:** MEDIUM  
**Affects:** `producer/preview-and-validate.md` (line 80) · `consumer/run-scripts.md` (line 133)

`preview-and-validate.md:80`:
```
See [CLI reference](../../reference/cli/install/) for both.
```
(Referring to both `apm list` and `apm deps list`.)

`run-scripts.md:133`:
```
Inspect what will execute: `apm preview` in the [CLI reference](../../reference/cli/install/)
```

Both links resolve to the `cli/install/` page, which covers `apm install` — not `apm deps`, `apm list`, or `apm preview`. The links should point to `cli/list/`, `cli/deps/`, and `cli/preview/` respectively (or wherever those commands are actually documented in the CLI reference).

**Remediation:** Update both links to the correct CLI reference pages.

---

### FINDING 10 — LOW: `target` vs `targets` guidance inconsistency in manifest-schema.md
**Severity:** LOW  
**Affects:** `reference/manifest-schema.md` (lines 146 vs 132–144)

`manifest-schema.md §3.6:146`:
```
A plural alias `targets:` (YAML list only) is also accepted and takes precedence
over the legacy CSV form when both are declared. Prefer `targets:` in new manifests;
`target:` remains supported for backward compatibility.
```

Yet the YAML examples immediately following (lines 132–144) all use `target:` (singular), not `targets:`. The text says "prefer `targets:`" but the examples show `target:`. This causes low-grade confusion and was already propagated to `compile.md` and `install-packages.md` which consistently use `targets:` in prose without the explicit guidance.

**Remediation:** Update the code examples in §3.6 to use `targets:` (the recommended form), or update the prose to clarify that `target:` is equally valid for single-string forms.

---

## Cross-Page Contradiction Matrix

| Finding | Page A | Line(s) | Page B | Line(s) | Nature |
|---------|--------|---------|--------|---------|--------|
| `--param` behavior | `consumer/run-scripts.md` | 52–54 | `reference/manifest-schema.md` | 189 | Direct contradiction |
| `apm view` source | `consumer/install-packages.md` | 145 | `producer/preview-and-validate.md` | 50–52 | Partial omission |
| `--update` flag | `getting-started/authentication.md` | 232 | `consumer/install-packages.md` | 155–164 | Missing entry |
| `vscode` target | `reference/manifest-schema.md` | 125 | `producer/compile.md` | 89 | Missing entry |

---

## Pages Detailed Analysis

### `quickstart.mdx` — PASS
No issues within the 11-page corpus. External links (`/apm/producer/`, `/apm/enterprise/governance-guide/`, `/apm/concepts/package-anatomy/`) are out-of-corpus and not audited. The `apm.yml` scaffold example is consistent with `manifest-schema.md`. The `--target copilot` flag is consistent with `install-packages.md`.

### `getting-started/installation.md` — PASS
Clean installation reference. Windows ARM64 emulation caveat (line 14) is properly labeled as a known limitation. Air-gapped and corporate network scenarios are well-covered. No broken cross-references to in-corpus pages.

### `reference/baseline-checks.md` — PASS
Accurate and internally consistent reference. The check ordering (line 122) matches the individual check descriptions. The `includes-consent` advisory behavior (always passes, promotable by policy) is correctly documented. The `drift` check's cache-dependency behavior is clearly explained.

---

## Recommended Fix Priority

1. **Immediate (BLOCKER):** Resolve `--param` contradiction between `run-scripts.md` and `manifest-schema.md §3.8` before any developer implements a script runner or manifest validator.
2. **Immediate (BLOCKER):** Fix `policy-schema.md` CLI output example to include the fifth FAIL entry (or relabel `sixth_pip` as OK) and correct the `BARE_BRANCH` diagnostic code.
3. **High (release-blocking):** Document `apm install --update` in install-packages.md or clarify it's `--refresh`.
4. **High:** Fix `compile.md:72` cross-reference for `apm preview`.
5. **High:** Add `vscode` to `compile.md`'s accepted `--target` values.
6. **High:** Fix `consumer/authentication.md:96` cross-reference to `getting-started/authentication.md`.
7. **Medium:** Align `apm view` source descriptions across install-packages.md and preview-and-validate.md.
8. **Medium:** Correct `BARE_BRANCH` diagnostic code on `policy-schema.md:95`.
9. **Medium:** Fix two broken `cli/install/` links in preview-and-validate.md and run-scripts.md.
10. **Low:** Update `manifest-schema.md §3.6` examples to use `targets:` (the recommended form).
