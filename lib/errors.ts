// Turn any thrown value into one short, localized line for the screen. The raw
// text (Postgres, fetch, English lib errors) goes to Sentry, never to users.
// Pure: no Supabase import, so Node tests can load it.

type T = (key: string) => string;

const NETWORK = /network request failed|failed to fetch|networkerror|load failed|timed? ?out/i;

export function errorMessage(e: unknown, t: T): string {
  const err = (e ?? {}) as { message?: unknown; name?: unknown; code?: unknown; status?: unknown };
  const msg = typeof err.message === 'string' ? err.message : '';
  const code = typeof err.code === 'string' ? err.code : '';

  if (err.name === 'AuthRetryableFetchError' || err.name === 'FunctionsFetchError' || NETWORK.test(msg)) {
    return t('common.offline');
  }
  if (err.status === 429 || code.startsWith('over_')) return t('common.tooMany');
  if (code === 'otp_expired') return t('common.codeWrong');
  // lib/photos.ts wording only: Postgres 'permission denied' is not a phone setting.
  if (/photo access denied/i.test(msg)) return t('common.permission');
  if (/not signed in/i.test(msg)) return t('common.signedOut');
  return t('common.errorGeneric');
}
