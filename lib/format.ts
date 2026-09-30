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
