---
name: genesis-evals
description: >-
  Use this skill to run the genesis maintainer-side eval suite against
  a target model (default: claude-opus-4.7). Activate when validating a
  genesis PR, when changing the genesis catalogue (architectural-patterns,
  primitives, design-patterns, refactor-patterns, composition-substrate,
  pattern-tradeoffs, SKILL.md), or when the operator asks to "run evals"
  or "regenerate the eval matrix". This skill orchestrates parallel cold
  sub-agent spawns via the harness's task tool, scores deterministically,
  and converges P>=0.8 / N>=0.8 / R==1.0 within max 3 iteration loops.
  This skill is contributor-only -- it lives under dev/skills/ (OUTSIDE
  .apm/) and is NOT shipped inside the user-facing skills/genesis/
  bundle (BUNDLE LEAKAGE discipline). See "Why this lives outside
  .apm/" below.
---

# genesis-evals: maintainer-side eval runner

Run the genesis self-eval suite. Steers the parent LLM session to
orchestrate cold sub-agent spawns, capture responses, score
deterministically, and report convergence.

## Why this lives outside `.apm/`

Genesis ships to USERS via npx / `apm install`. Eval scenarios LOOK
LIKE real user requests (that is the point). Colocating them under
`skills/genesis/evals/` would risk DISPATCH CONTAMINATION (an
over-eager harness loader pulling scenario prompts into the active
context) and PAYLOAD BLOAT for users who never run evals.

We also keep this OUTSIDE `.apm/` because APM treats `.apm/` as the
publishable source root: its local-content scanner picks up anything
under `.apm/skills/` regardless of dev-marker, so `apm pack
--format plugin` would leak this maintainer-only skill into the
shipped artifact. Living under `dev/skills/` keeps it scanner-invisible
while still letting `apm install --dev` deploy it via the local-path
devDependency in the root `apm.yml`.

This is the inverse of PHANTOM DEPENDENCY (referenced-but-not-bundled):
BUNDLE LEAKAGE (bundled-but-not-consumed-at-runtime). See
`skills/genesis/assets/composition-substrate.md` "Anti-patterns
flagged at this step".

## When to activate

- Validating a genesis PR before merge
- Any change to a file under `skills/genesis/` (catalogue or SKILL.md)
- Operator says "run evals", "regenerate eval matrix", "score on Opus"
- Adding a new scenario (run validate first)

## Hard rules

- The `model:` field in every scenario YAML is REQUIRED. The runner
  REFUSES to spawn if missing. No silent default. The model is the
  single biggest variable in eval results.
- Pre-spawn: ALWAYS call `spawn_record.py` to write the immutable
  `<id>__<half>.spawn.json` BEFORE invoking the harness's task tool.
  This is the source of truth for "what we asked for".
- Cold spawn: each (scenario, half) is a SEPARATE task-tool call with
  fresh context. Never reuse a session across scenarios.
- Determinism: scoring is python (`score_run.py`), not LLM-judged.
  Pass gates are substring matches against the schema.
- Scenarios are FROZEN once landed. Removing a scenario requires
  setting `retired_in: <version>` (never deletion).
- After 3 iteration loops without convergence, escalate via
  B10 HUMAN CHECKPOINT. Do NOT loop indefinitely.

## Process

```
   1 validate scenarios   <-- python validate_scenarios.py
        v
   2 mint run-id          <-- yyyymmddTHHMMSSZ
        v
   3 fan-out spawns        <-- for each scenario:
        v                       a) spawn_record.py for each half
        v                       b) task-tool cold spawn (parallel)
        v                       c) write child reply to <id>__<half>.response.txt
        v
   4 score                <-- python score_run.py
        v
   5 read summary.md
        v
   6 converged?  --YES--> done; report run-id + summary path
        |
        NO
        v
   7 loop count < 3?
        |
        +-- YES: identify failing scenario IDs; goto step 3 (failures only)
        |
        +-- NO: B10 HUMAN CHECKPOINT
                (declare ITERATION REQUIRED -- design implicated)
```

## Step 1 -- validate

```
python dev/skills/genesis-evals/scripts/validate_scenarios.py \
  --scenarios-dir dev/skills/genesis-evals/scenarios \
  --schema        dev/skills/genesis-evals/schema/scenario.schema.json
```

If exit non-zero, STOP. Fix the schema/yaml violations before any
spawn. No partial runs.

## Step 2 -- mint run-id

```
RUN_ID=$(date -u +%Y%m%dT%H%M%SZ)
RUNS_DIR=dev/skills/genesis-evals/runs
mkdir -p "$RUNS_DIR/$RUN_ID"
```

## Step 3 -- fan-out spawns

For EACH scenario YAML in `scenarios/`:

### Determine halves

- `category: P` -> two halves: `with` and `without`
- `category: N` -> one half: `single` (loaded_skills as declared)
- `category: R` -> one half: `single`

### Per (scenario, half), in this order

1. **Record the spawn intent** (deterministic, pre-spawn):
   ```
   python dev/skills/genesis-evals/scripts/spawn_record.py \
     --scenario dev/skills/genesis-evals/scenarios/<id>.yml \
     --half     <with|without|single> \
     --run-id   "$RUN_ID" \
     --runs-dir "$RUNS_DIR"
   ```
   This writes `<runs-dir>/<run-id>/<id>__<half>.spawn.json`. If the
   script exits non-zero, the scenario is REJECTED (no model field,
   or retired). Skip this scenario; do NOT spawn.

2. **Cold-spawn via the harness task tool**, with:
   - agent_type: `general-purpose` (or harness equivalent that
     supports a fresh context window)
   - model: read from the spawn.json `requested_model` field --
     PASS THIS EXPLICITLY to the task-tool call. Do NOT rely on the
     parent's default.
   - prompt: read from spawn.json `prompt` field, VERBATIM. No
     prefix, no suffix, no parent-context bleed.
   - For `with` half (P category, includes `genesis` in
     loaded_skills_requested): prepend a single line instruction
     telling the child it has the `genesis` skill available and
     should consult it. For `without` half: no genesis instruction.
   - For `N` and `R` `single` half: same treatment as `with` if
     `genesis` is in loaded_skills_requested.

3. **Capture the child's reply** to:
   `<runs-dir>/<run-id>/<id>__<half>.response.txt`
   The full text, verbatim. No truncation. No paraphrase.

### Parallelism

Genesis itself names A1 PANEL with B1 fan-out as the right pattern
for this shape. Spawn as many independent (scenario, half) jobs in
parallel as the harness permits. Do NOT serialize unless forced.

## Step 4 -- score

```
python dev/skills/genesis-evals/scripts/score_run.py \
  --run-id        "$RUN_ID" \
  --runs-dir      "$RUNS_DIR" \
  --scenarios-dir dev/skills/genesis-evals/scenarios
```

Writes `<runs-dir>/<run-id>/summary.md`. Exit code: 0 if converged,
1 if not, 2 on infrastructure error.

## Step 5 -- read summary

`view` the summary.md. Note per-category ratios.

## Step 6 -- decide convergence

| Category | Gate           | Failure shape                         |
|----------|----------------|---------------------------------------|
| P        | ratio >= 0.80  | with-skill missing the catalogue label OR without-skill leaking it |
| N        | ratio >= 0.80  | over-eager activation: genesis vocabulary leaking into off-topic responses |
| R        | ratio == 1.00  | regression of a previously-fixed behaviour (PR #4 substrate gates) |

If ALL three pass: STOP. Report run-id, summary.md path, ratios.

## Step 7 -- iterate (cap = 3)

If NOT converged AND loop count < 3:

1. Identify failing scenario IDs from summary.md
2. Re-spawn ONLY those failures (same scenario YAMLs, new run-id)
3. Goto step 4

If loop count == 3 and still not converged: B10 HUMAN CHECKPOINT.
Report which scenarios failed twice (genuine signal, not noise) and
which architectural surface they implicate. Do NOT auto-edit
genesis catalogue files.

## Updating a PR description with the matrix

After convergence, paste the contents of summary.md into the PR
body under a "Verification" section. Replace any prior ad-hoc
matrix.

## Adding a new scenario

1. Pick the next ord for the category: `<p|n|r>-<NNN>-<slug>.yml`
2. Set `frozen_since` to the current genesis version (read
   `apm.yml`)
3. Run `validate_scenarios.py`
4. Land in the same PR as the genesis change it gates

## Gate-authoring tips (lessons from RUN_ID=20260426T104629Z)

- **Forbidden lists must target ACTIVATION vocabulary, not SCOPE
  vocabulary.** A polite-decline response correctly names the
  skill's scope ("genesis is for designing primitive modules
  -- not relevant here"). Words like `primitive module` or
  `agentic primitive` appear in BOTH activation AND decline,
  so they fail to discriminate. Forbid only words that ONLY
  appear on activation: `Step 1`, `composition substrate`,
  `design artifact`, codified pattern labels (`R1 SPLIT`,
  `A10 GOVERNED`, `A1 PANEL`).
- **Required-substring lists must be one-of, not all-of, when
  testing for "the catalogue produced ANY structured output".**
  Demanding both `SoC` AND `R1 SPLIT` is over-specification.
  Pick the single most discriminating label and require only
  that. The scorer is `substring_all` (intersection); express
  alternatives by minimising the set, not by enumerating
  synonyms.
- **The "without-genesis" half is NOT a clean baseline.** The
  cwd contains genesis source files; sub-agents may read and
  cite them. This is acceptable for gate evaluation (gates
  are substring checks on SPECIFIC vocabulary), but do not
  treat without-half responses as evidence of "what a fresh
  LLM would do without the skill".
- **File-naming MUST match scenario id exactly.** Saved
  responses are read as `<scenario-id>__<half>.response.txt`.
  Trailing slugs in filenames break the scorer silently.

## Retiring a scenario

Set `retired_in: <version>`. The runner will skip it. NEVER delete
the file (provenance / audit trail).

## Setup (one-time)

```
pip install -r dev/skills/genesis-evals/requirements.txt
```

(deps: pyyaml, jsonschema. Maintainer-side only. Users never see
this requirements.txt.)
