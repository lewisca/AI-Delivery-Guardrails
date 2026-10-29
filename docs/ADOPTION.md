# Adopting This in Your Organization

This repo demonstrates the pattern on a small Node + Postgres app. The same shape applies to any stack, because the integration runs through two things every team already has: your existing shell commands and git. You define the commands once, and the gate, the agent config, and the house rules all reference them.

## Two things this promises

**Your app's design does not change.** Adopting this is additive: you add the six guardrail files — `CLAUDE.md`, `.claude/settings.json`, `.github/workflows/ci.yml`, `CODEOWNERS`, the migrations convention, and the `.env.example`/`.gitignore` secrets contract — *around* the code you already have. You rewrite no application code to get the safety; the guardrails wrap it.

**A non-engineer can make safe-tier changes via prompts.** Once the net is in place, the loop for a layperson is:

1. Describe the change in plain English to Claude Code (e.g. *"add a `priority` field to tasks, open-or-done validation like the others"*).
2. The agent follows `CLAUDE.md` — mirrors the existing layer pattern, adds matching tests, and runs `npm test` + `npm run lint` before proposing anything.
3. It opens a pull request.
4. CI (`ci.yml`) gates the merge; `CODEOWNERS` routes review by blast radius. A safe-tier change (e.g. `tests/`, `docs/`, `validate.js`) needs only a light review; anything reaching a high-risk path (schema, DB, pipeline) auto-requires an owner.

The person never reads the SQL or the Express wiring. The guardrails — not their expertise — are what make the change safe to merge. The permission boundary in `.claude/settings.json` and the path rules in `CODEOWNERS` are what keep "self-serve" fenced to the safe tier.

## The stack-agnostic core

Fill in one table for your stack and the rest follows:

| Job | This repo | Your stack |
|-----|-----------|------------|
| Install | `npm ci` | ? |
| Build | `npm run build` | ? |
| Test | `npm test` | ? |
| Lint | `npm run lint` | ? |
| Migrate (throwaway DB) | `npm run migrate` | ? |

Those commands go into three places that must agree: `CLAUDE.md` (so the agent uses them), `.claude/settings.json` (so it may run the safe ones unattended), and your CI workflow (so they gate every merge).

## A phased rollout

1. **Foundation** — one team, one repo. Confirm dev/prod separation. Name one owner for the pipeline.
2. **Build the net** — CI on every PR, branch protection requiring passing checks plus a review, `CODEOWNERS`, the agent permission file, and `CLAUDE.md`.
3. **Pilot** — 2–4 people on the lowest-risk tier only, with an engineer reviewing everything closely at first.
4. **Measure** — watch review delay, undo rate, and incident rate. *Not* volume.
5. **Expand** — add people, repos, and tiers by deliberate decision, never automatically. The weaker the automated coverage in an area, the more human review stays required.

## What I'd tailor to your team

- Mapping your real services and risk areas onto the blast-radius tiers.
- Wiring the gate into whatever CI you already run (GitHub Actions, GitLab CI, etc.).
- The data-safety loop for your specific stores — SQL, NoSQL, or cloud infrastructure.
- Path-scoped permissions and review rules so non-engineers can self-serve the safe tier without reaching the risky one.
- The metrics dashboard that tells you whether it's working before incidents do.

## The one thing teams get wrong

Treating "more code shipped" as the win. It isn't. If volume rises while review delay or breakage rise with it, the bottleneck only moved — it didn't go away. The scoreboard is throughput *with* stable quality, and the verification layer is what makes that possible.
