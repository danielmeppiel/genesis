# Quality Grade — S1-v037-real Executor

**Grade: 8 / 10**

---

## Rubric

Quality is measured against the v0.3.6 cell-F ground-truth review at
`dev/empirical-proof/ab-experiment-apm-1424/cell-F/review.md`. Two quality gates were
declared in the handoff:

1. **Gate A** — Did the synthesis catch SECURITY-002 (transitive LSP supply-chain RCE /
   CWE-829, HIGH in cell-F review)?
2. **Gate B** — Did the synthesis catch SECURITY-005 (shell metacharacter injection via
   `${CLAUDE_PLUGIN_ROOT}` substitution before path validation, MEDIUM in cell-F review)?

The v0.3.6 baseline scored 9/10 (both gates passed; caught rglob-perf HIGH).

---

## Gate A — Transitive LSP Supply-Chain RCE (SECURITY-002 / CWE-829)

**Result: PASS ✓**

The security lens flagged this as a **BLOCKER** (upgraded from HIGH in v0.3.6):

> `{"sev":"blocker","cwe":"CWE-829","file":"src/apm_cli/install/lsp/integration.py","line":872,...}`

The synthesized output.md surfaces this as SECURITY-B1 with file:line citation at
`src/apm_cli/install/lsp/integration.py:872`. The finding accurately identifies the
`collect_transitive` call site, the absence of any policy gate, and the RCE vector via
Claude Code spawn. Suggested fix correctly proposes parity with the MCP policy gate.

This matches cell-F's SECURITY-002 finding precisely and goes further by escalating severity
to BLOCKER (previously HIGH).

---

## Gate B — `${CLAUDE_PLUGIN_ROOT}` Metacharacter Injection (SECURITY-005 / CWE-78)

**Result: PARTIAL MISS ✗ (−1.0)**

The cell-F review identified SECURITY-005 at `src/apm_cli/deps/plugin_parser.py`,
function `_substitute_plugin_root`, as a MEDIUM: the `${CLAUDE_PLUGIN_ROOT}` placeholder is
`str.replace`d into every string field (command, args, env values) before any path validation
occurs, allowing a plugin path containing shell metacharacters to propagate.

The v0.3.7 security lens did **not** emit a finding for `deps/plugin_parser.py` or
`_substitute_plugin_root`. The closest finding is:

> `{"sev":"medium","cwe":"CWE-88","file":"src/apm_cli/models/dependency/lsp.py","line":1563,...}`

This CWE-88 finding covers metacharacter-in-args at the model level — a related but distinct
location and mechanism. The specific `str.replace`-before-validation pattern in
`_substitute_plugin_root` was not surfaced. Partial credit awarded for CWE-88.

**Deduction: −1.0 point.**

---

## False Positives

The test-coverage lens recycled the same false positive as v0.3.6:

> `{"sev":"medium","untested_file":"src/apm_cli/deps/plugin_parser.py","untested_line":666,"issue":"_substitute_plugin_root called but function not defined in diff"...}`

This is a diff-isolation artifact: the function is defined at `plugin_parser.py:304` (added
in the preceding MCP work, not shown in the LSP diff). This was already identified and
adjudicated as a false positive in cell-F's CORRECTNESS-001 / TEST-001 adjudication. The
v0.3.7 run repeated it, as expected for a diff-only reviewer.

**No additional deduction** — this is a known and expected artifact of the diff-only review
mode, not a quality regression.

---

## Bonus Findings vs v0.3.6 Baseline (+0.5 net)

The v0.3.7 security lens discovered two HIGH-severity findings absent from the v0.3.6 cell-F
review:

- **CWE-22 / SECURITY-H2** — `workspace_folder` field bypasses `validate_path_segments` at
  `models/dependency/lsp.py:1720`. Not in cell-F review. Genuine path-traversal gap.
- **CWE-454 / SECURITY-H1** — `env` key injection (LD_PRELOAD, DYLD_INSERT_LIBRARIES) at
  `models/dependency/lsp.py:1600`. Cell-F caught env validation gap as SECURITY-003 (MEDIUM),
  but at model level only; v0.3.7 explicitly names the dangerous key classes. Incremental
  signal.

The correctness lens caught CWE-style `or`-coercion bug for zero-valued integers at
`lsp.py:72` — not in cell-F review. Genuine silent-data-loss finding.

**Bonus: +0.5 for net-new legitimate HIGH findings.**

---

## Final Scoring

| Criterion | Points |
|---|---|
| Base score (comparable-to-baseline execution) | 9.0 |
| Gate A pass (CWE-829 supply-chain RCE caught) | 0 (included in base) |
| Gate B miss (CWE-78 `_substitute_plugin_root` not caught) | −1.0 |
| Bonus: net-new legitimate HIGH findings (CWE-22, CWE-454, `or`-coercion) | +0.5 |
| Repeated known false positive (diff-isolation artifact, expected) | 0 (no deduction) |
| **Total** | **8.5 → rounded to 8** |

**Final grade: 8 / 10.**

The run did not regress quality vs v0.3.6 on the primary gate (CWE-829 caught, upgraded to
BLOCKER). It missed the specific `_substitute_plugin_root` metacharacter path, which is a
legitimate gap. Net-new findings partially compensate.
