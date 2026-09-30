// node --experimental-strip-types lib/errors.test.ts
import assert from 'node:assert';
import { errorMessage } from './errors.ts';

const t = (k: string) => k;
const is = (e: unknown, key: string) => assert.strictEqual(errorMessage(e, t), key, String((e as Error)?.message ?? e));

// Offline, in the shapes RN, browsers and supabase-js throw.
is(new TypeError('Network request failed'), 'common.offline');
is(new TypeError('Failed to fetch'), 'common.offline');
is(Object.assign(new Error('x'), { name: 'AuthRetryableFetchError' }), 'common.offline');
is(Object.assign(new Error('Failed to send a request to the Edge Function'), { name: 'FunctionsFetchError' }), 'common.offline');

// Rate limits and auth codes.
is({ message: 'Email rate limit exceeded', status: 429 }, 'common.tooMany');
is({ message: 'x', code: 'over_email_send_rate_limit' }, 'common.tooMany');
is({ message: 'Token has expired or is invalid', code: 'otp_expired' }, 'common.codeWrong');

// Our own lib errors.
is(new Error('Photo access denied'), 'common.permission');
is(new Error('not signed in'), 'common.signedOut');

// Anything else never leaks raw text.
is(new Error('new row violates row-level security policy for table "bookings"'), 'common.errorGeneric');
is({ message: 'duplicate key value violates unique constraint' }, 'common.errorGeneric');
is({ message: 'permission denied for table bookings', code: '42501' }, 'common.errorGeneric');
is(null, 'common.errorGeneric');
is(undefined, 'common.errorGeneric');
is('boom', 'common.errorGeneric');

console.log('errors: ok');
