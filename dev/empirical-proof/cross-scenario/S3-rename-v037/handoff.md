# S3-rename-v037 — Architect Handoff Packet

**Cell:** S3-v037 (genesis v0.3.7, commit fe10c98)
**Scenario:** Bulk rename `computeTotal` → `calculateTotal` across the
S2-rename fixture (20 JS files, 62 reference sites). Acceptance: rename
applied, `npm test` green (41/41 baseline). External artifact: the
renamed source code (humans read it).
**A/B baseline:** S3-v036 = $10.40, 41 cloud-session-store calls,
2.98M input / 17.9k output / 2.89M cache_read tokens, sonnet-4.6.

---

## HUMAN_RATIONALE (kept here, NEVER copied into a spawn brief)

### Pattern fit

The work is a deterministic textual transformation across a known file
set. Per design-patterns §S7 (DETERMINISTIC TOOL BRIDGE) selection
heuristic: "If a design step contains the words 'apply' [...]
'compute', 'verify', or names a system of record [...] file system,
it MUST cross S7." Bulk source-code rename hits two of those triggers
(`apply` rename, file-system mutation) and zero of the LLM-layer
triggers (no "decide / compose / summarize / propose / weigh").

The right shape is therefore a single S7 invocation:

```
grep -rl 'computeTotal' <fixture> | xargs perl -i -pe 's/\bcomputeTotal\b/calculateTotal/g'
```

executed by the harness shell tool, followed by a deterministic
`npm test` validation. Both calls are TOOL-OWNED. The LLM owns
parameter selection (the symbol pair, the fixture root, the regex
boundary `\b`) but does not own execution and does not paraphrase the
result.

### Spawn count: 0

No `task()` spawns. The S7 bridge short-circuits the entire
PANEL/PIPELINE shape because there is no judgement to compose, no
multi-lens review, no synthesis. The architect has nothing to dispatch
that the shell cannot do faster, cheaper, and with zero variance.

### Where caveman would fire (and why it doesn't here)

B14b CAVEMAN BRIEF and B14c CAVEMAN CHANNEL govern INTERNAL traffic
between the orchestrator and TRIVIAL/REVIEWER-tier sub-agents. With
zero spawns there is no INTERNAL hop to compress. Per
composition-substrate §7 (AUDIENCE BOUNDARY): "INTERNAL artifacts
default to compressed form (caveman per B14b/B14c); EXTERNAL artifacts
default to normal prose." In this scenario every artifact is EXTERNAL:

| Artifact | Audience | Mode |
|---|---|---|
| Renamed source files | EXTERNAL (developers read the code) | NORMAL |
| `npm test` output (operator log) | EXTERNAL (operator) | NORMAL |
| `output.md` summary | EXTERNAL (reader of the empirical-proof corpus) | NORMAL |
| `cost-report.json` | EXTERNAL (telemetry consumer) | structured JSON, not prose |

Applying caveman to any of these would trigger
B14b/CAVEMAN-ON-EXTERNAL ("Compromises readability; user is not a
subagent") — explicitly an anti-pattern.

### v0.3.7 design-plan §3 contract

The v0.3.7 release is **additive** on the caveman dimension and **MUST
NOT** regress S7-shape work. Per the plan: S3-shape (deterministic
bulk rename) gains zero from caveman because S7 short-circuits all
spawning. This run is the second empirical confirmation (after S3-v036
on v0.3.6) that the v0.3.7 substrate does not push the architect to
manufacture spawns just to give caveman something to compress. If v037
cost lands within ±10% of v036 ($10.40), the contract holds. Higher
spend without spawn invention would indicate unjustified architect-
side overhead introduced by the AUDIENCE BOUNDARY / B14b / B14c
sections themselves (e.g., longer reading load before the architect
commits to S7).

### Risks considered, rejected

- **"Verify-rename-applied" caveman receipt sub-agent.** Tempting as a
  TRIVIAL-tier classifier ("did rename apply correctly?"). Rejected:
  the verification primitive is `grep -c` + `npm test`, both
  deterministic and already on the S7 path. A spawn here would be a
  HAND-ROLLED HALLUCINATION (S7 anti-pattern) plus B12
  WRONG-PRIMITIVE BINDING (using an LLM where a `grep` will do).
- **Per-file lens dispatch.** Would multiply cost by ~20× with zero
  added value. Rejected on token-economics §S7 grounds.
- **B12 model router on the rename "decision".** There is no decision;
  the symbol pair is given by the user. Rejected as YAGNI router.

---

## PER-SPAWN DECLARATION TABLE (per B14c)

| # | Audience | Tier | Brief mode | Receipt mode | Justification |
|---|---|---|---|---|---|
| _empty_ | _no spawns_ | — | — | — | S7 path; deterministic substrate covers the entire workflow. |

---

## SPAWN_BRIEF block

_No spawns. Block intentionally empty._

---

## EXECUTION CONTRACT (operator follows)

1. **PRECONDITION (S4 VALIDATION DECORATOR).**
   - `cd dev/empirical-proof/scenario-runs/fixtures/S2-rename/repo`
   - `grep -rln 'computeTotal' . | wc -l` MUST equal 20.
   - `grep -rcn 'computeTotal' . | awk -F: '$2>0 {s+=$2} END{print s}'` MUST equal 62.
   - `npm test` MUST report `41 passed, 0 failed`.
2. **S7 RENAME (single shell call).**
   - `grep -rl 'computeTotal' . | xargs perl -i -pe 's/\bcomputeTotal\b/calculateTotal/g'`
3. **POSTCONDITION (S4 VALIDATION DECORATOR).**
   - `grep -rln 'computeTotal' .` MUST be empty.
   - `grep -rln 'calculateTotal' . | wc -l` MUST equal 20.
   - `grep -rcn 'calculateTotal' . | awk -F: '$2>0 {s+=$2} END{print s}'` MUST equal 62.
   - `npm test` MUST report `41 passed, 0 failed`.
4. **EXTERNAL ARTIFACTS (normal prose; B14 thrift only).**
   - `dev/empirical-proof/scenario-runs/results/S3-v037-real/output.md`
     — file count, site count, test result, residual refs.
   - `dev/empirical-proof/scenario-runs/results/S3-v037-real/cost-report.json`
     — schema matches S3-v036.
   - `dev/empirical-proof/scenario-runs/results/S3-v037-real/caveman-classification.md`
     — explicit "0 spawns, caveman did not fire, S7 short-circuited" record.

---

## ANTI-PATTERN CHECK (architect self-review)

- HAND-ROLLED HALLUCINATION (§S7): N/A — rename executed by `perl -i`,
  not regenerated by LLM.
- TOOLLESS ASSERTION (§S7): N/A — file count, site count, test result
  all come from tool calls, not LLM recall.
- AUDIENCE BLEED (§7 / §B14b): N/A — every emission is EXTERNAL and
  flagged for normal prose.
- ROGUE PROSE IN BRIEF (§B14b): N/A — no spawn briefs exist.
- CAVEMAN ON EXTERNAL (§B14b): explicitly avoided; anti-pattern named.
- WRONG-PRIMITIVE BINDING (§B12): explicitly avoided in "Risks
  considered, rejected".
- DECOMPRESSION SKIPPED (§B14c): N/A — no caveman channel exists.

Verdict: **SHIP**. Single S7 shell call + S4 validation pre/post.
