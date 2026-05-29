# S1-triage v0.3.7 handoff packet

Scenario: 5-axis advisory PR review of microsoft/apm#1424 (LSP install pipeline,
+2363/-114 across 24 files). Advisory only — no GitHub writes. Final synthesis
is an EXTERNAL prose verdict.

Genesis version: v0.3.7 (commit fe10c98). Discipline: AUDIENCE BOUNDARY
(composition-substrate §7) + canonical caveman (B14b) + CAVEMAN CHANNEL (B14c).

---

## DESIGN

Architectural pattern: A1 PANEL (5 independent lenses, no shared state, no
sequential dependency) realized via B1 FAN-OUT + SYNTHESIZER. Five lens spawns
fan out concurrently from architect; one synthesizer (this thread) decompresses
their CAVEMAN_FRAGMENT receipts into the EXTERNAL advisory.

Composition rule applied per box:

- 5 lens spawns: REVIEWER tier, INTERNAL audience, CAVEMAN_FULL brief +
  CAVEMAN_FRAGMENT receipt. Quality lenses (correctness/security/performance)
  use sonnet-4.6 general-purpose; mechanical lenses (style/test-coverage) use
  haiku-4.5 explore (B12 MODEL ROUTER). Per `assets/caveman-templates.md`
  template 5 shape (one finding per JSONL line) for all lenses.
- Synthesizer: REVIEWER tier, EXTERNAL audience, NORMAL prose. Lives at the
  audience boundary; ingests INTERNAL JSONL receipts, emits human-readable
  advisory. (composition-substrate §7: "synthesizers sit at the boundary".)

Anti-patterns explicitly avoided:

- ROGUE PROSE IN BRIEF: HUMAN_RATIONALE is in this packet but is NOT
  copied into any spawn brief. Each SPAWN_BRIEF below is self-contained.
- AUDIENCE BLEED: lens receipts are INTERNAL (caveman); only the
  synthesizer's `output.md` is EXTERNAL (normal prose).
- CAVEMAN ON EXTERNAL: synthesizer contract explicitly mandates NORMAL prose.
- VERBOSE RECEIPT: every brief ends with "RESPOND CAVEMAN" + JSONL schema.
- DECOMPRESSION SKIPPED: external_artifact_spec demands full sentences.

---

## HUMAN_RATIONALE

(NEVER copied into any SPAWN_BRIEF. This block exists for the operator and
for future RTR readers; subagents must not see it.)

The point of this run is empirical: did v0.3.7's AUDIENCE BOUNDARY +
canonical caveman refactor (commit fe10c98) actually put caveman briefs on
the wire, vs v0.3.6's 0/9 caveman classification rate? The S1-v036-real
baseline showed a 9-spawn panel where every brief was full normal prose
because the architect leaked HUMAN_RATIONALE into the briefs. v0.3.7
fixes that by (a) defining the audience-boundary substrate concept
(composition-substrate §7), (b) making caveman canonical at the design-
pattern layer (B14b drop list + preservation contract + role-mode
persistence + output-mode contract), (c) adding B14c CAVEMAN CHANNEL as
the orchestrator-side enforcement, (d) shipping ready-made templates in
`assets/caveman-templates.md`, and (e) demanding a PER-SPAWN DECLARATION
TABLE in every handoff with ≥1 task() spawn.

For this scenario, the lens count is reduced from 9 to 5 (matching the
five axes the orchestrator named: correctness/security/performance/style/
test-coverage). The v0.3.6 panel had extra ceremony spawns (severity
classifier, dup oracle, label picker, missing-info gate) that don't
belong in a *PR review* — they're issue-triage shapes. Five lenses is the
honest fan-out width for a PR-review panel; that's the right A/B baseline
even if it changes spawn count, because the dependent variable is
CAVEMAN_* classification rate, not absolute spawn count.

Tier choices: correctness/security/performance need judgement (REVIEWER
on sonnet-4.6 general-purpose — they may have to weigh tradeoffs).
Style/test-coverage are mechanical scans against a fixed list of
patterns (REVIEWER tier but TRIVIAL-shape work — haiku-4.5 explore is
sufficient and ~3x cheaper). This is B12 MODEL ROUTER.

The PR's known BLOCKERs (from cell-F findings, used as quality bar):
SECURITY-002 (HIGH — arbitrary command execution via untrusted transitive
LSP deps) and SECURITY-005 (MEDIUM — shell metacharacter injection via
${CLAUDE_PLUGIN_ROOT} string substitution before path validation). The
synthesizer must surface both of these or the run regressed quality.

Why CAVEMAN_FRAGMENT (JSONL stream) over JSON_RECEIPT (single object)
for the lenses: a reviewer lens may emit 0..N findings on a 24-file
diff. A single-object schema forces the lens to choose ONE finding;
JSONL lets each finding be independent. This matches caveman-templates
template 5 (style lens diff scan) — and it's the right shape for any
"scan this artifact and emit findings" lens, not just style.

---

## PER-SPAWN DECLARATION TABLE

| Spawn # | Role/Lens | Audience | Tier | Model | Brief mode | Receipt mode | Justification |
|---|---|---|---|---|---|---|---|
| 1 | correctness lens | INTERNAL | REVIEWER | sonnet-4.6 (general-purpose) | CAVEMAN_FULL | CAVEMAN_FRAGMENT | judgement on logic/edge cases; JSONL stream of findings |
| 2 | security lens | INTERNAL | REVIEWER | sonnet-4.6 (general-purpose) | CAVEMAN_FULL | CAVEMAN_FRAGMENT | judgement on threat model; security escape clause active in brief |
| 3 | performance lens | INTERNAL | REVIEWER | sonnet-4.6 (general-purpose) | CAVEMAN_FULL | CAVEMAN_FRAGMENT | judgement on hot paths and complexity |
| 4 | style lens | INTERNAL | REVIEWER (mechanical) | haiku-4.5 (explore) | CAVEMAN_FULL | CAVEMAN_FRAGMENT | mechanical pattern-drift scan; B12 model router |
| 5 | test-coverage lens | INTERNAL | REVIEWER (mechanical) | haiku-4.5 (explore) | CAVEMAN_FULL | CAVEMAN_FRAGMENT | mechanical "what's not tested" scan; B12 model router |
| 6 | synthesizer (this thread) | EXTERNAL | REVIEWER | claude-opus-4.7 (architect) | n/a (no spawn) | NORMAL prose | user-facing PR advisory; AUDIENCE BOUNDARY decompression site |

Lint check (per `references/audience-boundary.md`):
- All INTERNAL rows use CAVEMAN_FULL (not NORMAL) — pass.
- Each SPAWN_BRIEF below pairs with a RECEIPT_SCHEMA — pass.
- HUMAN_RATIONALE block is above and is NOT substring of any SPAWN_BRIEF — pass.
- EXTERNAL artifact (spawn 6 output) declared NORMAL — pass.

---

## SPAWN_BRIEFS

The PR diff is 2837 lines and lives at
`dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff` in this repo
worktree. Each spawn reads it via the view tool. Prompt body sent to
`task()` is the contents of the corresponding caveman block ONLY (no
HUMAN_RATIONALE, no DESIGN section, no PER-SPAWN TABLE).

### SPAWN_BRIEF #1 — correctness lens

```caveman
ROLE: correctness lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff
  (path relative to repo root /Users/danielmeppiel/Repos/copilot-worktrees/
  genesis/danielmeppiel-sturdy-eureka).
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
NO PROSE OUTSIDE JSONL. If 0 findings, emit single line:
  {"sev":"none","file":"-","line":0,"issue":"no correctness issues found","fix":"-"}.
```

### SPAWN_BRIEF #2 — security lens

```caveman
ROLE: security lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff.
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
  sev = blocker|high|medium|low.
  cwe = "CWE-NNN" or "-".
  issue + fix caveman, <= 30 words each.
NO PROSE OUTSIDE JSONL. If 0 findings, emit single line:
  {"sev":"none","cwe":"-","file":"-","line":0,"issue":"no security issues found","fix":"-"}.
```

### SPAWN_BRIEF #3 — performance lens

```caveman
ROLE: performance lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff.
SCAN DIFF.
FIND: O(n^2) on plausible-N inputs, N+1 I/O, sync I/O on hot path,
  redundant file reads/writes, missing batching, unbounded memory
  retention, unnecessary deepcopy, inefficient data-structure choice,
  blocking call inside loop.
IGNORE: micro-opts on cold paths. IGNORE: correctness, security, style.
ANCHOR: blocker = pathological scaling on realistic install (100s of
  deps). high = quadratic on common path. medium = redundant work.
  low = cosmetic.
PRESERVE EXACT: file paths, line refs, function names, complexity
  notation (O(...)), data-structure names.
ESCAPE TO NORMAL: never. Schema only.
EMIT one finding per line as JSONL.
SCHEMA: {sev, file, line, issue, fix}.
  sev = blocker|high|medium|low.
  issue + fix caveman, <= 25 words each.
NO PROSE OUTSIDE JSONL. If 0 findings, emit single line:
  {"sev":"none","file":"-","line":0,"issue":"no perf issues found","fix":"-"}.
```

### SPAWN_BRIEF #4 — style lens

```caveman
ROLE: style lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff.
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
SCHEMA: {sev, file, line, issue, fix}.
  sev = high|medium|low.
  issue + fix caveman, <= 20 words each.
NO PROSE OUTSIDE JSONL. If 0 findings, emit single line:
  {"sev":"none","file":"-","line":0,"issue":"no style issues found","fix":"-"}.
```

### SPAWN_BRIEF #5 — test-coverage lens

```caveman
ROLE: test-coverage lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical-proof/ab-experiment-apm-1424/cell-F/pr.diff.
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
SCHEMA: {sev, untested_file, untested_line, issue, fix}.
  sev = blocker|high|medium|low.
  issue + fix caveman, <= 25 words each.
NO PROSE OUTSIDE JSONL. If 0 findings, emit single line:
  {"sev":"none","untested_file":"-","untested_line":0,"issue":"no coverage gaps found","fix":"-"}.
```

---

## RECEIPT_SCHEMAS

Schema #1 (correctness):
```json
{"sev":"blocker|high|medium|low|none","file":"<path>|-","line":"<int>|0","issue":"<= 25 words caveman>","fix":"<= 25 words caveman>"}
```

Schema #2 (security):
```json
{"sev":"blocker|high|medium|low|none","cwe":"CWE-NNN|-","file":"<path>|-","line":"<int>|0","issue":"<= 30 words>","fix":"<= 30 words>"}
```

Schema #3 (performance): same as #1.

Schema #4 (style): same as #1 with sev ∈ {high|medium|low|none}.

Schema #5 (test-coverage):
```json
{"sev":"blocker|high|medium|low|none","untested_file":"<path>|-","untested_line":"<int>|0","issue":"<= 25 words>","fix":"<= 25 words>"}
```

All five lenses emit JSONL (one object per line), no prose outside.

---

## EXTERNAL_ARTIFACT_SPEC

File: `dev/empirical-proof/scenario-runs/results/S1-v037-real/output.md`.

Audience: human PR reviewer / maintainer of microsoft/apm.

Mode: NORMAL prose, full grammar (B14b AUTO-CLARITY EXCEPTION applied to
the entire artifact: receiver is human, not subagent — composition-
substrate §7 EXTERNAL audience default).

Required sections:
1. Verdict (1 line: APPROVE / REQUEST CHANGES / BLOCK + 1-line reason).
2. Blockers (each: file:line, issue in 1-2 sentences, suggested fix).
3. High-severity (same shape).
4. Medium-severity (concise list, may be bulleted).
5. Notes (low-sev, style nits, coverage suggestions; concise).
6. Lens roll-call (one line each: correctness/security/performance/style/
   test-coverage — finding count by severity).

The synthesizer (this thread) decompresses the five JSONL streams into
this artifact. Caveman fragments are NEVER copied verbatim into the
output; they are paraphrased into normal prose. CWE IDs, file paths,
line numbers, function/identifier names are preserved byte-identical
(per B14b PRESERVE EXACT — that contract bridges the audience boundary).

Quality gate (informal): the v0.3.6 baseline caught CWE-78 (arbitrary
command execution via transitive LSP deps) and CWE-78/CWE-77 (shell
metacharacter injection via ${CLAUDE_PLUGIN_ROOT} substitution before
path validation). v0.3.7 must catch both, or the run regressed quality
and that regression must be flagged honestly in the cost-report
methodology field.
