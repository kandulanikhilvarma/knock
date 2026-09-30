import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uuidv4 } from './ids.ts';

test('uuidv4 is a v4 uuid Postgres and the 0025 policy accept', () => {
  for (let i = 0; i < 200; i++) {
    assert.match(uuidv4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  }
});

test('uuidv4 does not repeat', () => {
  const seen = new Set(Array.from({ length: 1000 }, uuidv4));
  assert.equal(seen.size, 1000);
});
