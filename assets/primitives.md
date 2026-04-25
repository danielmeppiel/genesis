# TIER 0 -- Substrate primitives

The six concepts every agent harness implements under different folder
names and frontmatter dialects. Genesis names them once so the
vocabulary outlives any one tool.

A primitive is a FILE the runtime loads into a thread to bias inference,
or a RUNTIME AFFORDANCE that creates / coordinates threads. Primitives
are the substrate. Tier-2 design patterns and Tier-3 architectural
patterns are built ON TOP of these.

---

## 1. PERSONA SCOPING FILE

A markdown document loaded at session start to scope WHO the agent is.
Sets voice, expertise lens, hard constraints, anti-patterns it flags.
It has no execution life of its own -- it is text loaded into a context
window.

INDUSTRY TERMS: "agent file", "subagent definition", "mode", "AGENTS.md".

WHEN TO USE: any time a body of work benefits from a stable lens (a
domain expert, a reviewer voice, an arbitrator persona).

KEY PROPERTY: orthogonal to threads. A persona is loaded INTO a thread.
A thread is not a persona. Conflating the two is the most common error
in this domain.

---

## 2. MODULE ENTRYPOINT

A bundled, self-contained capability with its own assets and a contract
(frontmatter description = function signature; body = process; assets
= lazy-loaded knowledge). The unit of REUSE.

INDUSTRY TERMS: "skill" ([agentskills.io](https://agentskills.io)),
"plugin", "command bundle".

CANONICAL SPEC. The agentskills.io project is the canonical authority
for the SKILL.md container surface. Treat the four skill-creation pages
as load-bearing input rather than background reading. Truth #5
(pretraining is frozen) applies: fetch live rather than recall.

- https://agentskills.io/skill-creation/best-practices
  -> body content, gotchas, output templates, calibrating
     prescriptiveness, procedures over declarations, refine-with-
     execution, real-expertise sourcing.
- https://agentskills.io/skill-creation/optimizing-descriptions
  -> imperative phrasing, user-intent framing, indirect-trigger
     ("be pushy") clauses, 1024-character hard cap on `description`,
     trigger-eval split (~20 queries 60/40 train/val).
- https://agentskills.io/skill-creation/evaluating-skills
  -> `evals/evals.json` schema, with-skill vs without-skill baseline,
     iteration workspace, when assertions land.
- https://agentskills.io/skill-creation/using-scripts
  -> `scripts/` directory conventions, version pinning,
     non-interactive shell requirement, `--help` doc, structured
     stdout vs diagnostic stderr.
- https://agentskills.io/specification
  -> `name` regex (1-64 chars, `[a-z0-9-]`, must equal parent dir),
     directory layout (`scripts/` + `references/` + `assets/`),
     SKILL.md body budget (<= 500 lines AND <= 5000 tokens; overflow
     to `references/` with explicit load-trigger phrasing).

WHEN TO USE: a capability that needs its own dispatch trigger, may be
invoked discoverably by the harness's dispatcher, and bundles assets
that should not pollute the parent context until needed.

KEY PROPERTY: the frontmatter description is preloaded by the harness
into every session. It is the function signature the dispatcher LLM
matches against. Treat it as code, not as marketing copy.

---

## 3. SCOPE-ATTACHED RULE FILE

A constraint that auto-applies whenever the agent operates on a matching
path or context. Cross-cutting rules ride along instead of needing to
be re-stated in every persona.

INDUSTRY TERMS: "instruction file", "rule", "memory", "always-load".

WHEN TO USE: invariants that must hold across many capabilities (encoding
rules, secret-handling, project-specific style) -- attach to the path or
glob they govern.

KEY PROPERTY: the harness controls when these load (path match, file
match). The author does not call them; the runtime injects them.

---

## 4. CHILD-THREAD SPAWN

A runtime affordance that creates a new execution unit with its OWN
fresh context window. Returns a value to the parent. Multiple may run
in parallel.

INDUSTRY TERMS: "subagent thread", "Task tool", "background agent".

WHEN TO USE: any work that benefits from CONTEXT ISOLATION -- a fresh
window where a specialized lens (its own persona, its own rule set,
its own loaded assets) sits at full attention rather than competing
with the parent's session for tokens.

KEY PROPERTY: stateless across spawns. Anything not loaded as text into
the child thread does not exist for that thread. Hand off via explicit
artifacts, not assumed memory.

COMPOUNDING GAIN. A MODULE ENTRYPOINT that is dispatched in a fresh
child thread converts a Separation-of-Concerns win into a context-
isolation win for free. This is the core argument for splitting a
god-module into specialized siblings -- each split unlocks an
independently spawnable thread.

---

## 5. TRIGGER ORCHESTRATOR

A declarative pipeline that spawns sessions in response to events
(schedule, push, comment, label, manual). Lives ABOVE the thread,
deciding when work begins and what initial context it carries.

INDUSTRY TERMS: "workflow", "hook", "automation", "trigger".

WHEN TO USE: cross-session work where a stimulus (PR opened, file
changed, time elapsed) needs to start an agent run with predefined
inputs and an upstream-side filter.

KEY PROPERTY: it is the only primitive whose execution surface is fully
declarative. It does not carry a context window itself; it dispatches
others that do.

---

## 6. PLAN PERSISTENCE

A stable artifact (file or structured store) holding the active plan,
todos, and checkpoints across turns and across spawns. The cure for
attention decay over long sessions.

INDUSTRY TERMS: "plan.md", "TODO state", "checkpoints", "session store".

WHEN TO USE: any work that is multi-step, multi-file, or spawn-bound.
Without a persisted plan, long sessions silently drop earlier decisions
and constraints; with one, every re-grounding event (start of a step,
return from a spawn, after a tool failure) is a chance to recover.

KEY PROPERTY: the plan must be RELOADED at re-grounding boundaries. A
written-once-never-read plan is dead weight. The discipline is
write-then-reload, not write-then-trust-recall.

---

## How the substrate composes

```
TRIGGER ORCHESTRATOR
        |
        v  spawns
  CHILD-THREAD SPAWN ----- spawns more child threads ----+
        |                                                |
        | loads at startup                               |
        |   PERSONA SCOPING FILE                         |
        |   MODULE ENTRYPOINT (entrypoint + lazy assets) |
        |   SCOPE-ATTACHED RULE FILE (path-matched)      |
        |                                                |
        v                                                v
   reads + writes                              reads + writes
        |                                                |
        +--------> PLAN PERSISTENCE (single source of truth)
```

Each primitive earns its keep against PROSE
([danielmeppiel.github.io/awesome-ai-native](https://danielmeppiel.github.io/awesome-ai-native/)):

| Primitive | PROSE axis it satisfies |
|---|---|
| MODULE ENTRYPOINT (lazy assets) | Progressive Disclosure |
| CHILD-THREAD SPAWN | Reduced Scope |
| Module composition (inline / sibling / external) | Orchestrated Composition |
| TRIGGER ORCHESTRATOR + validation gates | Safety Boundaries |
| Cascading SCOPE-ATTACHED RULE FILEs | Explicit Hierarchy |

---

## Primitives vs Modules (the disambiguation you enforce)

PRIMITIVE: a file the runtime loads (skill, persona, rule, orchestrator
workflow). The unit of REASONING.

MODULE: a unit of DISTRIBUTION. One or more primitives + declared
dependencies + version + identity. One primitive may itself be a
module. Conflating primitive with module hides composition: leaf
files get duplicated across projects instead of depended on as
modules. See `composition-substrate.md` for the dependency model.
