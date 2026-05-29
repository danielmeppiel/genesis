# Caveman classification — S1-v037 runtime cell

For every `task()` spawn dispatched in this chat session, the brief is
quoted and classified per genesis v0.3.7 PER-SPAWN DECLARATION TABLE
modes (CAVEMAN_ULTRA / CAVEMAN_FULL / CAVEMAN_LITE / SHORT_PROSE /
NORMAL_PROSE / OTHER).

**Headline: 5/5 spawn briefs were CAVEMAN_FULL on the wire (vs v0.3.6's 0/9).**

---

## Spawn 1 — correctness lens (general-purpose, sonnet-4.6) — CAVEMAN_FULL

Brief sent to `task()`:

```
ROLE: correctness lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff
  (path relative to repo root /Users/danielmeppiel/Repos/copilot-worktrees/genesis/danielmeppiel-sturdy-eureka).
SCAN DIFF.
FIND: logic bugs, missing error handling, broken invariants, off-by-one,
  null/None deref, race conditions in non-security sense, wrong control
  flow, dead branches, broken contracts vs callers.
IGNORE: security, performance, style, tests.
ANCHOR: blocker = bug that breaks main install path or corrupts
  lockfile / on-disk state. high = silent wrong result on common path.
  medium = edge-case bug. low = defensive-code gap.
PRESERVE EXACT: file paths, line refs, function names, identifiers,
  error strings, config keys.
ESCAPE TO NORMAL: never. Schema only.
EMIT one finding per line as JSONL.
SCHEMA: {sev, file, line, issue, fix}.
  sev = blocker|high|medium|low.
  issue + fix caveman, <= 25 words each.
NO PROSE OUTSIDE JSONL. ...
```

Classification: **CAVEMAN_FULL**. ROLE declaration ✓. RESPOND CAVEMAN ✓.
Imperative fragments (`SCAN DIFF.`, `FIND:`, `IGNORE:`) ✓. ANCHOR line ✓.
PRESERVE EXACT contract ✓. ESCAPE clause ✓. OUTPUT JSONL schema ✓. No
articles in operative directives. No HUMAN_RATIONALE leak.

Receipt: 7 JSONL lines, each schema-compliant, fragments ≤25 words.
**Receipt = CAVEMAN_FRAGMENT** (matches declared mode).

---

## Spawn 2 — security lens (general-purpose, sonnet-4.6) — CAVEMAN_FULL

Brief sent to `task()`:

```
ROLE: security lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff ...
SCAN DIFF.
FIND: arbitrary command execution, supply-chain trust gaps, env-var
  injection, command injection via args / shell metacharacters,
  path traversal, TOCTOU on shared config files, unvalidated inputs
  flowing to exec / subprocess / file I/O, secrets-in-code, SSRF.
IGNORE: correctness (non-security), perf, style, tests.
ANCHOR: blocker = exploitable RCE OR auth-bypass OR full supply-chain
  takeover on prod path. high = exploitable vuln with realistic
  attacker. medium = hardening gap. low = defense-in-depth nice-to-have.
PRESERVE EXACT: CWE IDs, file paths, line refs, function names,
  config field names, env var names, command strings, error strings.
ESCAPE TO NORMAL: only inside the "issue" field if a finding is an
  irreversible-destructive-action warning the human reviewer must read
  unambiguously. JSONL stream still required.
EMIT one finding per line as JSONL.
SCHEMA: {sev, cwe, file, line, issue, fix}.
  ... NO PROSE OUTSIDE JSONL. ...
```

Classification: **CAVEMAN_FULL**. All required B14b elements present
including the security-specific narrowed ESCAPE TO NORMAL clause (per
B14b AUTO-CLARITY EXCEPTIONS — security warnings).

Receipt: 8 JSONL lines, all caveman-fragments, CWE IDs preserved exact.
**Receipt = CAVEMAN_FRAGMENT** (matches).

---

## Spawn 3 — performance lens (general-purpose, sonnet-4.6) — CAVEMAN_FULL

Brief sent to `task()`:

```
ROLE: performance lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff ...
SCAN DIFF.
FIND: O(n^2) on plausible-N inputs, N+1 I/O, sync I/O on hot path,
  redundant file reads/writes, missing batching, unbounded memory
  retention, unnecessary deepcopy, inefficient data-structure choice,
  blocking call inside loop.
IGNORE: micro-opts on cold paths. IGNORE: correctness, security, style.
ANCHOR: blocker = pathological scaling on realistic install (100s of
  deps). high = quadratic on common path. ...
PRESERVE EXACT: file paths, line refs, function names, complexity
  notation (O(...)), data-structure names.
ESCAPE TO NORMAL: never. Schema only.
EMIT one finding per line as JSONL.
SCHEMA: {sev, file, line, issue, fix}. ... NO PROSE OUTSIDE JSONL. ...
```

Classification: **CAVEMAN_FULL**.

Receipt: 4 JSONL lines, caveman-fragments, complexity notation preserved.
**Receipt = CAVEMAN_FRAGMENT** (matches).

---

## Spawn 4 — style lens (explore, haiku-4.5) — CAVEMAN_FULL

Brief sent to `task()`:

```
ROLE: style lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff ...
SCAN DIFF.
STYLE ONLY: naming inconsistency, dead imports, dead code, redundant
  comments, magic numbers, pattern drift vs MCP integrator (which is
  the established sibling), docstring gaps on public APIs, type-hint
  gaps where surrounding code has them.
IGNORE: correctness, security, perf, tests.
ANCHOR: high only if pattern drift breaks a load-bearing convention
  the codebase relies on. else medium / low.
PRESERVE EXACT: file paths, line refs, identifier names, exact
  pattern used vs expected.
ESCAPE TO NORMAL: never. Schema only.
EMIT one finding per line as JSONL.
SCHEMA: {sev, file, line, issue, fix}. ...
```

Classification: **CAVEMAN_FULL** (template 5 shape from
caveman-templates.md).

Receipt: 11 JSONL lines, caveman-fragments. **Receipt = CAVEMAN_FRAGMENT**
(matches).

---

## Spawn 5 — test-coverage lens (explore, haiku-4.5) — CAVEMAN_FULL

Brief sent to `task()`:

```
ROLE: test-coverage lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff ...
SCAN DIFF.
FIND: untested code paths, untested error branches, missing edge cases
  (empty/None/large/concurrent), missing integration test for
  cross-module wire-up, asymmetry between MCP coverage and LSP coverage,
  test that asserts only happy path.
IGNORE: correctness in test code itself. IGNORE: security, perf, style.
ANCHOR: blocker = critical path with zero test. high = error branch
  with no test. medium = edge case missing. low = nice-to-have.
PRESERVE EXACT: test file paths, test function names, src file:line
  refs for the untested target.
ESCAPE TO NORMAL: never. Schema only.
EMIT one finding per line as JSONL.
SCHEMA: {sev, untested_file, untested_line, issue, fix}. ...
```

Classification: **CAVEMAN_FULL**.

Receipt: 10 JSONL lines, caveman-fragments. **Receipt = CAVEMAN_FRAGMENT**
(matches).

---

## Aggregate

| Mode | Count |
|---|---|
| CAVEMAN_ULTRA | 0 |
| **CAVEMAN_FULL** | **5** |
| CAVEMAN_LITE | 0 |
| SHORT_PROSE | 0 |
| NORMAL_PROSE | 0 |
| OTHER | 0 |
| **Total task() spawns** | **5** |

**Caveman classification rate: 5/5 = 100%**.

A/B vs v0.3.6: prior baseline (S1-v036-real) ran 9 spawns at 0/9 = 0%.
v0.3.7 puts caveman briefs on the wire as designed.

## Substrate compliance check

- ROGUE PROSE IN BRIEF (B14b anti-pattern): NOT present. The
  HUMAN_RATIONALE block in `dev/empirical-proof/cross-scenario/
  S1-triage-v037/handoff.md` is not substring of any spawn brief above.
- AUDIENCE BLEED (composition-substrate §7): NOT present. All 5 spawn
  audiences = INTERNAL with caveman briefs; the synthesizer's
  `output.md` is EXTERNAL with NORMAL prose.
- VERBOSE RECEIPT (B14b anti-pattern): NOT present. All 5 receipts are
  JSONL fragments per declared schema.
- DECOMPRESSION SKIPPED (B14c anti-pattern): NOT present. `output.md`
  is full-grammar normal prose; caveman fragments paraphrased, not
  quoted; PRESERVE-EXACT items (paths, line numbers, CWE IDs) carried
  byte-identical across the audience boundary.

## Synthesizer (spawn 6) — NOT a `task()` spawn

The synthesizer is this chat thread itself, not a fan-out spawn. Per
the PER-SPAWN DECLARATION TABLE in `handoff.md`, synthesizer mode is
NORMAL prose (EXTERNAL audience), brief mode = n/a (no spawn dispatched).
The audience boundary lives at the synthesizer's output edge, not at a
spawn edge — exactly as composition-substrate.md §7 prescribes.
