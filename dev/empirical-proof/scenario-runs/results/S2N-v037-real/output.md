# APM doc-audit verdict — S2N v0.3.7 run

**Audited corpus.** 11 pages under
`dev/empirical-proof/scenario-runs/fixtures/S2N-doc-audit/docs/`
(`quickstart.mdx`, getting-started/*, consumer/*, producer/*,
reference/*).

**Method.** A9 single-thread monolithic audit + A7 inline
synthesizer (genesis v0.3.7; AUDIENCE BOUNDARY rule explicitly
exercised but unactivated — see `caveman-classification.md` for
the architectural reason).

**Verdict legend.** BLOCKER = readers will follow the doc and
their build will break or be wrong; HIGH = readers will be
confused enough to file an issue; MEDIUM = drift that erodes
trust; LOW = polish.

---

## Per-page status

| Page | Verdict | Driver |
|------|---------|--------|
| `quickstart.mdx` | NEEDS-FIX | Advertises `apm prune` not documented in any consumer page; missing follow-up reference. |
| `getting-started/installation.md` | CLEAN | Internally consistent; thorough platform coverage. |
| `getting-started/authentication.md` | CLEAN | Long but coherent; auth chain prose, table, and diagram all align. |
| `consumer/authentication.md` | CLEAN | Intentional 30-second ramp; correctly defers depth to the enterprise page. |
| `consumer/install-packages.md` | NEEDS-FIX | Auto-detect dir list canonical here; but disagrees with the normative spec (see H2). `apm prune` orphaned. |
| `consumer/run-scripts.md` | CLEAN | Experimental flag and behavior described unambiguously. |
| `producer/compile.md` | **BLOCKER** | Self-contradicts on whether `apm compile` is required vs auto-run by `apm install`. Plus diverging target-slug list (H4). |
| `producer/preview-and-validate.md` | NEEDS-FIX | Page title promises `apm preview`; page never documents it. Producer link target is wrong (H6). |
| `reference/baseline-checks.md` | CLEAN | Internally consistent reference; cross-links to `policy-schema.md` resolve. |
| `reference/manifest-schema.md` | **BLOCKER** | Normative spec is self-inconsistent on the canonical field name `target` vs `targets` (H1) and lists an incomplete auto-detect harness set (H2). |
| `reference/policy-schema.md` | CLEAN | Working-draft framing is honest; `require_pinned_constraint` reference is precise. |

Two BLOCKER pages, three NEEDS-FIX, six CLEAN. The two blockers
are both in normative / publish-blocking surfaces (the manifest
spec and the producer compile page).

---

## HIGH findings (with file:line evidence)

### H1 — BLOCKER. The normative manifest spec is self-inconsistent on `target:` vs `targets:`

The canonical reference for `apm.yml` cannot decide whether the
field is singular or plural, and the contradiction lives inside
the spec itself before users ever cross-check tutorials.

- `reference/manifest-schema.md` L51 (Section 2 Document Structure)
  shows the manifest shape with `target:` (singular) only — no
  mention of `targets:`.
- `reference/manifest-schema.md` L120-127 (Section 3.6) headlines
  the field as `target:` (singular) with allowed values listed.
- `reference/manifest-schema.md` L146 then states: *"A plural
  alias `targets:` (YAML list only) is also accepted and takes
  precedence over the legacy CSV form when both are declared.
  **Prefer `targets:` in new manifests**; `target:` remains
  supported for backward compatibility."*
- `reference/manifest-schema.md` L772 (Appendix A Complete
  Example) writes `target: [claude, copilot]` — singular —
  contradicting its own L146 recommendation in the same document.

Tutorials and consumer docs already follow the L146 guidance:

- `quickstart.mdx` L63-65 commented-out scaffold: `targets:` (plural).
- `consumer/install-packages.md` L114-118: `targets:` (plural).
- `producer/compile.md` L108: *"Pin `targets:` in `apm.yml` if you
  want the same compile output on every machine."*

A normative spec whose own Document Structure and Complete Example
contradict its own preference paragraph is publish-blocking.

**Fix.** Make `targets:` the canonical primary in §2 and §3.6,
demote `target:` to a deprecated-but-accepted alias note, and
rewrite Appendix A to use `targets:`.

---

### H2 — HIGH. The normative auto-detect harness list is missing 3 of 7 supported directories

The spec's auto-detect cascade names a strict subset of what the
implementation actually scans, while the consumer and producer
pages document the full set. Anyone reading the spec to predict
auto-detect behavior will be wrong.

- `reference/manifest-schema.md` L129: *"a conforming resolver
  SHOULD auto-detect: **`vscode` if `.github/` exists, `claude`
  if `.claude/` exists, `codex` if `.codex/` exists, `windsurf`
  if `.windsurf/` exists, `all` if multiple are present, `minimal`
  if none**."* — names 4 directories.
- `consumer/install-packages.md` L107-109: auto-detect scans
  `.github/`, `.claude/`, `.cursor/`, `.opencode/`, `.codex/`,
  `.gemini/`, `.windsurf/` — 7 directories.
- `producer/compile.md` L102-104: same 7 directories (different
  textual order).
- `consumer/install-packages.md` L82-85 ("Integrate" phase): same
  7 directories listed as integration targets, plus
  `.agents/skills/`.

The spec is missing `.cursor/` (cursor), `.opencode/` (opencode),
and `.gemini/` (gemini) from its auto-detect cascade. All three
ARE listed as accepted `target:` values in the same file (§3.6
table at L148-159).

**Fix.** Update L129 to enumerate all seven harness directories
and the value mapped to each. Match the canonical order used in
the consumer / producer pages.

---

### H3 — HIGH. `producer/compile.md` self-contradicts on whether compile is required

The page tells readers two contradictory things about whether
they need to run `apm compile` separately from `apm install`.

- `producer/compile.md` L17-25 (the page's opening admonition):
  *"Compile is **recommended for every other target** (`claude`,
  `cursor`, `codex`, `gemini`, `opencode`, `windsurf`) -- those
  harnesses load instructions through the root context file
  (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) or a harness-specific
  rules folder that compile generates. **Without it, your
  instructions are on disk but the harness will not pick them
  up.**"*
- `producer/compile.md` L135-138 (the "compile vs install"
  section): *"`apm install` runs compile internally as part of
  its integrate phase, **so a normal `apm install` on a clean
  checkout already produces correct AGENTS.md / CLAUDE.md /
  GEMINI.md output**. Reach for `apm compile` directly when you
  are iterating on instructions and do not want install's side
  effects."*

Both statements appear on the same page within ~120 lines of
each other. Reader takeaway is undefined: do I need to run
compile or not?

**Fix.** Pick one truth. If install runs compile internally,
rewrite the opening admonition to say compile is the *iteration
loop tool*, not a required deployment step. Move the
"recommended for every target" wording into the "compile vs
install" section as a guidance note about the dev loop.

---

### H4 — HIGH. The `--target` slug list diverges between `apm compile` and the manifest `target:` field, with no cross-document explanation

These are two different surfaces (a CLI flag vs a manifest field)
and they accept different sets. Readers reasonably expect the
slug vocabulary to match, and there is no bridging note in either
document.

- `producer/compile.md` L88-91 (compile CLI accepts):
  `copilot, claude, cursor, opencode, codex, gemini, windsurf,
  agent-skills, all` — includes `agent-skills` (no-op for
  symmetry); OMITS `vscode` and `agents`.
- `reference/manifest-schema.md` L125 (manifest field accepts):
  `vscode, agents, copilot, claude, cursor, opencode, codex,
  gemini, windsurf, all` — includes `vscode`/`agents` aliases;
  OMITS `agent-skills`.
- `reference/manifest-schema.md` L150-152: documents that
  `vscode` and `agents` are **aliases for `copilot`**.
- `producer/compile.md` does NOT explain that `vscode`/`agents`
  on the manifest map to `copilot` on the CLI; nor does
  `manifest-schema.md` note that the CLI accepts the no-op
  `agent-skills` slug.

Concrete failure mode: a user writes `targets: [vscode]` in
`apm.yml`, reads `producer/compile.md`, sees no `vscode` in the
accepted list, and assumes their manifest is broken.

**Fix.** Add a short cross-link block at both ends:
- `producer/compile.md` after L91: *"`vscode` and `agents` from
  the manifest's `target:` field both map to `copilot` here."*
- `reference/manifest-schema.md` §3.6 footer: *"The `apm compile
  --target` flag accepts an additional no-op slug `agent-skills`
  not valid in the manifest field."*

---

### H5 — HIGH. `apm prune` is advertised in the quickstart but not documented in `consumer/install-packages.md`

The quickstart promises a verb the consumer documentation does
not deliver. Users following the quickstart link path
(quickstart → consumer ramp) will not find `apm prune` again.

- `quickstart.mdx` L142-143: *"`apm prune` -- remove packages
  from `apm_modules/` that are no longer in `apm.yml`, like
  `npm prune`."*
- `consumer/install-packages.md` does not mention `apm prune`
  anywhere. The "Useful flags" section (L154-164) lists install
  flags only; the "When things go wrong" section (L169-186) does
  not direct readers to prune for orphan removal even though
  orphans are the natural prune use case.
- `consumer/install-packages.md` L80-87: the install pipeline
  itself prunes nothing (no mention).

**Fix.** Add a short "Removing dependencies" section to
`consumer/install-packages.md` documenting `apm prune` and its
relationship to `apm install`. Cross-link from the
"Drift between `apm_modules/` and the lockfile" bullet at L180.
Or, drop the `apm prune` mention from quickstart if the verb is
not yet stable.

---

### H6 — HIGH. `producer/compile.md` cross-links readers to `preview-and-validate/` for `apm preview`, but that page never documents `apm preview`

The producer flow tells readers "use `apm preview`, see the
preview-and-validate page" — but the linked page is silent on
the verb.

- `producer/compile.md` L72-74: *"To preview a script that wraps
  a `.prompt.md` file, use [`apm preview`](../preview-and-validate/)
  instead. `apm compile` builds the root context files;
  `apm preview` shows the rewritten command line your script will
  execute."*
- `producer/preview-and-validate.md` (the link target) covers:
  `apm compile --dry-run` (L23-44), `apm view` (L45-67),
  `apm list` (L69-81), `apm outdated` (L83-98), `apm audit`
  (L100-121). No section, no example, no flag for `apm preview`.
- `consumer/run-scripts.md` L62-64 IS where `apm preview` is
  documented: *"To see exactly what would run without executing
  it, use `apm preview <name>` -- it prints the original command,
  the rewritten command, and the list of compiled prompt files."*

The producer guide's link is a dead anchor in spirit even if it
resolves to a real URL. Either the verb belongs on
`preview-and-validate.md` (which is named for it) or the producer
guide should link to `consumer/run-scripts.md`.

**Fix.** Add an `apm preview` section to
`producer/preview-and-validate.md` covering its scope (script
preview, prompt-compilation rewrite, no execution) and the
common flags. Then re-anchor the `producer/compile.md` link to
that section. The page's title already promises this content.

---

## MEDIUM findings

### M1 — Consumer auth ramp omits commonly-set GitHub env vars

`consumer/authentication.md` L17 mentions only `gh auth login`
or `GITHUB_APM_PAT` for private GitHub packages. It does not
mention `GITHUB_TOKEN` (commonly set in GitHub Actions) or
`GH_TOKEN`, both of which the canonical chain in
`getting-started/authentication.md` L25-32 (table priorities 3
and 4) treats as valid global credentials. CI users following
the consumer ramp will assume their GitHub Actions setup needs
extra configuration when in practice `GITHUB_TOKEN` is already
honored.

**Fix.** Add a one-line "If you are in GitHub Actions,
`GITHUB_TOKEN` is picked up automatically" note to
`consumer/authentication.md` L17 bullet.

### M2 — `--trust-transitive-mcp` flag and `mcp.trust_transitive` policy are not cross-linked

`consumer/install-packages.md` L137 documents the
`--trust-transitive-mcp` per-invocation flag. The policy schema
documents the `mcp.trust_transitive` boolean
(`reference/policy-schema.md` L122-126). These two surfaces
control the same behavior at different scopes. Neither doc
mentions the other.

**Fix.** Add a one-line cross-link in both directions.

### M3 — `apm audit` flag inventory is incomplete on the producer page

`producer/preview-and-validate.md` L100-107 lists `apm audit`,
`apm audit --file <path>`, `apm audit --strip`,
`apm audit --strip --dry-run`. It omits `--ci` (the major audit
mode), `--no-drift`, `--no-fail-fast`, and `-f json/sarif/markdown`
— all documented at `reference/baseline-checks.md` L29 and L116-118
or in passing in this same page (`-f` mentioned at L116). A
producer running the verify loop will not learn `--ci` exists
from this page.

**Fix.** Add `apm audit --ci` (and a one-line note about
`--no-drift` / `--no-fail-fast`) to the flag inventory; cross-link
to `reference/baseline-checks.md`.

### M4 — `quickstart.mdx` auto-detect narrative is correct but unverifiable from the spec it links

`quickstart.mdx` L83-85 says: *"The `targets:` block is commented
out so APM auto-detects the harnesses present in your repo
(`.github/`, `.claude/`, `.cursor/`, etc.)."* The literal
parenthetical `( ... )` lists 3 of 7 directories. A reader
clicking through to `manifest-schema.md` to verify will land on
L129 which lists 4 different directories (per H2). Once H2 is
fixed, this resolves automatically.

### M5 — `getting-started/installation.md` ARM64 caveat is precise but lacks a roadmap pointer

L14 documents that on Windows ARM64 the installer downloads x86_64
and runs via emulation. There is no link to a tracking issue or a
"track ARM64 native support" footer. Low-effort to add; high-value
for users who hit this.

---

## LOW findings (style / polish)

- `reference/manifest-schema.md` Appendix A L778-779: example
  `scripts:` entries quote the prompt path with single quotes
  (`'README.prompt.md'`); other examples in the doc and across
  the corpus use double quotes or no quotes. Trivial style drift
  inside the same file.
- `consumer/run-scripts.md` L48 example uses `--param target=...`
  as a parameter name; "`target`" is also a manifest field name.
  Different namespaces, but the collision is mildly distracting.
- `producer/compile.md` L116-124 per-target table ends with
  `agent-skills` referenced only via the footnote at L91 (no row
  in the per-target table). Either give it a row (with "no-op"
  in every cell) or omit from the slug list — current shape is
  the worst of both.
- `reference/policy-schema.md` L96 example mixes pip-style `==`
  (rejected) with bare exact `1.5.3` (accepted). The classification
  is intentional but the side-by-side rows would benefit from a
  callout: *"`==1.5.3` is rejected because the bare equality
  operator is parsed as a branch ref."*

---

## Outside-fixture references (informational)

The corpus links to numerous pages not present in the 11-page
fixture (e.g. `/apm/enterprise/security/`, `/apm/concepts/
package-anatomy/`, `consumer/private-and-org-packages/`,
`consumer/install-mcp-servers/`, `consumer/deploy-a-bundle/`,
`producer/pack-a-bundle/`, `reference/cli/install/`,
`reference/lockfile-spec/`, `reference/registry-http-api/`,
`/apm/specs/openapm-v01/`, `/apm/specs/schemas/manifest-v0.1.schema.json`,
`/apm/specs/schemas/policy-v0.1.schema.json`,
`/apm/troubleshooting/ssl-issues/`, `/apm/guides/registries/`,
`/apm/guides/dev-only-primitives/`, `/apm/enterprise/governance-guide/`,
`/apm/enterprise/governance-overview/`, `/apm/enterprise/policy-reference/`,
`/apm/enterprise/enforce-in-ci/`, `/apm/enterprise/registry-proxy/`,
`/apm/enterprise/apm-policy-getting-started/`,
`/apm/concepts/lifecycle/`, `/apm/concepts/the-three-promises/`,
`/apm/concepts/primitives-and-targets/`, `/apm/consumer/manage-dependencies/`,
`/apm/consumer/drift-and-secure-by-default/`,
`/apm/consumer/update-and-refresh/`,
`/apm/consumer/governance-on-the-consumer-ramp/`,
`/apm/producer/author-primitives/instructions-and-agents/`,
`/apm/producer/author-primitives/prompts/`, etc.).

These cannot be verified inside this fixture slice. A full-corpus
audit pass would re-run this verdict against the complete site
to flag any link that 404s. None of the in-fixture cross-links
are broken (`producer/compile.md ↔ producer/preview-and-validate.md`,
`reference/baseline-checks.md → reference/policy-schema.md`,
`reference/policy-schema.md → reference/manifest-schema.md`-style
cross-references all resolve to existing files).

---

## Summary

- **Total findings:** 6 HIGH (2 of which are BLOCKER-grade for
  normative / producer-blocking pages), 5 MEDIUM, 4 LOW.
- **Pages requiring fix before publish:** `manifest-schema.md`
  (BLOCKER), `producer/compile.md` (BLOCKER),
  `consumer/install-packages.md` (HIGH/MEDIUM),
  `producer/preview-and-validate.md` (HIGH),
  `quickstart.mdx` (HIGH coupling), `consumer/authentication.md`
  (MEDIUM).
- **Pages clean:** `getting-started/installation.md`,
  `getting-started/authentication.md`,
  `consumer/run-scripts.md`,
  `reference/baseline-checks.md`,
  `reference/policy-schema.md`.
- **Highest-leverage single fix:** resolve H1 (`target:` /
  `targets:` canonicalization) — propagates to a follow-on
  validation pass on every example block in the corpus.
- **Architectural note for v0.3.7 calibration:** this audit
  executed as a pure A9+A7 monolith with zero `task()` spawns;
  see `caveman-classification.md` for why the v0.3.7 caveman
  channel correctly did not fire on this shape.
