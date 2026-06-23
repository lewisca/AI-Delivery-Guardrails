import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskInput } from '../src/tasks/validate.js';

test('accepts a valid task', () => {
  const r = validateTaskInput({ title: 'Write the README', status: 'open' });
  assert.equal(r.valid, true);
  assert.deepEqual(r.value, { title: 'Write the README', status: 'open' });
});

test('defaults status to open when omitted', () => {
  const r = validateTaskInput({ title: 'No status given' });
  assert.equal(r.valid, true);
  assert.equal(r.value.status, 'open');
});

test('trims and rejects an empty title', () => {
  const r = validateTaskInput({ title: '   ' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.includes('title is required'));
});

test('rejects an unknown status', () => {
  const r = validateTaskInput({ title: 'x', status: 'archived' });
  assert.equal(r.valid, false);
});

test('handles a missing body without throwing', () => {
  const r = validateTaskInput(undefined);
  assert.equal(r.valid, false);
});
