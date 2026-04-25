<p align="center">
  <img src="assets/branding/hero.svg" alt="genesis: substrate for agentic primitives" width="600" />
</p>

<h1 align="center">genesis-skill</h1>

<p align="center">
  <strong>In the beginning was the prompt.</strong>
</p>

<p align="center">
  <em>The first-principles substrate for designing agentic primitives. From PROSE.</em>
</p>

<p align="center">
  <a href="https://github.com/danielmeppiel/genesis-skill/stargazers"><img src="https://img.shields.io/github/stars/danielmeppiel/genesis-skill?style=flat&color=yellow" alt="Stars"></a>
  <a href="https://github.com/danielmeppiel/genesis-skill/commits/main"><img src="https://img.shields.io/github/last-commit/danielmeppiel/genesis-skill?style=flat" alt="Last Commit"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/danielmeppiel/genesis-skill?style=flat" alt="License"></a>
  <a href="https://agentskills.io"><img src="https://img.shields.io/badge/agentskills.io-spec-blue?style=flat" alt="agentskills.io"></a>
</p>

<p align="center">
  <a href="#why">Why</a> &middot;
  <a href="#what-genesis-gives-you">What</a> &middot;
  <a href="#install">Install</a> &middot;
  <a href="#the-substrate">Substrate</a> &middot;
  <a href="#the-discipline">Discipline</a> &middot;
  <a href="#works-with">Targets</a>
</p>

<p align="center">
  <strong>Genesis Trinity</strong> &nbsp;&middot;&nbsp;
  <strong>PROSE</strong> <em>the language</em> &nbsp;&middot;&nbsp;
  <strong>genesis-skill</strong> <em>the substrate</em> <sub>(you are here)</sub> &nbsp;&middot;&nbsp;
  <a href="https://github.com/danielmeppiel/agentic-sdlc-handbook"><strong>Handbook</strong></a> <em>the canon</em>
</p>

---

Most agent skills, agents, and instruction files are written like prose for humans. They are not. They are **code for an inferencing engine** with a finite context window, an attention drop-off, and a probabilistic output distribution. Without an architectural discipline, your agentic primitives are spaghetti markdown that bloats context and confuses the runtime.

`genesis-skill` is the missing layer. It teaches your agent to **think like a software architect** before it writes a single skill file: name the substrate, choose a pattern, draw the diagram, persist the plan, then implement.

## Why

You ship a single 4000-token skill file that does six things. Your agent loads the whole file just to do one of them. Context fills. Attention degrades. Outputs drift.

A teammate asks: "what's the difference between an agent file, a skill, and an instruction file?" You don't have a vocabulary to answer because nobody has one yet. Each harness invents its own folder names. The substrate is the same. The words aren't.

You design a "review panel" skill that runs five expert lenses one after the other in the same context window. They contaminate each other. The output is a mush. You realize too late you should have spawned five threads.

These are not skill-writing problems. They are **architecture** problems. Genesis is the architect.

## What genesis gives you

```
+----------------------------------------------------------+
|  CONCEPT VOCABULARY      ###############  18 named terms |
|  ARCHITECTURE PATTERNS   ###############   8 patterns    |
|  HARNESS COVERAGE        ###############   5 adapters    |
|  DESIGN STEPS            ###############   8 steps       |
|  OPINIONS                ###############   strong        |
+----------------------------------------------------------+
```

- **A shared vocabulary** for every primitive across every harness (PERSONA SCOPING FILE, MODULE ENTRYPOINT, SCOPE-ATTACHED RULE FILE, CHILD-THREAD SPAWN, TRIGGER ORCHESTRATOR, PLAN PERSISTENCE).
- **A composition mental model** so your skill can depend on other skills, not duplicate them (MODULE, DEPENDENCY, TRANSITIVE CLOSURE, VERSION PINNING, PORTABILITY MODE).
- **Eight reusable patterns** (P1 fan-out subagents, P2 router, P3 specialist hand-off, P4 atomic interlock, P5 isolation chamber, P6 cascading scope rules, P7 shared-substrate adapters, P8 plan-first persisted).
- **An eight-step design discipline** that ends with a UML diagram and a persisted plan, not vibes.
- **Five harness adapters** (Claude Code, Codex, Copilot, Cursor, OpenCode) that map the substrate onto each runtime's actual file names and folders.

## The substrate

Six concepts the architect always uses. Every harness implements them under different names. Genesis names them once.

| Concept | What it is | Industry term |
|---|---|---|
| **PERSONA SCOPING FILE** | A document loaded at session start to scope WHO the agent is. | "agent file", "subagent", "mode" |
| **MODULE ENTRYPOINT** | A bundled, self-contained capability with assets and a contract. | "skill" ([agentskills.io](https://agentskills.io)) |
| **SCOPE-ATTACHED RULE FILE** | A constraint that auto-applies to a path or context. | "instruction", "rule", "memory" |
| **CHILD-THREAD SPAWN** | A primitive that creates a new context window running in parallel. | "subagent thread", "Task tool" |
| **TRIGGER ORCHESTRATOR** | A declarative pipeline that runs primitives on events. | "workflow", "hook", "automation" |
| **PLAN PERSISTENCE** | A stable artifact (file or DB) holding the active plan across turns. | "plan.md", "TODO state", "checkpoints" |

These names are deliberately generic. The discipline must outlive any one tool.

## The discipline

```
1. STATE GOAL          --> one sentence, observable outcome
2. NAME SUBSTRATE      --> which concepts will you use?
3. PICK PATTERN        --> P1..P8, justify in one line
3.5 COMPOSE OR BUILD?  --> can an existing module satisfy this?
4. DRAW UML            --> mermaid, validate it renders
5. ACCEPTANCE          --> what proves it works?
6. PERSIST PLAN        --> write plan.md (or equivalent) BEFORE coding
7. IMPLEMENT           --> author files; commit
7b. RELOAD PLAN        --> on every meaningful turn, re-read the plan
8. STOP CONDITION      --> ship, or kill the design
```

The persisted plan is non-negotiable. **LLMs forget.** As context fills, attention to the early turns degrades. The plan is the external memory the architect reloads to stay grounded. This discipline is the same one Claude Code, Cursor, and Copilot all reinvented internally; Genesis names it once.

## Install

`genesis-skill` is an [agentskills.io](https://agentskills.io) skill bundled with a companion persona file. Install via your harness's standard mechanism, or via [APM](https://github.com/microsoft/apm):

| Tool | Install |
|---|---|
| **APM** | Add `danielmeppiel/genesis-skill` to `apm.yml` dependencies, then `apm install` |
| **Manual** | Clone repo, drop `SKILL.md` into your harness's skills folder, `agents/genesis-architect.agent.md` into the agents/personas folder |

After install, ask your agent:

> "Use the genesis-architect persona and the genesis-skill discipline to design a [thing you want]."

The agent will produce: a goal statement, a substrate-named breakdown, a justified pattern choice, a mermaid UML, an acceptance criterion, and a persisted plan -- before writing a single primitive file.

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

This skill is the executable companion to **[The Agentic SDLC Handbook](https://github.com/danielmeppiel/agentic-sdlc-handbook)** and a working application of the **PROSE Framework**. The Handbook gives you the theory. Genesis gives your agent the discipline. PROSE is the language they share.

## License

MIT. Use it, fork it, ship it. If it makes your agents better, let me know on [GitHub](https://github.com/danielmeppiel).

---

<p align="center">
  <em>"Six concepts. Eight patterns. One substrate. Then write the skill."</em>
</p>
