# Caveman Classification — S1-v037-real Executor

## Methodology

Each task() spawn below was dispatched using the verbatim content from the corresponding
SPAWN_BRIEF block in the handoff packet (CAVEMAN_FULL shape). No HUMAN_RATIONALE text was
injected. No prose inflation was applied. The brief content is the canonical caveman template
5 shape (findings scan, JSONL stream, schema-only output, no prose outside JSONL).

Classification criteria (per genesis substrate):
- **CAVEMAN_FULL**: brief is telegraphic imperative, role-first, schema-anchored, no
  explanatory prose, no HUMAN_RATIONALE leakage.
- **CAVEMAN_LITE**: abbreviated caveman — schema present but missing some structural fields.
- **PROSE_LEAK**: HUMAN_RATIONALE or explanatory prose copied into the brief.
- **OTHER**: freeform, neither schema-anchored nor prose.

---

## Spawn #1 — Correctness Lens

**Model:** claude-sonnet-4.6 (general-purpose)  
**Classification:** CAVEMAN_FULL

**First 80 chars of brief (verbatim):**
```
ROLE: correctness lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/e
```

**Structural indicators:** Role declaration on line 1; `RESPOND CAVEMAN` mode lock; imperative
READ/SCAN/FIND/IGNORE/ANCHOR/PRESERVE EXACT/EMIT/SCHEMA/NO PROSE block structure; schema
declared inline; no HUMAN_RATIONALE text present.

---

## Spawn #2 — Security Lens

**Model:** claude-sonnet-4.6 (general-purpose)  
**Classification:** CAVEMAN_FULL

**First 80 chars of brief (verbatim):**
```
ROLE: security lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empi
```

**Structural indicators:** Role declaration on line 1; `RESPOND CAVEMAN` mode lock; imperative
READ/SCAN/FIND/IGNORE/ANCHOR/PRESERVE EXACT/ESCAPE TO NORMAL/EMIT/SCHEMA/NO PROSE block
structure; CWE preservation mandate inline; security escape clause scoped narrowly to
irreversible-action warnings only; no HUMAN_RATIONALE text present.

---

## Spawn #3 — Performance Lens

**Model:** claude-sonnet-4.6 (general-purpose)  
**Classification:** CAVEMAN_FULL

**First 80 chars of brief (verbatim):**
```
ROLE: performance lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/emp
```

**Structural indicators:** Role declaration on line 1; `RESPOND CAVEMAN` mode lock; imperative
READ/SCAN/FIND/IGNORE/ANCHOR/PRESERVE EXACT/EMIT/SCHEMA/NO PROSE block structure; complexity
notation preservation mandate (O(...)); no HUMAN_RATIONALE text present.

---

## Spawn #4 — Style Lens

**Model:** claude-haiku-4.5 (explore)  
**Classification:** CAVEMAN_FULL

**First 80 chars of brief (verbatim):**
```
ROLE: style lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/empirical
```

**Structural indicators:** Role declaration on line 1; `RESPOND CAVEMAN` mode lock; imperative
READ/SCAN/STYLE ONLY/IGNORE/ANCHOR/PRESERVE EXACT/EMIT/SCHEMA/NO PROSE block structure;
pattern-drift anchor against MCP integrator sibling declared inline; no HUMAN_RATIONALE text
present.

---

## Spawn #5 — Test-Coverage Lens

**Model:** claude-haiku-4.5 (explore)  
**Classification:** CAVEMAN_FULL

**First 80 chars of brief (verbatim):**
```
ROLE: test-coverage lens. RESPOND CAVEMAN until done.
READ pr.diff at dev/emp
```

**Structural indicators:** Role declaration on line 1; `RESPOND CAVEMAN` mode lock; imperative
READ/SCAN/FIND/IGNORE/ANCHOR/PRESERVE EXACT/EMIT/SCHEMA/NO PROSE block structure; asymmetry
anchor (MCP vs LSP coverage) declared inline; no HUMAN_RATIONALE text present.

---

## Summary Table

| Spawn | Lens | Model | Classification | HUMAN_RATIONALE leaked |
|---|---|---|---|---|
| 1 | correctness | claude-sonnet-4.6 | **CAVEMAN_FULL** | No |
| 2 | security | claude-sonnet-4.6 | **CAVEMAN_FULL** | No |
| 3 | performance | claude-sonnet-4.6 | **CAVEMAN_FULL** | No |
| 4 | style | claude-haiku-4.5 | **CAVEMAN_FULL** | No |
| 5 | test-coverage | claude-haiku-4.5 | **CAVEMAN_FULL** | No |

**Result: 5/5 CAVEMAN_FULL on wire.**

This is a direct improvement over v0.3.6's S1 baseline (0/9 — all briefs were PROSE due to
HUMAN_RATIONALE leakage from the architect into the spawn briefs). The v0.3.7 AUDIENCE BOUNDARY
discipline (composition-substrate §7) + PER-SPAWN DECLARATION TABLE enforcement held: the
HUMAN_RATIONALE block in the handoff packet was read by the executor but was NOT forwarded to
any spawn.
