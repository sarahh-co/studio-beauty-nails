import "server-only";

// In-memory sliding-window rate limiter, keyed by caller IP.
//
// Serverless instances do not share memory, so these limits are
// per-instance and approximate, not a global guarantee across all
// instances handling traffic for the app.
//
// IPs are only ever held in this map for the duration of their rate
// limit window (RGPD: personal data, kept nowhere else, never logged).

type Bucket = {
  timestamps: number[];
  expiresAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Keep the map from growing without bound.
  sweepExpired(now);

  const windowStart = now - windowMs;
  const existing = buckets.get(key);
  const timestamps = (existing?.timestamps ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    buckets.set(key, { timestamps, expiresAt: now + windowMs });
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  timestamps.push(now);
  buckets.set(key, { timestamps, expiresAt: now + windowMs });

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Reads the caller's IP from standard proxy headers. Returns null when
 * neither header is present — callers must treat null as "allow the
 * request", never as a reason to block.
 */
export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    const trimmed = realIp.trim();
    if (trimmed) return trimmed;
  }

  return null;
}
