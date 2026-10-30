# Week-One Runbook

For the engineer dropped into a company that isn't using a coding agent yet, tasked with
standing up Claude Code safely on an existing stack. This is the checklist `ADOPTION.md`'s
phased rollout assumes you already know how to execute.

**Scope check first.** One week gets you a *working pilot on one repo*: the guardrails wired,
CI gating, 2–3 people shipping safe-tier changes under close review. It does **not** get you
"the company is adopted" — that's pilot → measure → expand, and measurement alone is weeks
(`ADOPTION.md`). Promise the pilot, not the rollout.

---

## Day 0 — Go / no-go (do this before committing to the week)

If any of these is a hard "no", fix *that* first; the pipeline is worthless on top of it.

- [ ] **Is there a real test suite, and does it pass today?** The gate is only as strong as the
  tests. Thin, flaky, or absent tests = a hollow gate. Run it yourself. If coverage of the
  area you'll pilot is weak, your week-one job is *tests*, not agents.
- [ ] **Is dev/prod actually separated?** Can you point the pilot at a dev/throwaway database and
  guarantee no path reaches prod data? If one shared DB, stop — this is a separate project.
- [ ] **Do you have (or have a sponsor who has) repo-admin?** Branch protection, the GitHub App,
  and `CODEOWNERS` all need admin. You're new; line this up as a person, not a ticket.
- [ ] **Is there one named owner for the pipeline?** Someone who reviews the high-risk tier and
  owns the config. Without it, "self-serve" has no backstop.
- [ ] **Pick ONE repo and ONE low-risk area** for the pilot. Not the monorepo. Not the payments
  service.

## Day 1 — Define the commands, prove them locally

- [ ] Fill in the five commands for this stack (the `ADOPTION.md` table): install, build, test,
  lint, migrate-on-throwaway-DB. If any doesn't exist, that's a finding — note it.
- [ ] Run all five by hand on a clean checkout. They must be green before anything references them.
- [ ] Confirm the migrate (or equivalent) command only ever touches a dev/throwaway DB.

## Day 2 — Wire the guardrails (the six files)

Copy the shape from this repo, substituting the commands from Day 1:

- [ ] `CLAUDE.md` — house rules + the canonical commands + the layer/blast-radius model.
- [ ] `.claude/settings.json` — allow the safe commands unattended; **deny** secret reads,
  force-push, destructive and networked commands. Test that a denied command is actually denied.
- [ ] `.github/workflows/ci.yml` — runs the five commands on every PR.
- [ ] `CODEOWNERS` — route high-risk paths (schema, DB, pipeline, `.claude/`) to the owner.
- [ ] `.env.example` + `.gitignore` — the secrets contract. Confirm no real secret is tracked.
- [ ] Migrations convention (forward-only) if the stack has schema.

## Day 3 — Make the gate real, not advisory

- [ ] Open a deliberately-failing PR; confirm CI goes red. (This repo's `demo/ci-gate-failing`
  branch is the template.)
- [ ] Add a branch ruleset on the default branch: **require** the CI check to pass, and require a
  PR before merge. Re-check the failing PR — the merge button must now be disabled.
- [ ] **Confirm CI fires on agent-authored PRs.** The single easiest thing to get wrong
  (`claude.yml` header): a workflow's own pushes don't trigger other workflows by default. Verify
  with a real agent PR, don't assume.
- [ ] Install the GitHub App / set `ANTHROPIC_API_KEY` if using `@claude` PR review (needs admin).

## Day 4 — Pilot dry run

- [ ] You (not the pilot users yet) drive one real safe-tier change end to end via Claude Code:
  prompt → tests → PR → green CI → owner review → merge. Time it. Fix friction.
- [ ] Write the half-page "what a non-engineer does" guide for *this* repo (the loop in
  `ADOPTION.md`, with this stack's command names and the one pilot area).

## Day 5 — Onboard the pilot

- [ ] 2–3 people, safe tier only, owner reviewing *everything* closely at first.
- [ ] Each ships one real change through the full loop with you watching.
- [ ] Agree the metrics you'll watch (review delay, undo/revert rate, incident rate — **not**
  volume) and where they're recorded. Baseline them now.

---

## Exit criteria (end of week)

- [ ] The gate blocks a bad merge, provably.
- [ ] CI fires on agent-authored PRs, provably.
- [ ] No pilot path can reach prod data.
- [ ] 2–3 people have each merged a safe-tier change through the pipeline.
- [ ] One owner, baselined metrics, and a written expand/no-expand decision for next week.

## What is explicitly NOT done in week one

Expanding tiers or teams, the metrics dashboard, path-scoped permissions for non-engineers
beyond the pilot area, and anything on a shared-prod or untested codebase. Those are
`ADOPTION.md`'s "expand" phase — gated on the measured results of this pilot, never automatic.
