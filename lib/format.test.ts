// node --experimental-strip-types lib/format.test.ts
import assert from 'node:assert';
import { formatDate, formatINR } from './format.ts';

const cases: [number, string][] = [
  [0, '0'],
  [7, '7'],
  [999, '999'],
  [1000, '1,000'],
  [12345, '12,345'],
  [123456, '1,23,456'],
  [1234567, '12,34,567'],
  [123456789, '12,34,56,789'],
  [1499.6, '1,500'], // rounds to whole rupees
  [-850, '-850'],
  [-1234, '-1,234'],
  [-123456, '-1,23,456'],
];
for (const [n, want] of cases) assert.strictEqual(formatINR(n), want, `formatINR(${n})`);


// Dates follow the app language.
const iso = '2026-09-03T10:00:00Z';
assert.match(formatDate(iso, 'en'), /^3 Sep/);
assert.notEqual(formatDate(iso, 'te'), formatDate(iso, 'en'));
assert.match(formatDate(iso, 'te'), /2026/);
console.log('format: ok');
