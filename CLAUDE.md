# CLAUDE.md

House rules for any AI-assisted work in this repo. Read automatically at the start of every
session. The goal of this file is simple: **new code should be indistinguishable from the code
already here.** If you follow the patterns below, it will be.

> This repository is a reference implementation of how an organization can adopt Claude Code
> safely on an existing stack. The app is deliberately small; the value is the guardrails and
> the conventions. See `README.md` and `docs/PATTERN.md` for the "why" behind everything below.

---

## What this project is

A small task API — create, read, list, and delete tasks — built on Node.js, Express, and
PostgreSQL. It is intentionally unremarkable so that the delivery pipeline and conventions are
the point, not the domain.

## Commands (use these; do not invent your own)

- Install:    `npm ci`
- Build:      `npm run build`   — syntax-checks every source file
- Test:       `npm test`        — **run before proposing any change**
- Lint:       `npm run lint`
- Migrate:    `npm run migrate` — DEV/TEST database only, never production

Always run `npm test` and `npm run lint` before finishing a change. CI runs them too and will
block a merge on failure, so save yourself the round trip.

---

## Architecture — how a request flows

Every feature follows the same path. Keep each layer doing only its own job:

```
HTTP request
   │
   ▼
router  (src/tasks/router.js)   ── thin. parses the request, calls validate, calls repo,
   │                                maps the result to an HTTP status. No SQL. No business rules.
   ▼
validate (src/tasks/validate.js) ── pure functions. no I/O, no framework. returns {valid, errors, value}.
   │                                this is the cheapest layer to test, so put logic here when you can.
   ▼
repo    (src/tasks/repo.js)      ── the ONLY place SQL lives. every query parameterized ($1, $2).
   │                                returns plain data objects. knows nothing about HTTP.
   ▼
db      (src/db.js)              ── the single connection pool. reads DATABASE_URL. dev/throwaway only.
```

`src/app.js` wires the routers together, mounts `/health`, and installs the **central error
handler**. Route handlers never send their own 500s — they call `next(err)` and let the central
handler format the response.

### The rules that keep it consistent

- **ES modules everywhere** (`import`/`export`, `"type": "module"`). No `require`.
- **SQL lives only in `repo.js`, and every query is parameterized.** Never build SQL by string
  concatenation, and never write SQL in a router. This is a security rule, not a style preference.
- **Routers stay thin.** They validate input, delegate to the repo, and translate results into
  status codes (200/201/204/400/404). Anything more than that belongs in another layer.
- **Errors flow to the center.** In a handler, wrap work in `try/catch` and call `next(err)` on
  failure. Do not format error responses inline.
- **Put logic in pure functions when you can** (like `validate.js`), because pure logic is
  trivially unit-testable without a database.
- **Small, single-purpose pull requests.** One feature or fix per PR.

---

## How to implement a user story

When given a story (given / when / then), do this — in this order:

1. **Read the existing pattern first.** Look at `src/tasks/` and mirror how `router.js`,
   `repo.js`, and `validate.js` are structured. The existing code is the template; copy its shape.
2. **Place each piece in the right layer** (see the flow above). Ask: is this input validation
   (validate), data access (repo), or request handling (router)? Most stories touch all three.
3. **Add tests that match the ones already here.** Pure logic → a unit test like
   `tests/validate.test.js`. New or changed endpoints and queries → integration tests like
   `tests/repo.integration.test.js` and `tests/router.integration.test.js`. Every endpoint gets
   at least a success case and the relevant failure case (400 / 404).
4. **Run `npm test` and `npm run lint`** and make them green before proposing the change.

### Worked example

Story: *Given a task, when I PATCH its status to "done", then it is updated and returned.*

- **validate.js** — add a validator for the status transition (pure; returns `{valid, errors, value}`).
- **repo.js** — add `updateTaskStatus(id, status)`, parameterized, returning the updated row:
  ```js
  export async function updateTaskStatus(id, status) {
    const { rows } = await query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING id, title, status, created_at',
      [status, id],
    );
    return rows[0] ?? null;
  }
  ```
- **router.js** — add a thin `PATCH /:id` handler: validate, call `repo.updateTaskStatus`,
  return 200 with the row, 400 on invalid input, 404 when the row is missing, `next(err)` on error.
- **tests** — a repo integration test (updates a row, returns null when missing) and a router
  integration test (200 happy path, 400 invalid, 404 missing).

That is the whole pattern. Any new feature is a variation on it.

---

## Testing expectations

- Unit tests for pure logic; integration tests for anything touching the database or HTTP.
- Integration tests skip cleanly when `DATABASE_URL` is unset, so `npm test` still runs locally
  without Postgres. Keep that pattern — never make the unit tests require a database.
- Integration tests apply the real migrations to build their schema (see `tests/helpers/db.js`),
  so a passing suite also proves migrations apply.
- No new test frameworks. Use the built-in `node:test` runner and `fetch`, as the existing tests do.

## Migrations

- **Forward-only.** Never edit a migration that has already been applied — add a new numbered
  file (`0002_...`, `0003_...`).
- Migrations run against a dev or throwaway database only, never production.
- A migration is the highest-scrutiny change in any PR; call it out clearly in the PR description.

## Never touch

- Secret or environment files (`.env`, anything under `secrets/`), or any credential.
- An already-applied migration.
- The production database. The only database this project connects to is the one named in
  `DATABASE_URL`, which always points at dev or a throwaway instance.

## Blast-radius tiers (what may be changed, and by whom)

- **Low** — `src/tasks/validate.js`, `tests/`, `docs/`. Fully testable, safe to iterate.
- **Mid** — `src/tasks/router.js`, `src/tasks/repo.js`, `src/app.js`. Needs review.
- **High** — `migrations/`, `src/db.js`, `.github/`, `.claude/`. Engineer-authored, owner review.
  Changes here alter the guardrails themselves — treat with the most care.
