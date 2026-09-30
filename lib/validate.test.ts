// node --experimental-strip-types lib/validate.test.ts
import assert from 'node:assert';
import { isValidUpi, isOwnStorageUrl, isTrustedAuthRedirect } from './validate.ts';

// UPI: real handles pass.
for (const ok of ['ravi.kumar@okaxis', 'shop_42@ybl', '9876543210@paytm', 'a-b@upi', '  ravi@oksbi  ']) {
  assert.ok(isValidUpi(ok), `should accept ${ok}`);
}
// The old check was includes('@'), which let all of these through.
for (const bad of ['@', 'a@', '@okaxis', 'r@okaxis', 'ravi@ok axis', 'ravi@okaxis1', 'ravi@@okaxis', 'ravi kumar@okaxis', 'https://evil.example/@x']) {
  assert.ok(!isValidUpi(bad), `should reject ${bad}`);
}

// Voice intro: only our own public storage.
const base = 'https://abc.supabase.co';
const own = `${base}/storage/v1/object/public/provider-gallery/u1/voice-1.m4a`;
assert.ok(isOwnStorageUrl(own, base));
assert.ok(isOwnStorageUrl(own, `${base}/`), 'trailing slash on the base');
assert.ok(!isOwnStorageUrl('https://abc.supabase.co.evil.example/storage/v1/object/public/x', base), 'host suffix trick');
assert.ok(!isOwnStorageUrl('http://abc.supabase.co/storage/v1/object/public/x', base), 'plain http');
assert.ok(!isOwnStorageUrl('javascript:alert(1)', base));
assert.ok(!isOwnStorageUrl(`${base}/auth/v1/logout`, base), 'other paths on our host');
assert.ok(!isOwnStorageUrl(null, base));
assert.ok(!isOwnStorageUrl(own, undefined), 'no configured base → never open');

// Sign-in redirects: only on auth-callback, only while our sign-in is pending.
const now = 1_000_000;
const cb = 'knock://auth-callback#access_token=a&refresh_token=b';
assert.ok(isTrustedAuthRedirect(cb, now + 1, now));
assert.ok(isTrustedAuthRedirect('exp://192.168.1.5:8081/--/auth-callback?code=x', now + 1, now), 'Expo Go form');
assert.ok(!isTrustedAuthRedirect(cb, 0, now), 'no sign-in in flight');
assert.ok(!isTrustedAuthRedirect(cb, now - 1, now), 'window expired');
assert.ok(!isTrustedAuthRedirect('knock://home#access_token=a&refresh_token=b', now + 1, now), 'other path');
assert.ok(!isTrustedAuthRedirect('knock://evil/?next=auth-callback#access_token=a', now + 1, now), 'auth-callback only in the query');
assert.ok(!isTrustedAuthRedirect('knock://not-auth-callback#access_token=a', now + 1, now), 'suffix trick');

console.log('validate: ok');
