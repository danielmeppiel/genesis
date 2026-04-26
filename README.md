<p align="center">
  <img src="assets/branding/logo.svg" alt="genesis" width="180" />
</p>

<h1 align="center">genesis</h1>

<p align="center">
  <strong>Markdown that steers an LLM is code. Design it before you write it.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/danielmeppiel/genesis?style=flat" alt="License"></a>
  <a href="https://github.com/danielmeppiel/genesis/commits/main"><img src="https://img.shields.io/github/last-commit/danielmeppiel/genesis?style=flat" alt="Last Commit"></a>
</p>

Genesis ports the software architect's role to agentic systems -- decomposition, contracts, and
cross-cutting concerns applied to workflows where LLMs are the runtime -- plus two patterns
classical architecture never needed, because attention degrades over distance and context windows
are not memory.

## Install

```bash
apm install danielmeppiel/genesis
```

Genesis ships through [apm](https://github.com/microsoft/apm), a package manager for AI agent primitives. Adapters cover Claude Code, GitHub Copilot CLI, Cursor, OpenCode, and Codex (see [Runtimes](#runtimes)).

> **Recommended companion when you ship modules through APM:** `apm install microsoft/apm/packages/apm-guide`. Genesis stays deliberately ignorant of manifest syntax (`apm.yml`, lockfiles, CLI commands); the companion supplies that vocabulary at codegen time. If you prefer a different module system, genesis will ask before emitting any manifest -- or fall back to raw-file output. See [Step 7b in SKILL.md](SKILL.md#step-7b---draft-natural-language-modules-caller-side).

---

## You've felt this

If you've built anything non-trivial with AI coding agents, one of these has happened to you:

- **The instruction file that grew teeth.** Your `CLAUDE.md` (or `.cursor/rules`, or `.github/copilot-instructions.md`) was forty lines. It is now four hundred. The agent ignores half of it and you cannot tell which half. *(No seam was named before writing began. Single Responsibility violated from the first commit.)*
- **Great at turn one, confidently wrong by turn twenty.** The early constraints slid out of attention as the later notes piled up. Re-pasting holds for two turns, then drifts again. *(Attention decay: the failure mode with no classical analog. Tokens far from focus lose influence on inference; the constraint is in the file but no longer steers the output.)*
- **The same paragraph in four places.** A convention copy-pasted across a skill, an instruction file, and a slash command. You edited one of them last week. The agent now contradicts itself depending on which one fires. *(Shotgun Surgery from hidden coupling. R3 EXTRACT promotes shared text to a module; dependents link to it. See [refactor-patterns.md](assets/refactor-patterns.md).)*
- **You can't describe the shape you built.** You wired up agents, skills, rules, and slash commands until something worked. Now a teammate asks how it's structured and the only honest answer is "it grew." There is no vocabulary for the primitives you composed, no pattern you can name, no review you can run on your own design. *(The architectural void. The same situation software engineering was in before "architecture" was a teachable craft. The questions you would ask of any non-trivial system -- what are the components? where are the seams? which patterns govern the dynamics? where do contracts live? -- have no agreed answers in the AI-coding-agent world. So most people skip the questions.)*

If two of these landed, keep reading.

---

## The same skill, three prompts, three justified shapes

Genesis answers those questions: it ports the architect's mental model to AI-coding-agent systems. Components, seams, patterns, contracts, refactor moves -- all named, all citable, all subject to a discipline you can run on your own designs.

Here is what that looks like in practice. Three cold-load runs of the genesis skill, same skill loaded into a fresh context, three different operator prompts, three materially different (and justified) output architectures:

| Operator prompt (excerpt) | Output shape | Patterns selected (and rejected) | Worked example |
|---|---|---|---|
| "Draft release notes from CHANGELOG entries" | 6 files: 1 skill + 2 assets + 3 scripts; single thread | A9 SUPERVISED EXECUTION + S7 BRIDGE + S4 SCHEMA GATE. A1 PANEL **rejected** (lens-count gate did not fire). | [examples/03](examples/03-release-notes-single-skill.md) |
| "Review every PR: gather findings and present them" | 17 primitives: 6 personas + 4 assets + 3 scripts + trigger + entrypoint + rule + evals | A6 EVENT-DRIVEN + A1 PANEL + DISSENT-WEIGHTED arbiter. R1 SPLIT considered, applied at lens content as R3 EXTRACT instead. | [examples/04](examples/04-pr-review-advisory.md) |
| "Review every PR: emit APPROVE or REJECT verdict" | 9 primitives + S7 deterministic bridges + S4 schema gate + post-emit verifier loop + graceful tool probes | Regime change: A9 + S7 + S4 hardened. A8 ALIGNMENT LOOP, B5 ESCALATION, R1 SPLIT all **considered and rejected with WHEN-clause grounding**. | [examples/05](examples/05-pr-review-verdict.md) |

Notice row 3: removing the operator's "gather and present, never decide" constraint flipped the system from advisory to consequential. Genesis hardened the existing pipeline with deterministic bridges and a verifier loop -- it did NOT reach for new orchestration patterns. **That restraint is the discipline being demonstrated.** Most prompt-engineering tools never show their rejection logic, so you cannot tell whether a design is justified or arbitrary.

Each example is the verbatim output of a fresh agent session that loaded only `SKILL.md` and the operator prompt. No prior context. No human cleanup.

---

## The architect's role, ported

The six decisions a software architect makes map to AI-coding-agent systems row for row. The code is Markdown; the runtime is an LLM; the structural failure modes are the same.

| Classical concern | Agent-architect equivalent | Genesis deliverable |
|---|---|---|
| Greenfield design | Partition a goal into agents, skills, and instruction scopes; define execution boundaries | Skill dependency graph + handoff packet + plan.md |
| Service decomposition | Identify where one agent ends and another begins; prevent skill coupling | Primitive dependency graph + R1 SPLIT (decompose oversized skill) when seams drift |
| Integration and contracts | Design skill inputs, outputs, and agent-to-agent handoffs | Interface sketch (trigger, inputs, outputs) + sequence diagram |
| Cross-cutting concerns | Auth context, safety rails, encoding rules that apply across all agents | Shared SCOPE-ATTACHED RULE FILEs + RULE BRIDGE pattern |
| Refactoring strategy | Identify drifted skills and conflicting instruction files; pay prompt debt | Skill refactor plan using R1-R4 patterns (see [refactor-patterns.md](assets/refactor-patterns.md)) |
| Architecture review | Evaluate proposed designs for consistency; prevent prompt sprawl | PANEL pattern (multi-lens review) + severity-rubric compliance check |

What genesis produces is not the file you eventually write. It is the **structured handoff packet** that comes BEFORE the file: pattern citations with WHEN-clause justification, tradeoff resolutions citing pattern matrices, an SoC pass, a phantom-dependency check, and a portability check. The file you write afterward is the easy part.

---

## Primitives

Every harness implements the same six concepts under different folder names. Genesis names them once so the vocabulary outlives any one tool.

| Concept | What it is | Common terms |
|---|---|---|
| **PERSONA SCOPING FILE** | A document loaded at session start to scope who the agent is. | "agent file", "subagent", "mode" |
| **MODULE ENTRYPOINT** | A bundled, self-contained capability with assets and a contract. | "skill", "module" |
| **SCOPE-ATTACHED RULE FILE** | A constraint that auto-applies to a path or context. | "instruction", "rule", "memory" |
| **CHILD-THREAD SPAWN** | A primitive that creates a new context window running in parallel. | "subagent thread", "Task tool" |
| **TRIGGER ORCHESTRATOR** | A declarative pipeline that runs primitives on events. | "workflow", "hook", "automation" |
| **PLAN PERSISTENCE** | A stable artifact (file or DB) holding the active plan across turns. | "plan.md", "TODO state", "checkpoints" |

These names are deliberately generic. The architecture must outlive any one tool.

---

## Patterns

Genesis maps the Gang-of-Four onto agent design. The classical name is your Rosetta Stone; the AI-native name encodes the LLM-physics specifics (context isolation, attention decay).

| GoF axis | Classical | AI-native | When |
|---|---|---|---|
| Creational | Factory Method | THREAD SPAWN | Work benefits from a fresh context window |
| Structural | Facade | ORCHESTRATOR FACADE | A multi-step capability needs to look like one signature |
| Behavioral | Master-Worker | FAN-OUT + SYNTHESIZER | >=3 independent lenses, no shared state |
| Behavioral | *(no analog)* | **ATTENTION ANCHOR** | Re-inject goal + constraints at every re-grounding boundary |

**ATTENTION ANCHOR is the LLM-physics-native pattern with no classical counterpart**: without periodic re-injection of goal and hard constraints, long sessions silently drift from the original intent. It is the highest-leverage behavioral pattern for any non-trivial agent task.

Full catalogue (19 design patterns + 6 architectural patterns + 4 refactor patterns): [`assets/design-patterns.md`](assets/design-patterns.md), [`assets/architectural-patterns.md`](assets/architectural-patterns.md), [`assets/refactor-patterns.md`](assets/refactor-patterns.md).

---

## The architect's loop

```
1.  STATE GOAL          --> one sentence, observable outcome
2.  NAME PRIMITIVES     --> which substrate concepts will you use?
3.  PICK PATTERN        --> architectural shape, then design patterns; justify in one line
3.5 COMPOSE OR BUILD?   --> can an existing module satisfy this?
4.  DRAW UML            --> mermaid, validate it renders
5.  ACCEPTANCE          --> what proves it works?
6.  PERSIST PLAN        --> write plan.md (or equivalent) BEFORE coding
7.  IMPLEMENT           --> author files; commit
7b. RELOAD PLAN         --> on every meaningful turn, re-read the plan
8.  STOP CONDITION      --> ship, or stop the design
```

Steps 6 and 7b are non-negotiable. They realize **PLAN MEMENTO** (state outside the context window) and **ATTENTION ANCHOR** (re-inject goal + constraints on every meaningful turn). Together they defeat the silent drift that ends most long agent sessions.

---

## Runtimes

| Harness | Persona file format | Skill folder | Adapter |
|---|---|---|---|
| **Claude Code** | `.claude/agents/*.md` | `.claude/skills/` | [adapter](assets/runtime-affordances/per-harness/claude-code.md) |
| **GitHub Copilot CLI** | `.github/agents/*.agent.md` | `.github/skills/` | [adapter](assets/runtime-affordances/per-harness/copilot.md) |
| **Cursor** | `.cursor/rules/*.mdc` | `.cursor/skills/` | [adapter](assets/runtime-affordances/per-harness/cursor.md) |
| **OpenCode** | `.opencode/agent/*.md` | `.opencode/skills/` | [adapter](assets/runtime-affordances/per-harness/opencode.md) |
| **Codex** | `AGENTS.md` files | `~/.codex/skills/` | [adapter](assets/runtime-affordances/per-harness/codex.md) |

The primitives are the same. Only the file names change.

---

## Read more

- [`examples/`](examples/) -- five worked designs with operator prompts, pattern reasoning, and considered-and-rejected alternatives.
- [`SKILL.md`](SKILL.md) -- the skill itself; the eight-step process and progressive-disclosure protocol.
- [`agents/genesis-architect.agent.md`](agents/genesis-architect.agent.md) -- the persona file.
- [`assets/`](assets/) -- the loadable knowledge base (primitives, patterns, anti-patterns, refactor moves, runtime affordances).

---

**MIT licensed.** If two failure modes above matched something you ship, [open an issue](https://github.com/danielmeppiel/genesis/issues/new) with which one -- that is the data that shapes the next pattern.
