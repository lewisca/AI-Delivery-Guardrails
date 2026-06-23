import { query } from '../db.js';

// All queries are parameterized ($1, $2, ...). Never build SQL by string
// concatenation — that is the deny-list's job to discourage and the reviewer's
// job to catch. Parameterization is the baseline defense against SQL injection.

export async function listTasks() {
  const { rows } = await query(
    'SELECT id, title, status, created_at FROM tasks ORDER BY created_at DESC',
  );
  return rows;
}

export async function createTask({ title, status }) {
  const { rows } = await query(
    'INSERT INTO tasks (title, status) VALUES ($1, $2) RETURNING id, title, status, created_at',
    [title, status],
  );
  return rows[0];
}

export async function getTask(id) {
  const { rows } = await query(
    'SELECT id, title, status, created_at FROM tasks WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function deleteTask(id) {
  const { rowCount } = await query('DELETE FROM tasks WHERE id = $1', [id]);
  return rowCount > 0;
}
