# S3-v037 — caveman classification

**Cell:** S3-v037 (genesis v0.3.7, fe10c98).
**Question:** did B14b CAVEMAN BRIEF / B14c CAVEMAN CHANNEL fire on
this run? **Answer: no.**

## Counts

| Metric | Value |
|---|---|
| `task()` spawns | 0 |
| INTERNAL artifacts produced | 0 |
| EXTERNAL artifacts produced | 4 (renamed code, output.md, cost-report.json, this file) |
| Caveman briefs sent | 0 |
| Caveman receipts received | 0 |
| Caveman dispatches that should have fired but didn't | 0 |
| Spawns the architect was tempted to invent for caveman | 0 (see handoff.md "Risks considered, rejected") |

## Why zero

The scenario is a deterministic textual transformation. Per
design-patterns §S7 (DETERMINISTIC TOOL BRIDGE) selection heuristic,
the words "apply" + filesystem mutation force the work across the S7
boundary into a single shell invocation:

```
grep -rl 'computeTotal' . | xargs perl -i -pe 's/\bcomputeTotal\b/calculateTotal/g'
```

S7 short-circuits PANEL (A1) and PIPELINE (A3) shapes because there is
no judgement to compose, no multi-lens review, no synthesis. With zero
spawns there is no INTERNAL hop to compress, and B14c CAVEMAN CHANNEL
(by definition: "a workflow spawns ≥1 task() and emits ≥1 user-facing
artifact") cannot apply.

## Anti-patterns explicitly avoided

| Anti-pattern | Source | How avoided |
|---|---|---|
| HAND-ROLLED HALLUCINATION | §S7 | Rename executed by `perl -i`, not LLM-regenerated text. |
| TOOLLESS ASSERTION | §S7 | File count, site count, test pass come from tool calls. |
| WRONG-PRIMITIVE BINDING | §B12 | No model router; the symbol pair is given, no decision. |
| CAVEMAN ON EXTERNAL | §B14b | All artifacts here are EXTERNAL; normal prose preserved. |
| ROGUE PROSE IN BRIEF | §B14b | No briefs exist (no spawns). |
| AUDIENCE BLEED | composition-substrate §7 | Every artifact's audience named in handoff packet. |
| MANUFACTURED SPAWN | v0.3.7 design plan §3 | Architect rejected the "verify-rename-applied caveman receipt" sub-agent because S7's `grep -c` + `npm test` already verify deterministically. |

## v0.3.7 design-plan §3 contract — confirmation

Plan: **"S3-shape gains zero from caveman because S7 short-circuits
all spawning. The architect MUST NOT abandon S7 to give caveman
something to compress."**

Observed: architect chose S7 single-shell-call, exactly as v0.3.6.
Spawn count 0. Caveman dispatches 0. Tests 41/41. Rename byte-for-byte
identical to v0.3.6 outcome.

This is the **second empirical confirmation** that the v0.3.7
substrate is additive on the caveman dimension and does not push
spawn invention on S7-shape work. (The first confirmation is the
v0.3.6 run itself, which the v0.3.7 architect could have deviated
from but did not.)
