// Input checks for forms and for stored values the app acts on.
// Pure: no Supabase import, so Node tests can load it.

// UPI VPA: handle@psp. The handle takes letters, digits, dot, hyphen and
// underscore; the PSP part is letters only. Same rule as migration 0024
// (Postgres caps a regex bound at 255, so the handle does too).
const UPI_RE = /^[\w.-]{2,255}@[a-zA-Z]{2,64}$/;

export function isValidUpi(value: string): boolean {
  return UPI_RE.test(value.trim());
}

// A provider can write any string into voice_intro_url. Open only files served
// from our own Supabase Storage, never an arbitrary link.
export function isOwnStorageUrl(url: string | null | undefined, supabaseUrl: string | undefined): boolean {
  if (!url || !supabaseUrl) return false;
  return url.startsWith(`${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/`);
}
