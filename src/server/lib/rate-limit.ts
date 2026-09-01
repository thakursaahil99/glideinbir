// A basic in-memory sliding-window limiter for abuse-prone public endpoints
// (login, register, forgot-password, contact). It's per-instance, not
// global — on Vercel a burst can be spread across multiple warm lambdas, so
// this is a speed bump against casual scripted abuse, not a hard guarantee.
// If this site ever needs a real guarantee, swap this module for a
// Redis/Upstash-backed limiter without touching call sites.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Sweep occasionally so `buckets` doesn't grow forever under sustained
// traffic — cheap since it only runs when the map has grown large.
function sweep() {
  if (buckets.size < 5000) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true if the call is allowed, false if the caller should be
 * rejected (429). `key` should already include the route name so limits
 * for different endpoints don't share a bucket.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  sweep();
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

// Best-effort caller IP from the headers Vercel/Next set on the request.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}
