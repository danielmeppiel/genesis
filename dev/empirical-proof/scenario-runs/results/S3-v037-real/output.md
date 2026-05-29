# S3-v037-real — Bulk rename execution summary

**Cell:** S3-v037 (genesis v0.3.7, commit `fe10c98` — AUDIENCE BOUNDARY
+ canonical caveman B14b/B14c).
**Scenario:** Bulk rename `computeTotal` → `calculateTotal` across the
S2-rename JS fixture.
**Architect packet:** `dev/empirical-proof/cross-scenario/S3-rename-v037/handoff.md`.

## Result

| Metric | Value |
|---|---|
| Files modified | 20 |
| Reference sites renamed | 62 |
| Residual `computeTotal` references | 0 |
| Tests before rename | 41 passed, 0 failed |
| Tests after rename | 41 passed, 0 failed |
| Architecture | Single S7 DETERMINISTIC TOOL BRIDGE invocation |
| `task()` spawns | 0 |
| Caveman dispatches | 0 (no INTERNAL traffic) |

## Execution path

One shell invocation, no LLM-side regeneration of file contents:

```bash
grep -rl 'computeTotal' . | xargs perl -i -pe 's/\bcomputeTotal\b/calculateTotal/g'
```

The `\b` word boundaries protect against accidental partial matches.
Pre- and post-conditions were verified deterministically (`grep -c`
and `npm test`), per the architect's S4 VALIDATION DECORATOR
contract.

## Files renamed

```
index.js
src/analytics.js  src/budget.js   src/cart.js     src/checkout.js
src/compare.js    src/discount.js src/export.js   src/invoice.js
src/math.js       src/notification.js              src/order.js
src/pricing.js    src/refund.js   src/report.js   src/subscription.js
src/tax.js        src/utils.js    src/wishlist.js
test/runner.js
```

## A/B comparison vs v0.3.6 baseline

| Cell | Cost (USD) | Calls | Files | Sites | Tests | Architecture |
|---|---|---|---|---|---|---|
| S3-v036 | 10.399 | 41 | 20 | 62 | 41/41 | S7 single-shell-call |
| S3-v037 | _see cost-report.json_ | _see cost-report.json_ | 20 | 62 | 41/41 | S7 single-shell-call |

The two runs traverse byte-identical execution paths on the fixture.
Any cost delta is architect-side (substrate reading load) only,
because no spawns and no caveman dispatches occur in either run.

## Why caveman did not fire

Per the v0.3.7 design plan §3 contract: B14b/B14c only apply to
INTERNAL traffic between an orchestrator and `task()` sub-agents. With
zero spawns there is no INTERNAL hop. Every artifact this run produces
is EXTERNAL (renamed source for developers, this summary for the
empirical-proof corpus, cost JSON for telemetry). Per
composition-substrate §7, EXTERNAL artifacts default to normal prose;
applying caveman to them would be the explicit anti-pattern
B14b/CAVEMAN-ON-EXTERNAL.

This is the second empirical confirmation (after S3-v036 itself) that
v0.3.7 does not push the architect to manufacture spawns just to give
the new caveman patterns something to compress. See
`caveman-classification.md` for the full classification record.
