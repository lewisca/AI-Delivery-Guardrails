import pg from 'pg';

const { Pool } = pg;

// The pool reads DATABASE_URL from the environment.
// In every environment the agent or CI can reach, this points at a development
// or throwaway database — never production. That isolation is the whole reason
// AI-authored changes here cannot touch real data. See docs/PATTERN.md.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export function query(text, params) {
  return pool.query(text, params);
}
