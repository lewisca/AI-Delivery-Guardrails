import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { hasDb, applySchema, resetTables, closePool } from './helpers/db.js';
import { createApp } from '../src/app.js';

// Exercises the real Express app over HTTP: starts it on an ephemeral port and
// makes actual requests with fetch (built into Node 18+, no extra dependency).
const skip = hasDb ? false : 'DATABASE_URL not set — skipping HTTP integration tests';

let server;
let baseUrl;

before(async () => {
  if (!hasDb) return;
  await applySchema();
  await new Promise((resolve) => {
    server = createApp().listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});
beforeEach(async () => { if (hasDb) await resetTables(); });
after(async () => {
  if (server) await new Promise((r) => server.close(r));
  if (hasDb) await closePool();
});

const postTask = (body) => fetch(`${baseUrl}/tasks`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

test('GET /health returns ok', { skip }, async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('POST /tasks creates a task (201)', { skip }, async () => {
  const res = await postTask({ title: 'via API', status: 'open' });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.title, 'via API');
  assert.ok(body.id);
});

test('POST /tasks rejects an invalid task (400)', { skip }, async () => {
  const res = await postTask({ title: '' });
  assert.equal(res.status, 400);
  assert.ok(Array.isArray((await res.json()).errors));
});

test('GET /tasks lists created tasks', { skip }, async () => {
  await postTask({ title: 'one' });
  const res = await fetch(`${baseUrl}/tasks`);
  assert.equal(res.status, 200);
  const rows = await res.json();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, 'one');
});

test('GET /tasks/:id returns 404 for a missing task', { skip }, async () => {
  const res = await fetch(`${baseUrl}/tasks/999999`);
  assert.equal(res.status, 404);
});

test('DELETE /tasks/:id removes a task (204, then 404)', { skip }, async () => {
  const created = await (await postTask({ title: 'temp' })).json();
  const del = await fetch(`${baseUrl}/tasks/${created.id}`, { method: 'DELETE' });
  assert.equal(del.status, 204);
  const after = await fetch(`${baseUrl}/tasks/${created.id}`);
  assert.equal(after.status, 404);
});
