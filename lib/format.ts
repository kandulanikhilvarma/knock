// Display formatting. Pure: no Supabase import, so Node tests can load it.

// Indian digit grouping (1,23,456) — Hermes Intl can't be relied on for this.
export function formatINR(n: number): string {
  const r = Math.round(n);
  const s = Math.abs(r).toString();
  const sign = r < 0 ? '-' : '';
  if (s.length <= 3) return sign + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return sign + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

// Short date in the app language, e.g. "3 Sept 2026" / "3 సెప్టెం 2026".
// Without Intl data the engine falls back to its default locale; still a date.
export function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(`${lang}-IN`, { day: 'numeric', month: 'short', year: 'numeric' });
}
