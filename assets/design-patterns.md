# TIER 2 -- Design patterns (GoF axes, AI-native)

The catalogue an architect picks from when shaping ONE piece of work.
Cut on the same three axes the Gang-of-Four uses for object-oriented
design patterns (Creational / Structural / Behavioral), so a classical
software architect lands on familiar ground.

Each entry: AI-native name, classical analog, when, mechanism, anti-
patterns. Tier-3 architectural patterns COMPOSE these. Tier-1 idioms
realize them in a specific harness.

---

## Where each pattern lives

```
                    +---------------------------------+
                    |  TIER 2 design patterns         |
                    +---------------------------------+
                    |                                 |
   CREATIONAL              STRUCTURAL                 BEHAVIORAL
   (how primitives         (how primitives            (how primitives
    come into being)        compose at rest)           interact at run)
   ----------                ----------                ----------
   LAZY ASSET                COMPOSED MODULE           FAN-OUT + SYNTHESIZER
   PERSONA PRELOAD           DEPENDENCY ADAPTER        CONDITIONAL DISPATCH
   THREAD SPAWN              ORCHESTRATOR FACADE       SUPERVISOR
   DESCRIPTION DISPATCH      VALIDATION DECORATOR      PLAN MEMENTO
   PERSONA PROTOTYPE         LAZY PROXY                ACCEPTANCE OBSERVER
                             RULE BRIDGE               PROMPT TEMPLATE
                                                       TODO COMMAND
                                                       ATTENTION ANCHOR (*)
```

(*) ATTENTION ANCHOR has no classical analog. It is the LLM-physics-
native cure for goal drift on long sessions and earns first-class
status in the catalogue.

---

# Creational patterns

How primitives, threads, and personas come into being.

## C1. LAZY ASSET

CLASSICAL ANALOG: Lazy Initialization.

WHEN: a MODULE ENTRYPOINT bundles knowledge that only some invocations
need. Loading it eagerly inflates every session.

MECHANISM: the SKILL.md body names the asset by relative path; the
agent loads it only when the process step that needs it executes. The
asset stays out of context until then.

ANTI-PATTERN: EAGER BLOAT -- inlining the asset into SKILL.md "for
convenience". Every dispatch hit pays the load cost.

---

## C2. PERSONA PRELOAD

CLASSICAL ANALOG: Constructor / object initialization.

WHEN: a thread needs a stable lens for the duration of its session.

MECHANISM: the harness loads a PERSONA SCOPING FILE at session start,
biasing all subsequent inference. The persona is the constructor that
"new"s up the thread's identity.

ANTI-PATTERN: MID-SESSION PERSONA SWAP -- swapping persona text mid-
session. The earlier persona's tokens still occupy attention; the
swap produces a hybrid lens that is neither.

---

## C3. THREAD SPAWN

CLASSICAL ANALOG: Factory Method (the runtime is the factory; the
spawn call returns a fresh execution unit with its own context).

WHEN: a unit of work benefits from a fresh context window -- isolation
from siblings, full attention on its own scope.

MECHANISM: parent invokes the harness's spawn affordance with a task
description and (optionally) a persona / module to load at startup.
Child runs, returns a value, exits.

ANTI-PATTERN: UNBOUNDED SPAWN -- letting any thread spawn any depth of
descendants. Couple with SUPERVISOR (B3) to bound the tree.

---

## C4. DESCRIPTION DISPATCH

CLASSICAL ANALOG: Service Locator (the harness's dispatcher LLM
locates the right MODULE ENTRYPOINT by signature match against
preloaded descriptions).

WHEN: any DISCOVERY-mode skill. The user does not name the skill; the
dispatcher infers it from the user's turn.

MECHANISM: at session start, the harness preloads every installed
module's frontmatter description. On each user turn, the dispatcher
chooses (probabilistically) which description best matches the
request and invokes that module.

KEY PROPERTY: DESCRIPTION = FUNCTION SIGNATURE. The description names
trigger nouns and verbs, the boundary, and the intended caller. It is
not marketing copy.

ANTI-PATTERN: DISPATCH COLLISION -- two installed modules with
overlapping descriptions. The dispatcher guesses; ~half of misses go
silent. HIGH severity finding in any review.

---

## C5. PERSONA PROTOTYPE

CLASSICAL ANALOG: Prototype.

WHEN: you need several persona variants that differ only in narrow
parameters (lens severity, output format, audience). Writing N near-
duplicate persona files duplicates the maintenance surface.

MECHANISM: one base PERSONA SCOPING FILE captures the shared lens. Each
variant is a thin file that links to the base and overrides only the
delta. At spawn time, the parent loads base + delta into the child
thread.

ANTI-PATTERN: COPY-PASTE PERSONAS -- five persona files with 80% shared
content. The shared text drifts; each lens behaves differently across
runs for unrelated reasons.

---

# Structural patterns

How primitives compose at rest. These are SOURCE-TIME relationships,
realized through the module graph (`composition-substrate.md`).

## S1. COMPOSED MODULE

CLASSICAL ANALOG: Composite.

WHEN: a high-order module's behavior is "load these N existing
modules and orchestrate them".

MECHANISM: the orchestrator module declares dependencies on the leaf
modules and loads them at the relevant process step. No content is
duplicated; each leaf evolves independently. See `composition-
substrate.md` for INLINE / LOCAL SIBLING / EXTERNAL MODULE modes.

ANTI-PATTERN: HIDDEN COUPLING -- copying a leaf's content into the
orchestrator instead of depending on it. Drift is guaranteed.

---

## S2. DEPENDENCY ADAPTER

CLASSICAL ANALOG: Adapter.

WHEN: the architect's reasoning depends on an abstract substrate (a
module-system-tool, a harness's runtime affordances) but the concrete
syntax differs across tools / harnesses.

MECHANISM: the architect persona is deliberately ignorant of the
concrete syntax. A separate adapter file (`module-system-adapters/
<tool>.md`, `runtime-affordances/per-harness/<harness>.md`) exposes the
substrate's contract in the tool's own dialect. The coder thread loads
the adapter at codegen time only.

ANTI-PATTERN: LEAKY ABSTRACTION -- the architect persona naming
`apm.yml`, `package.json`, `.cursor/rules`, etc. The reasoning becomes
non-portable; redesigning for a new harness requires editing the
architect.

---

## S3. ORCHESTRATOR FACADE

CLASSICAL ANALOG: Facade.

WHEN: an internally complex multi-step capability needs to be exposed
to the dispatcher as a single callable signature.

MECHANISM: a thin MODULE ENTRYPOINT presents one description to the
dispatcher. Its body sequences the underlying primitives (skills,
personas, threads, gates). Callers see one trigger; behind it lives
a topology.

ANTI-PATTERN: STUB ORCHESTRATION -- the facade only sequences with no
interlock, gate, or synthesis decision. It is a wrapper that adds
nothing; cut it and let callers invoke the primitives directly.

---

## S4. VALIDATION DECORATOR

CLASSICAL ANALOG: Decorator.

WHEN: a procedure produces an artifact whose correctness can be
checked deterministically before downstream steps consume it.

MECHANISM: wrap the producing step with a deterministic gate (linter,
test run, schema validator, checklist invocation). The gate decides
pass / revise. The decorated step keeps its single responsibility; the
decorator owns the verification concern.

ANTI-PATTERN: WRAPPING WITHOUT BLOCKING -- recording violations to a
log without halting. Non-blocking gates degrade to noise.

---

## S5. LAZY PROXY

CLASSICAL ANALOG: Proxy (specifically: virtual proxy / on-demand
materialization).

WHEN: a module references a heavy asset (long worked example, large
ruleset, full per-harness adapter) that should not load until a
specific step needs it.

MECHANISM: the module body holds a relative-path reference; the agent
treats the path as a placeholder and materializes the content only
at the step that consumes it. The reference acts as a stand-in proxy
that defers the real load.

DIFFERENCE FROM C1 (LAZY ASSET): C1 is the creational decision to
package an asset as deferred-load. S5 is the structural shape of the
reference itself -- a placeholder proxy that the runtime materializes
on demand. Both cooperate: declare with C1, reference with S5.

ANTI-PATTERN: PROXY SPRAWL -- pointers to pointers to pointers.
Materialize in a single hop where possible.

---

## S6. RULE BRIDGE

CLASSICAL ANALOG: Bridge (decouple abstraction from implementation so
both vary independently).

WHEN: many personas share the same hard rules (encoding, secrets,
review etiquette) but each persona has its own voice. Inlining the
rules into every persona couples voice to rules; updating one rule
requires editing N persona files.

MECHANISM: extract the rules into SCOPE-ATTACHED RULE FILEs. The
runtime auto-loads them on path / context match. Personas now vary
along the LENS axis; rules vary along the CONSTRAINT axis;
neither edits the other.

ANTI-PATTERN: BAKED-IN RULES -- repeating the encoding rule inside
every persona. Drift, then contradiction.

---

# Behavioral patterns

How primitives interact at run time.

## B1. FAN-OUT + SYNTHESIZER

CLASSICAL ANALOG: Master-Worker (also: map-reduce; thread-pool with
join + reducer).

WHEN: >=3 independent lenses with no shared state, where each lens
benefits from a fresh context window.

MECHANISM: parent spawns one CHILD-THREAD per lens (each loading its
own PERSONA PRELOAD). Each child returns a finding. Parent runs a
synthesis pass (often loading an arbitrator persona) that produces ONE
verdict.

```
parent (orchestrator + synthesizer)
   |
   +-- spawn ---> thread A (lens A) --+
   +-- spawn ---> thread B (lens B) --+
   +-- spawn ---> thread C (lens C) --+
                                      v
                                fan-in to parent
                                      |
                                      v
                                 synthesize -> single output
```

ANTI-PATTERN: FAN-OUT-IN-ONE-CONTEXT -- running all N lenses sequentially
inside a single window. Each lens contaminates the next; later lenses
inherit attention drift from earlier ones.

---

## B2. CONDITIONAL DISPATCH

CLASSICAL ANALOG: Strategy.

WHEN: a single lens, but which procedure runs depends on input
classification.

MECHANISM: parent classifies the input, then loads the matching
procedure (a different persona, a different skill, a different rule
set). Only the chosen branch's text enters context.

ANTI-PATTERN: ALL-BRANCHES-LOADED -- preloading every procedure's text
"in case". Defeats the savings; the unused branches still compete for
attention.

---

## B3. SUPERVISOR

CLASSICAL ANALOG: Mediator (also: actor supervision tree of bounded
depth).

WHEN: a long task with checkpointable subtasks where the next spawn
depends on prior results (dynamic plan).

MECHANISM: a SUPERVISOR thread is the single planner. Workers cannot
spawn peer workers (avoids unbounded fan-out). The supervisor
re-plans after each worker returns.

ANTI-PATTERN: WORKER-SPAWNS-WORKER -- decentralizes planning; tree
depth becomes uncontrolled; supervisor loses oversight.

---

## B4. PLAN MEMENTO

CLASSICAL ANALOG: Memento (capture and externalize state so it can be
restored later).

WHEN: any non-trivial work. Without externalized state, long sessions
silently drop earlier decisions.

MECHANISM: write the plan (goal, decomposition, todos, checkpoints,
acceptance criterion) to PLAN PERSISTENCE BEFORE execution begins.
Reload it at every re-grounding boundary: start of each step, return
from each spawn, after each tool failure.

```
[ planning ]                    [ persistence ]
   decide problem    -->       PLAN ARTIFACT
   decompose         -->       TODO/STATUS
   pick topology     -->       (CHECKPOINT slot)
                                       ^
[ execution ]                          |
   step k starts ---- reload ----------+
      do work
   step k ends ------ update ----------+
      (advance status)
   spawn child? --> child gets POINTER to plan slice
   return from spawn -- reload --------+
```

ANTI-PATTERN: WRITE-ONCE-NEVER-READ -- producing a plan at the start
and never reloading it. The persistence is dead weight without the
reload discipline.

---

## B5. ACCEPTANCE OBSERVER

CLASSICAL ANALOG: Observer (the acceptance criterion observes the
implementation; mismatch raises a finding).

WHEN: any non-trivial work. The cost is one gate; the catch rate is
high (drift accumulates silently throughout execution).

MECHANISM: at the END of the work, RELOAD the acceptance criterion
from PLAN PERSISTENCE. Without re-reading the implementation, list
what the criterion demands. THEN compare against the implementation.
Mismatch = drift. The reverse direction matters: reading the
implementation first biases the gate to approve.

ANTI-PATTERN: ACCEPTANCE-DRIFT -- silently editing the criterion mid-
work to match the emerging result. The criterion is now a description,
not a test. Pin it; only revise via an explicit re-plan event.

---

## B6. PROMPT TEMPLATE

CLASSICAL ANALOG: Template Method (define the skeleton; subclasses
fill in specific steps).

WHEN: many similar capabilities follow the same skeleton (preamble,
context loading, body, output schema, sign-off) but differ in narrow
slots (the lens, the target artifact, the acceptance criterion).

MECHANISM: extract the skeleton into a shared asset (often a PERSONA
SCOPING FILE or a rule file). Each capability supplies only the
slot-specific content. The template guarantees structural consistency;
the slots carry the specialization.

ANTI-PATTERN: TEMPLATE-DRIFT -- each capability re-invents the
skeleton with cosmetic variations. Integrators cannot rely on the
output shape.

---

## B7. TODO COMMAND

CLASSICAL ANALOG: Command (encapsulate intent as an object that can
be queued, replayed, undone).

WHEN: a plan decomposes into discrete units of intent that the agent
will execute over many turns and possibly across spawns.

MECHANISM: each todo carries: id, title, description, status,
optionally a staffed persona / skill, optionally dependencies on
other todos. The agent updates status as it works (pending ->
in_progress -> done | blocked). The serialized todo IS the command;
the executor is its handler.

KEY PROPERTY: a todo is dispatchable. A todo with `staff: persona-X`
or `skill: Y` realizes STAFFED PLAN (Tier 3 architectural pattern).

ANTI-PATTERN: GHOST TODOS -- creating todos and never updating their
status. The plan and the executor diverge; recovery requires re-deriving
state from artifacts.

---

## B8. ATTENTION ANCHOR

CLASSICAL ANALOG: NONE. This pattern has no faithful classical
counterpart -- it is induced by LLM physics (attention decay over
distance / over turns) rather than by software-engineering structure.
It is, however, the single most important behavioral pattern for any
non-trivial agent task.

WHEN: any session that will exceed roughly a few dozen turns, or any
plan whose acceptance criterion / hard constraints were established at
turn 0 and must still hold at turn N. Long-running tasks WITHOUT
periodic re-injection of the goal and hard constraints DRIFT silently
from initial intent. This is the dominant failure mode of agentic
work past trivial scope.

MECHANISM: the goal, the hard constraints, and the acceptance criterion
are RE-INJECTED into context at scheduled boundaries:

- start of every meaningful step,
- before any spawn,
- after any spawn returns,
- after any tool failure or error recovery,
- at any natural pause in execution.

The re-injection draws from PLAN MEMENTO (B4) -- the anchor's source
of truth lives outside the context window so it cannot itself decay.

```
turn 0    [GOAL + CONSTRAINTS injected, fresh context]
   |
turn 5    do work...
   |
turn 10   <-- re-inject GOAL + CONSTRAINTS from plan
   |
turn 15   do work, spawn child
   |
turn 16   <-- re-inject before spawn (child gets anchor in its task)
   |
turn 20   spawn returns
   |
turn 21   <-- re-inject after spawn (parent recovers focus)
   |
turn 30   acceptance check (B5 reads the same anchor)
```

COMPOSES WITH:
- PLAN MEMENTO (B4) is the storage substrate.
- ACCEPTANCE OBSERVER (B5) reads the same anchor at the end.
- SUPERVISOR (B3) re-injects the anchor on every dynamic re-plan.

ANTI-PATTERNS:
- ANCHOR DRIFT -- silently rewriting the anchor mid-session to match
  emerging results. The anchor is now a description, not a constraint.
  Only revise via an explicit re-plan event (mirror of ACCEPTANCE-DRIFT).
- OVER-ANCHORING -- re-injecting the entire plan on every turn. The
  anchor is meant to be the GOAL + the hard constraints, not the full
  plan body. Re-injecting too much defeats the savings of the original
  decomposition.
- IMPLICIT-ANCHOR -- assuming the model "remembers" the goal because
  it was stated at turn 0. Attention decays over distance; the early
  tokens lose influence. Explicit re-injection or no anchor.

WHY THIS IS FIRST-CLASS. Every other behavioral pattern assumes the
agent stays aligned with the original intent across the work. Without
ATTENTION ANCHOR, that assumption is false on any task long enough
to matter. It is the cure for the deepest LLM failure mode in
multi-step execution.

---

## Selection heuristic

When in doubt, prefer the pattern that minimizes context degradation
in any one thread.

```
1 lens, 1 procedure                        -> single sequential
                                              (no Tier-2 pattern needed)

>=3 independent lenses, no shared state    -> B1 FAN-OUT + SYNTHESIZER

procedure depends on input class           -> B2 CONDITIONAL DISPATCH

long task, dynamic plan                    -> B3 SUPERVISOR

verifiable artifact between steps          -> S4 VALIDATION DECORATOR

multi-step / multi-file / spawn-bound      -> B4 PLAN MEMENTO (always)
                                              + B8 ATTENTION ANCHOR (always)

ANY work past trivial scope                -> add B5 ACCEPTANCE OBSERVER
                                              and B8 ATTENTION ANCHOR
```

B4, B5, and B8 are orthogonal to topology choice. Combine them with
whichever creational / structural / behavioral patterns shape the work.

---

## Cross-tier hooks

- Tier-3 architectural patterns (`architectural-patterns.md`) are
  COMPOSITIONS of these design patterns plus primitives.
- Tier-1 idioms (`runtime-affordances/per-harness/*.md`) realize these
  patterns in a specific harness's syntax. Loaded only at codegen time.
- Refactor patterns (`refactor-patterns.md`) restructure modules at
  source-time -- orthogonal to the runtime topology these design
  patterns describe.
