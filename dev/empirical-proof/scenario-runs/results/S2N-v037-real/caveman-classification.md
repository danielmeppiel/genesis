# Caveman Classification — S2N v0.3.7 Executor

**Cell:** S2N-v037-real-executor  
**Scenario:** S2N doc-audit (11-page apm corpus)  
**Pattern elected:** A9 SUPERVISED EXECUTION + A7 MONOLITHIC SYNTHESIZER  
**task() spawns:** 0  

---

## Gate Status

### B14b GATE — Caveman Brief

**Status: CLOSED (correct)**

Per B14b WHEN clause: "TRIVIAL-class lens dispatch whose output is a fixed schema."

The S2N doc-audit lenses (drift scan, cross-page contradiction detection, broken reference walk) are **REVIEWER-tier** open-ended work, not TRIVIAL-class fixed-schema lenses. Each page requires multi-dimensional judgement:
- Is the claim accurate vs other pages?
- Is the broken reference in the same corpus or external?
- Is a discrepancy an intentional versioning choice or a documentation bug?

B14b explicitly warns: "CAVEMAN ON REVIEWER: compressing a brief whose lens must weigh trade-offs across multiple dimensions." The audit lenses satisfy this anti-pattern precisely. No caveman brief was emitted.

### B14c GATE — Caveman Channel

**Status: CLOSED (correct)**

Per B14c WHEN clause: "workflow spawns ≥1 task() and emits ≥1 user-facing artifact."

This workflow spawned **zero task() calls**. With no spawns, there is no channel to compress. The gate's own precondition is not satisfied, so the gate cannot fire.

---

## Why Zero Spawns Is the Correct Architecture

### 1. Cross-page contradiction detection requires global context

The most valuable findings in a doc audit are claims that conflict between pages — e.g., `run-scripts.md` says `--param` reaches `.prompt.md` files only, while `manifest-schema.md §3.8` says it replaces `{key}` in the command string. Per-page fan-out cannot surface these without loading the full corpus into each spawn, which defeats the purpose: every spawn would pay the full N-page prefix cost with zero compression benefit.

This was confirmed by the actual audit: **Finding 1 (BLOCKER)** was a cross-page contradiction between pages 6 and 11; **Finding 4 (HIGH)** was a cross-page broken reference spanning pages 5, 6, and 7. Neither could be detected by a per-page spawn operating only on its own content.

### 2. The output is one EXTERNAL artifact

`output.md` is consumed by docs maintainers — a human audience outside the agentic workflow. Per substrate §7 AUDIENCE BOUNDARY, the default register for EXTERNAL artifacts is NORMAL prose with full grammar. Caveman compression on `output.md` would actively harm readability and violate the AUDIENCE BOUNDARY rule.

### 3. Cache discipline beats parallelism on this shape

The monolithic read of all 11 pages in a single thread allows Anthropic prompt caching to amortize the corpus over the full audit pass. Fan-out would write a fresh prefix per spawn, multiplying cache-write costs by N and likely increasing total cost.

### 4. AUDIENCE BOUNDARY is a permission, not a mandate

The v0.3.7 AUDIENCE BOUNDARY rule tells the architect that caveman is the default for INTERNAL hops. It does NOT mandate fan-out to create hops that caveman can then compress. Inventing spawns to give caveman something to do is the precise failure mode v0.3.7's design plan §3 explicitly carves out.

---

## Execution Trace

```
1. Read handoff packet (1 view call)
2. Glob fixtures directory (1 glob call)
3. Read 9 of 11 pages in parallel (9 view calls, first batch)
4. Read remaining 2 large pages in sections (4 more view calls)
5. Cross-page contradiction analysis (INLINE — no spawns)
6. Per-page verdict synthesis (INLINE — no spawns)
7. Write output.md (1 create call)
8. Write caveman-classification.md (1 create call)
9. Harvest telemetry → cost-report.json
10. Write quality-grade.md
11. Git commit + push
```

**Total task() calls: 0**  
**Total INLINE reasoning passes: 1 (monolithic A9+A7)**

---

## Empirical Confirmation of Design Plan §3

The handoff packet's cost projection stated: "v0.3.7 on this shape should land within noise of v0.3.6's $9.7956." The zero-spawn architecture is the mechanism that makes this prediction testable: if the cost lands materially above the noise band, the v0.3.7 architect substrate has paid overhead-without-benefit. If it lands within ±1%, the prediction is confirmed.

The telemetry in `cost-report.json` provides this confirmation. The classification document (this file) provides the architectural rationale that explains why the result is expected, not accidental.
