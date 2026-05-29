# S3-v037-real — Bulk rename execution summary

**Cell:** S3-v037-real (genesis v0.3.7, commit `fe10c98` — AUDIENCE BOUNDARY
+ canonical caveman B14b/B14c). Two-session pattern: Opus architect +
Sonnet 4.6 executor (this session). Apples-to-apples replay vs S3-v036
($10.40 / 41 calls / sonnet-4.6 single-session baseline).

**Scenario:** Bulk rename `computeTotal` → `calculateTotal` across the
S2-rename JS fixture (20 files, 62 reference sites).

**Architect packet:** `dev/empirical-proof/cross-scenario/S3-rename-v037/handoff.md`.
**Architect session:** Separate Opus 4.7 session (cost amortized; out of scope
for this executor report).

---

## Result

| Metric | Value |
|---|---|
| Files modified | 20 |
| Reference sites renamed | 62 |
| Residual `computeTotal` references | **0** |
| Tests before rename | **41 passed, 0 failed** |
| Tests after rename | **41 passed, 0 failed** |
| Architecture | Single S7 DETERMINISTIC TOOL BRIDGE invocation |
| `task()` spawns | **0** |
| Caveman dispatches | **0** (no INTERNAL traffic) |

---

## Preconditions (S4 VALIDATION DECORATOR)

```
$ grep -rln 'computeTotal' . | wc -l
      20

$ grep -rcn 'computeTotal' . | awk -F: '$2>0 {s+=$2} END{print s}'
62

$ node test/runner.js
Results: 41 passed, 0 failed
TEST SUITE PASSED
```

All three precondition gates passed.

---

## S7 Rename (single shell call)

```bash
grep -rl 'computeTotal' . | xargs perl -i -pe 's/\bcomputeTotal\b/calculateTotal/g'
```

The `\b` word-boundary anchors protect against partial matches (e.g.,
`computeTotalTax` would be left untouched). No LLM regeneration of file
contents — `perl -i` owns the mutation.

---

## Postconditions (S4 VALIDATION DECORATOR)

```
$ grep -rln 'computeTotal' . | wc -l
       0

$ grep -rln 'calculateTotal' . | wc -l
      20

$ grep -rcn 'calculateTotal' . | awk -F: '$2>0 {s+=$2} END{print s}'
62

$ node test/runner.js
Results: 41 passed, 0 failed
TEST SUITE PASSED
```

All four postcondition gates passed. Zero residual `computeTotal` references.

---

## Files renamed (20 files, 62 sites)

```
index.js
src/analytics.js   src/budget.js      src/cart.js        src/checkout.js
src/compare.js     src/discount.js    src/export.js      src/invoice.js
src/math.js        src/notification.js src/order.js      src/pricing.js
src/refund.js      src/report.js      src/subscription.js src/tax.js
src/utils.js       src/wishlist.js
test/runner.js
```

---

## A/B comparison vs v0.3.6 baseline

| Cell | Model | Cost (USD) | Calls | Files | Sites | Tests | Architecture |
|---|---|---|---|---|---|---|---|
| S3-v036 | sonnet-4.6 | $10.40 | 41 | 20 | 62 | 41/41 | Single S7 |
| S3-v037-real (executor) | sonnet-4.6 | see cost-report.json | — | 20 | 62 | 41/41 | Single S7 |

All fixture metrics match exactly: 20 files, 62 sites, 41/41 tests, 0 residual refs.
The S7 DETERMINISTIC TOOL BRIDGE shape is preserved; no spawns introduced.
