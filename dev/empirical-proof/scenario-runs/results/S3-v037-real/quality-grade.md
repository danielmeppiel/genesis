# S3-v037-real — Quality Grade

**Cell:** S3-v037-real (genesis v0.3.7, Sonnet 4.6 executor)
**Graded against:** S3-v036 baseline (10/10, $10.40, 41/41, 62 sites, 20 files)

---

## Grade: 10 / 10

### Rubric

| Dimension | Target (v0.3.6 baseline) | Achieved | Score |
|---|---|---|---|
| Files renamed | 20 | 20 | ✅ |
| Sites renamed | 62 | 62 | ✅ |
| Residual `computeTotal` refs | 0 | 0 | ✅ |
| Tests before (pass/fail) | 41 / 0 | 41 / 0 | ✅ |
| Tests after (pass/fail) | 41 / 0 | 41 / 0 | ✅ |
| Architecture | S7 single shell call | S7 single shell call | ✅ |
| Spawns | 0 | 0 | ✅ |
| Caveman dispatches | 0 | 0 | ✅ |
| Word-boundary safe rename | Yes (`\b`) | Yes (`\b`) | ✅ |
| Partial matches introduced | 0 | 0 | ✅ |

All 10 dimensions match the v0.3.6 baseline exactly.

### Deviations

None. The rename is byte-perfect: 62 `\bcomputeTotal\b` replacements,
zero over- or under-matches, all 41 tests pass before and after.

### v0.3.7 additive contract (design-plan §3)

The v0.3.7 substrate is additive on the caveman dimension and **MUST
NOT** regress S7-shape work. This run confirms the contract holds:

- The architect produced zero spawns (no new overhead from B14b/B14c
  reading load that would push toward spawn invention).
- The executor (Sonnet 4.6) completed the task in a single session
  with a single S7 shell call.
- Fixture outcome is identical to v0.3.6: 10/10.

### Cost note (see cost-report.json)

This session is the executor-only component of the two-session
v0.3.7 pattern. The architect cost (Opus 4.7, separate session) is an
amortizable infrastructure line item, not charged to this cell's
executor budget. The executor-only Sonnet 4.6 cost is the appropriate
apples-to-apples comparator vs v0.3.6's single-session Sonnet cost.
