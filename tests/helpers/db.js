import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../../src/db.js';

// Integration tests need a real Postgres. In CI, DATABASE_URL points at the
// throwaway instance the pipeline spins up. Locally, if DATABASE_URL is unset,
// the integration suites skip cleanly so `npm test` still runs the unit tests.
export const hasDb = Boolean(process.env.DATABASE_URL);

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'migrations',
);

// Apply the real migration SQL. The migrations use CREATE TABLE IF NOT EXISTS,
// so this is safe to run repeatedly — and running the actual files means these
// tests also prove the migrations apply against a live database.
export async function applySchema() {
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    await pool.query(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
  }
}

// Clean slate before each test so ordering never matters.
export async function resetTables() {
  await pool.query('TRUNCATE tasks RESTART IDENTITY CASCADE');
}

export async function closePool() {
  await pool.end();
}
