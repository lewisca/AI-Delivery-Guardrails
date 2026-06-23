# CLAUDE.md

House rules for any AI-assisted work in this repo. Read automatically each session.

## What this project is

A deliberately small task API (Node.js + Express + PostgreSQL). The application is
intentionally boring — its only purpose is to be a realistic substrate for
demonstrating a safe AI-assisted delivery pipeline. The guardrails are the point,
not the app. See `docs/PATTERN.md`.

## Commands (use these; do not invent your own)

- Install:    `npm ci`
- Build:      `npm run build`   (syntax check over all source files)
- Test:       `npm test`        (run before proposing any change)
- Lint:       `npm run lint`
- Migrate:    `npm run migrate`  — DEV/TEST database only, never production

## Conventions

- ES modules throughout (`"type": "module"`).
- Keep pure logic (e.g. `src/tasks/validate.js`) separate from I/O so it can be
  unit-tested without a database.
- All SQL is parameterized. Never build SQL by string concatenation.
- Write or update a test for any behavior change.
- Small, single-purpose pull requests.

## Never touch

- Secret or environment files (`.env`, anything under `secrets/`), or any credential.
- An existing migration in `migrations/`. Migrations are forward-only — add a new
  numbered file; never edit one that has already been applied.
- The production database. The only database this project ever connects to is the
  one named in `DATABASE_URL`, which always points at dev or a throwaway instance.

## Blast-radius tiers (what may be changed, and by whom)

- Low:  `src/tasks/validate.js`, `tests/`, `docs/` — fully testable, safe to iterate.
- Mid:  `src/tasks/router.js`, `src/tasks/repo.js`, `src/app.js` — needs review.
- High: `migrations/`, `src/db.js`, `.github/`, `.claude/` — engineer-authored, owner review.
