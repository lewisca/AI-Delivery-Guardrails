import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { hasDb, applySchema, resetTables, closePool } from './helpers/db.js';
import * as repo from '../src/tasks/repo.js';

// Skips cleanly when no database is configured (e.g. running unit tests locally
// without Postgres). In CI, DATABASE_URL is set, so these run against the
// throwaway instance.
const skip = hasDb ? false : 'DATABASE_URL not set — skipping DB integration tests';

before(async () => { if (hasDb) await applySchema(); });
beforeEach(async () => { if (hasDb) await resetTables(); });
after(async () => { if (hasDb) await closePool(); });

test('createTask persists a row and returns it', { skip }, async () => {
  const created = await repo.createTask({ title: 'Ship tests', status: 'open' });
  assert.ok(created.id, 'row should have an id');
  assert.equal(created.title, 'Ship tests');
  assert.equal(created.status, 'open');
  assert.ok(created.created_at, 'row should have a created_at');
});

test('listTasks returns rows newest-first', { skip }, async () => {
  await repo.createTask({ title: 'first', status: 'open' });
  await repo.createTask({ title: 'second', status: 'open' });
  const rows = await repo.listTasks();
  assert.equal(rows.length, 2);
  assert.equal(rows[0].title, 'second'); // ORDER BY created_at DESC
});

test('getTask returns a row by id, or null when missing', { skip }, async () => {
  const created = await repo.createTask({ title: 'find me', status: 'open' });
  const found = await repo.getTask(created.id);
  assert.equal(found.title, 'find me');
  assert.equal(await repo.getTask(999999), null);
});

test('deleteTask removes a row and reports whether it existed', { skip }, async () => {
  const created = await repo.createTask({ title: 'delete me', status: 'open' });
  assert.equal(await repo.deleteTask(created.id), true);
  assert.equal(await repo.getTask(created.id), null);
  assert.equal(await repo.deleteTask(created.id), false); // already gone
});
