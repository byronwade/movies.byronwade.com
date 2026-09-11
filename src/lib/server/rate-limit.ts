const buckets = new Map<string, { n: number; t: number }>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || now - cur.t > windowMs) {
    buckets.set(key, { n: 1, t: now });
    return true;
  }
  cur.n += 1;
  return cur.n <= max;
}
