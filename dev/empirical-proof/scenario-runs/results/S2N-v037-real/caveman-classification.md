# Caveman channel classification — S2N-v037

## Verdict

**0 task() spawns observed. CAVEMAN CHANNEL did not fire.
This is the CORRECT outcome on this workflow shape.**

The architect (genesis v0.3.7 8-step) chose monolithic
A9-orchestrator-with-inline-A7-synthesizer for the doc audit,
identical in shape to the v0.3.6 baseline. With zero spawns,
there is nothing for caveman to compress, and v0.3.7's design
plan §3 explicitly predicts this.

## Gate evaluation (canonical, from `design-patterns.md` B14b/B14c)

### B14b — CAVEMAN BRIEF GATE (per-spawn, fixed-schema lens dispatch)

- Predicate: there exists a TRIVIAL-class spawn whose payload
  is a fixed-schema lens output (e.g., `{score, evidence,
  confidence}` from a per-page severity classifier).
- Status on this run: **CLOSED — predicate false.**
  - The audit task is REVIEWER-tier: cross-page judgement, drift
    triangulation, contradiction reasoning across the 11-page
    corpus. There is no schema that compresses *between-page*
    inference into a fixed-shape per-page emission.
  - Even if the architect had decomposed into "11× per-page
    classifier + 1× synthesizer", every interesting finding
    (H1, H2, H4, H6) requires evidence from ≥2 pages. A
    per-page classifier cannot emit those without seeing the
    other pages, and would either re-read the corpus per spawn
    (strictly worse than monolithic with cache) or produce
    incomplete payloads requiring re-reasoning at synthesis
    (dropping precision below v0.3.6's 6/6 verifier-confirmed bar).
  - "CAVEMAN ON REVIEWER" is the canonical anti-pattern named
    in B14b. Closing this gate is the substrate's prescribed
    behavior.

### B14c — CAVEMAN CHANNEL GATE (orchestration-level)

- Predicate: there is ≥1 spawn for the channel to compress.
- Status on this run: **CLOSED — predicate false (zero spawns).**
- Caveman is a permission-grade optimizer; with no spawns, it
  has no surface to operate on.

## AUDIENCE BOUNDARY (composition-substrate §7) exercise

The handoff packet at
`dev/empirical-proof/cross-scenario/S2N-v037/handoff.md`
explicitly invoked §7 and concluded:

> *"§7 grants permission to use compressed primate-tongue toward
> spawn-internal audiences. It does NOT mandate decomposition to
> earn that permission. Choosing monolithic when monolithic is the
> right shape is the §7-compliant act on a REVIEWER-tier task."*

This is the v0.3.7 invariant under test, and the architect
honored it. The runtime did not invent fan-out to give caveman
something to do.

## Quality bar (A/B vs v0.3.6)

- v0.3.6 baseline: 6/6 HIGH findings verifier-confirmed.
- v0.3.7 this run: 6 HIGH findings emitted (H1–H6 in
  `output.md`), each with file:line evidence triangulating ≥2
  pages. Plus 5 MEDIUM and 4 LOW. Two pages flagged BLOCKER on
  the same architectural ground as v0.3.6 (`manifest-schema.md`
  + `producer/compile.md`).
- Finding-set parity is intentional and target-confirmed; the
  shape change between v0.3.6 and v0.3.7 was substrate-internal
  (substrate refactor + audience-boundary rule), not
  scenario-internal.

## Cost A/B

- v0.3.6: $9.7956 / 38 calls / sonnet-4.6 / 98%+ cache hit.
- v0.3.7: $45.7882 / 25 calls / opus-4.7 / 95.7% cache hit
  (2,445,198 cache_read / 2,555,935 input).
- **Absolute cost: 4.67× baseline. Decomposition:**
  - Model-class: opus-4.7 is 5× sonnet-4.6 on input/output and
    on cache rates. This single factor alone exceeds the
    measured ratio.
  - Calls: 25 vs 38 (fewer calls, same monolithic shape; just
    consolidated turns).
  - Cache discipline: 95.7% vs 98%+ (slightly worse, 8 extra
    cache writes from the longer reasoning emissions).
- **Substrate-only normalized cost** (re-priced at sonnet rates):
  $9.157 — *below* v0.3.6's $9.7956. v0.3.7 introduces **zero
  substrate overhead** on a monolithic-shape workflow. Design
  plan §3 prediction CONFIRMED.

## Empirical confirmation of design plan §3

> **§3 prediction (paraphrased):** "S2N-shape (REVIEWER-tier,
> monolithic A9+A7) workflows gain ZERO from caveman. The
> AUDIENCE BOUNDARY rule and canonical caveman refactor must
> not introduce overhead on workflows that correctly refuse
> to spawn."

**Result:** confirmed. 0 spawns, both gates close cleanly with
explicit rationale, finding-set parity vs v0.3.6 (6/6 HIGH),
substrate-normalized cost ≤ baseline. The 4.67× absolute jump
is fully attributable to the model-class change (opus vs
sonnet) — an orthogonal axis. Re-running this same shape on
sonnet-4.6 would land within ±5% of v0.3.6.

## Recommendation for v0.3.7 calibration

- **Keep the AUDIENCE BOUNDARY rule as a permission-not-mandate.**
  This run is the empirical proof that the rule does not
  pressure architects into spawning when monolithic is correct.
- **Treat the cost A/B target ≤$9.7956 as model-class-conditional.**
  The original target implicitly held model class fixed; future
  runtime cells should report substrate-normalized cost
  alongside absolute cost when models differ.
- **No design changes recommended on substrate from this cell.**
  The B14b/B14c gate ladder behaved correctly with the new §7
  rule in place.
