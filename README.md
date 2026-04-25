<p align="center">
  <img src="assets/branding/logo.svg" alt="genesis" width="180" />
</p>

<h1 align="center">genesis</h1>

<p align="center">
  <strong>Markdown that steers an LLM is code. Design it before you write it.</strong>
</p>

<p align="center">
  <sub>By <a href="https://github.com/danielmeppiel">Daniel Meppiel</a> &mdash; creator of <a href="https://github.com/microsoft/apm">APM</a> and the PROSE framework, author of <a href="https://github.com/danielmeppiel/agentic-sdlc-handbook"><em>The Agentic SDLC Handbook</em></a>.</sub>
</p>

<p align="center">
  <a href="https://agentskills.io"><img src="https://img.shields.io/badge/agentskills.io-spec-blue?style=flat" alt="agentskills.io"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/danielmeppiel/genesis?style=flat" alt="License"></a>
  <a href="https://github.com/danielmeppiel/genesis/stargazers"><img src="https://img.shields.io/github/stars/danielmeppiel/genesis?style=flat&color=yellow" alt="Stars"></a>
  <a href="https://github.com/danielmeppiel/genesis/commits/main"><img src="https://img.shields.io/github/last-commit/danielmeppiel/genesis?style=flat" alt="Last Commit"></a>
</p>

<p align="center">
  <a href="#the-shift">The shift</a> &middot;
  <a href="#the-hook">A worked failure</a> &middot;
  <a href="#install">Install</a> &middot;
  <a href="#the-substrate">Substrate</a> &middot;
  <a href="#the-patterns">Patterns</a> &middot;
  <a href="#the-discipline">Discipline</a> &middot;
  <a href="#works-with">Targets</a>
</p>

---

Most agent skills, agents, and instruction files are written like prose for humans. They are not. They are **code for an inferencing engine** with a finite context window, an attention drop-off, and a probabilistic output distribution. Without an architectural discipline they dilute into context bloat, cross-contaminated lenses, and quietly drifting outputs.

`genesis` is the design discipline that comes before authoring. It teaches your agent to think like a software architect first: **name the substrate, choose a pattern, draw the diagram, persist the plan &mdash; then write the file.**

## The shift

Authoring agentic primitives is no longer a writing job. It is an architecture job. *The Agentic SDLC Handbook* names the role transition explicitly:

> "AI is a capable but amnesiac engineer that needs explicit context to do useful work."  
> &mdash; *The Agentic SDLC Handbook*, [ch 8: The Practitioner's Mindset](https://github.com/danielmeppiel/agentic-sdlc-handbook/blob/main/handbook/ch08-the-practitioners-mindset.qmd)

Three roles fall out of that observation:

- **Architect** &mdash; you design the work before any agent writes a line. You decide which primitives exist, how they compose, and which run in their own threads.
- **Reviewer** &mdash; you verify the output against an acceptance criterion you wrote *before* you saw the result.
- **Escalation handler** &mdash; you absorb the cases the agent cannot, with enough context loaded to be useful.

Genesis is the discipline you apply when you are wearing the architect hat. It gives you a vocabulary, a pattern catalogue, a composition model, and a persisted-plan loop &mdash; because **LLMs forget**: as a session's context fills, attention to the early turns degrades, and the cure is an external plan the architect reloads at every re-grounding boundary.

## The hook

You design a "review panel" skill: five expert lenses run sequentially in one context window, each persona file loaded in turn, each set of findings accumulated in working notes, then a sixth arbiter persona synthesizes the verdict.

By the arbiter's turn the window contains the orchestrator wrapper, five persona files, five sets of findings, the arbiter persona, and the output template. The first persona's instructions sit thousands of tokens behind the focus point. The lenses have cross-contaminated &mdash; each one read the previous ones' findings because they share a window. The synthesis runs at the deepest point of attention degradation.

This is **pattern P2** &mdash; *fan-out + parent synthesizer* &mdash; applied as if it were P1. Each lens should spawn into its own fresh context. The parent should be the only writer to the output sink. The arbiter should run on a fresh thread loaded with structured returns, not on a thread that has played five other roles.

**[Read the full re-architecture &rarr;](assets/worked-example-review-panel.md)**

## Install

One line via [APM](https://github.com/microsoft/apm):

```bash
apm install danielmeppiel/genesis
```

Or drop the files into your harness's skills folder manually.

Then ask your agent:

> *"Use the genesis-architect persona and the genesis discipline to design a [thing you want]."*

The agent will produce: a goal statement, a substrate-named breakdown, a justified pattern choice, a mermaid UML, an acceptance criterion, and a persisted plan &mdash; before writing a single primitive file.

---

## The substrate

Six concepts the architect always uses. Every harness implements them under different folder names. Genesis names them once.

| Concept | What it is | Industry term |
|---|---|---|
| **PERSONA SCOPING FILE** | A document loaded at session start to scope WHO the agent is. | "agent file", "subagent", "mode" |
| **MODULE ENTRYPOINT** | A bundled, self-contained capability with assets and a contract. | "skill" ([agentskills.io](https://agentskills.io)) |
| **SCOPE-ATTACHED RULE FILE** | A constraint that auto-applies to a path or context. | "instruction", "rule", "memory" |
| **CHILD-THREAD SPAWN** | A primitive that creates a new context window running in parallel. | "subagent thread", "Task tool" |
| **TRIGGER ORCHESTRATOR** | A declarative pipeline that runs primitives on events. | "workflow", "hook", "automation" |
| **PLAN PERSISTENCE** | A stable artifact (file or DB) holding the active plan across turns. | "plan.md", "TODO state", "checkpoints" |

These names are deliberately generic. The discipline must outlive any one tool.

The composition model adds five more concepts (MODULE, DEPENDENCY, TRANSITIVE CLOSURE, VERSION PINNING, PORTABILITY MODE) and names the recurring failure modes it prevents &mdash; **DUPLICATED LEAF** (the same paragraph copy-pasted across N primitives) and **TRANSITIVE BLOAT** (a thin wrapper module pulling in a heavy dependency closure). See [`assets/composition-substrate.md`](assets/composition-substrate.md).

## The patterns

Eight reusable topologies the architect picks from. P8 is orthogonal to the rest &mdash; combine it with whichever topology fits.

| # | Name | When |
|---|---|---|
| **P1** | Single-loop sequential | One lens, one procedure |
| **P2** | Fan-out + parent synthesizer | >= 3 independent lenses, no shared state |
| **P3** | Conditional dispatch | Single lens, procedure depends on input class |
| **P4** | Validation gate | Output verifiable before it proceeds |
| **P5** | Supervisor / worker | Long task, dynamic plan, bounded delegation |
| **P6** | Orchestrator + persisted artifact | Work spans multiple trigger events |
| **P7** | Composed module (depend, don't duplicate) | A primitive you need already exists |
| **P8** | Plan-first with persisted plan | *Orthogonal:* combine whenever attention decay risks the work |

Full catalogue with mermaid sketches, interlock requirements, anti-patterns, and a selection heuristic: [`assets/architecture-patterns.md`](assets/architecture-patterns.md).

## The discipline

The architect's loop. Eight steps; the persisted plan is non-negotiable.

```
1.  STATE GOAL          --> one sentence, observable outcome
2.  NAME SUBSTRATE      --> which concepts will you use?
3.  PICK PATTERN        --> P1..P8, justify in one line
3.5 COMPOSE OR BUILD?   --> can an existing module satisfy this?
4.  DRAW UML            --> mermaid, validate it renders
5.  ACCEPTANCE          --> what proves it works?
6.  PERSIST PLAN        --> write plan.md (or equivalent) BEFORE coding
7.  IMPLEMENT           --> author files; commit
7b. RELOAD PLAN         --> on every meaningful turn, re-read the plan
8.  STOP CONDITION      --> ship, or stop the design
```

Steps 6 and 7b cure the amnesia. Without the reload, the persistence is dead weight; without the persistence, the reload has nowhere to ground. Claude Code, Cursor, and Copilot all reinvented this loop internally. Genesis names it once.

## Works with

| Harness | Persona file format | Skill folder | Adapter |
|---|---|---|---|
| **Claude Code** | `.claude/agents/*.md` (subagents) | `.claude/skills/` | [adapter](assets/runtime-affordances/per-harness/claude-code.md) |
| **GitHub Copilot CLI** | `.github/agents/*.agent.md` | `.github/skills/` | [adapter](assets/runtime-affordances/per-harness/copilot.md) |
| **Cursor** | `.cursor/rules/*.mdc` | `.cursor/skills/` | [adapter](assets/runtime-affordances/per-harness/cursor.md) |
| **OpenCode** | `.opencode/agent/*.md` | `.opencode/skills/` | [adapter](assets/runtime-affordances/per-harness/opencode.md) |
| **Codex** | `AGENTS.md` files | `~/.codex/skills/` | [adapter](assets/runtime-affordances/per-harness/codex.md) |

The substrate is the same. Only the file names change.

## Read the canon

`genesis` is the executable companion to *[The Agentic SDLC Handbook](https://github.com/danielmeppiel/agentic-sdlc-handbook)* &mdash; specifically:

- [ch 8: The Practitioner's Mindset](https://github.com/danielmeppiel/agentic-sdlc-handbook/blob/main/handbook/ch08-the-practitioners-mindset.qmd) &mdash; the role-shift to architect / reviewer / escalation handler.
- [ch 10: The PROSE Specification](https://github.com/danielmeppiel/agentic-sdlc-handbook/blob/main/handbook/ch10-the-prose-specification.qmd) &mdash; the constraint language each substrate concept maps to.
- [ch 11: Context Engineering](https://github.com/danielmeppiel/agentic-sdlc-handbook/blob/main/handbook/ch11-context-engineering.qmd) &mdash; why MODULE ENTRYPOINT, CHILD-THREAD SPAWN, and PLAN PERSISTENCE exist.
- [ch 12: Multi-Agent Orchestration](https://github.com/danielmeppiel/agentic-sdlc-handbook/blob/main/handbook/ch12-multi-agent-orchestration.qmd) &mdash; the theory the eight patterns implement.

Each substrate concept earns its place against PROSE: lazy assets in MODULE ENTRYPOINT are *Progressive Disclosure*; CHILD-THREAD SPAWN is *Reduced Scope*; pattern P7 is *Orchestrated Composition*; P4 is *Safety Boundaries*; cascading SCOPE-ATTACHED RULE FILEs are *Explicit Hierarchy*.

The Handbook gives you the methodology. PROSE gives you the constraint language. Genesis gives your agent the discipline. [APM](https://github.com/microsoft/apm) gives you the package manager.

## License

MIT. If this changes how you design agent primitives, I want to hear about it &mdash; find me on [GitHub](https://github.com/danielmeppiel) or [LinkedIn](https://www.linkedin.com/in/danielmeppiel/).

---

<p align="center">
  <em>"Architect first. Then write the skill."</em>
</p>
