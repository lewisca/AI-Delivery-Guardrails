import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskInput } from '../src/tasks/validate.js';

// DEMO ONLY — this test is intentionally wrong. It exists to prove the CI gate
// blocks a PR whose tests fail. The PR demonstrating it should never be merged;
// delete this file (or the branch) once the red check has been observed.
test('DEMO: intentionally failing assertion to exercise the CI gate', () => {
  const r = validateTaskInput({ title: 'Write the README', status: 'open' });
  // validateTaskInput returns { valid: true } here; asserting false on purpose.
  assert.equal(r.valid, false, 'INTENTIONAL FAILURE — the CI gate should catch this');
});
