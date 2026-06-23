-- Forward-only migration.
-- Rule: never edit a migration that has already been applied. Add a new one
-- instead. This file is in the "ask" tier for the agent and routed to a
-- database owner in CODEOWNERS — it is the highest blast radius in the repo.

CREATE TABLE IF NOT EXISTS tasks (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
