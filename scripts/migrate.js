import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

// A deliberately small forward-only migration runner.
// It applies any *.sql files in /migrations that have not been applied yet,
// each inside a transaction, and records them in schema_migrations.
// In CI this runs against a throwaway Postgres instance (see ci.yml), proving
// migrations apply cleanly without ever touching a real database.

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const appliedRows = await pool.query('SELECT filename FROM schema_migrations');
  const applied = new Set(appliedRows.rows.map((r) => r.filename));

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip    ${file} (already applied)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`failed  ${file}: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }
}

run()
  .then(() => pool.end())
  .catch(async () => {
    await pool.end();
    process.exit(1);
  });
