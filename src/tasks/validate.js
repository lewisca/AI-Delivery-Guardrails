// Pure validation logic — no database, no framework.
// Kept separate on purpose: it is the easiest thing to unit-test, so it is
// where a non-engineer's AI-authored change is cheapest to verify. (Low blast radius.)

export const TITLE_MAX = 200;
export const STATUSES = new Set(['open', 'in_progress', 'done']);

export function validateTaskInput(body) {
  const errors = [];
  const input = body ?? {};

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (title.length === 0) errors.push('title is required');
  if (title.length > TITLE_MAX) errors.push(`title must be <= ${TITLE_MAX} characters`);

  const status = input.status ?? 'open';
  if (!STATUSES.has(status)) {
    errors.push(`status must be one of: ${[...STATUSES].join(', ')}`);
  }

  return { valid: errors.length === 0, errors, value: { title, status } };
}
