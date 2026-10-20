/**
 * In-memory sliding-window rate limiter. Adequate for a single instance; a multi-instance
 * deployment needs a shared store (documented in docs/DEPLOYMENT.md).
 */
const g = globalThis as unknown as { __tcRate?: Map<string, number[]> };
const buckets: Map<string, number[]> = (g.__tcRate ??= new Map());

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false as const, retryAfterMs: hits[0] + windowMs - now };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 50_000) {
    for (const [k, v] of buckets) if (!v.some((t) => t > now - windowMs)) buckets.delete(k);
  }
  return { ok: true as const };
}

export function resetRateLimits() {
  buckets.clear();
}
