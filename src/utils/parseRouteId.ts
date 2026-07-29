/**
 * Normalize a route/query id to a positive integer string, or null if junk
 * (e.g. "24447&", "NaN", empty).
 */
export const parseRouteId = (value: unknown): string | null => {
  if (value == null) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  if (!Number.isSafeInteger(n) || n <= 0) return null;
  return text;
};

export const parseRouteIdNumber = (value: unknown): number | null => {
  const text = parseRouteId(value);
  return text ? Number(text) : null;
};
