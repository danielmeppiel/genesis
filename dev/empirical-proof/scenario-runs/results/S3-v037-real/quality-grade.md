# S3-v037 — Quality grade

**Cell:** S3-v037 (genesis v0.3.7, fe10c98).
**Rubric:** S3 rename rubric (v036 baseline: 10/10).
**Grade: 10/10.**

## Rubric scoring

| # | Criterion | Evidence | Score |
|---|---|---|---|
| 1 | All 62 sites renamed across 20 files | `grep -rcn 'calculateTotal' . \| awk -F: '$2>0 {s+=$2} END{print s}'` → **62**; `grep -rln 'calculateTotal' . \| wc -l` → **20** | 1/1 |
| 2 | `npm test` passes 41/41 | `Results: 41 passed, 0 failed` (post-rename, captured in execution log) | 1/1 |
| 3 | Zero residual `computeTotal` refs in code | `grep -rn 'computeTotal' .` → empty (no matches anywhere in src/, test/, or index.js) | 1/1 |
| 4 | No collateral damage to other identifiers | `computeTax` and `computeGrandTotal` (the two sibling functions in `src/math.js`) preserved verbatim — see verification below | 1/1 |
| 5 | Test suite still meaningful (no tests deleted/silenced) | Same 41 assertions pre and post; runner output identical structure; `computeTax` and `computeGrandTotal` assertions still execute | 1/1 |
| Total | | | **10/10** |

(Five sub-criteria were evaluated; each is binary pass/fail. The S3-v036
rubric uses the same five-axis structure summed onto a 10-point scale,
which is why a clean pass scores 10/10.)

## Collateral-damage verification

The S7 transformation used the regex `\bcomputeTotal\b` with strict
word boundaries. After execution, the two sibling identifiers in
`src/math.js` (which start with the same `compute` prefix) are
preserved byte-for-byte:

```
src/math.js:7:function computeTax(total, rate) {
src/math.js:11:function computeGrandTotal(items, taxRate) {
src/math.js:13:  return total + computeTax(total, taxRate);
src/math.js:16:module.exports = { calculateTotal, computeTax, computeGrandTotal };
test/runner.js:2:const { calculateTotal, computeTax, computeGrandTotal } = require('../src/math');
test/runner.js:43:assert(computeTax(90, 0.1) === 9, 'computeTax');
test/runner.js:44:assert(computeGrandTotal(ITEMS, 0.1) === 99, 'computeGrandTotal');
```

The `\b` boundary correctly distinguished `computeTotal` from
`computeTax` and `computeGrandTotal`. No false-positive substitutions.

## A/B vs S3-v036

| Axis | S3-v036 | S3-v037 |
|---|---|---|
| Files modified | 20 | 20 |
| Sites renamed | 62 | 62 |
| Residual `computeTotal` | 0 | 0 |
| Tests pass | 41/41 | 41/41 |
| Collateral damage | none | none |
| Quality grade | 10/10 | 10/10 |

Quality is byte-identical to v036. The two runs traverse the same
deterministic S7 path on the same fixture; the result is the same
byte-for-byte rename outcome.

## Anything below 10/10?

No. All five rubric axes pass with deterministic evidence (counts and
test runner output, not LLM judgement). The grade is not LLM-graded;
it is tool-verified per design-patterns §S7 (TOOLLESS ASSERTION
anti-pattern explicitly avoided).
