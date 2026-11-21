// ==============================================================================
// KAABIL (काबIL) — Authentication Rate Limiter & Brute-Force Shield
// In-memory sliding window rate limiter for login & authentication attempts
// ==============================================================================

interface RateLimitRecord {
  attempts: number[];
}

const globalForLimiter = globalThis as unknown as {
  authRateLimitStore: Map<string, RateLimitRecord> | undefined;
};

const store = globalForLimiter.authRateLimitStore ?? new Map<string, RateLimitRecord>();
if (process.env.NODE_ENV !== "production") globalForLimiter.authRateLimitStore = store;

export interface RateLimitStatus {
  isAllowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Checks if an action key (e.g. "login:ip:email") is within rate limits.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900 // 15 minutes default
): RateLimitStatus {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  const record = store.get(key);
  if (!record) {
    return { isAllowed: true, remaining: maxAttempts, resetInSeconds: 0 };
  }

  // Filter out attempts older than the window
  const activeAttempts = record.attempts.filter((timestamp) => timestamp > cutoff);
  record.attempts = activeAttempts;

  if (activeAttempts.length >= maxAttempts) {
    const oldest = activeAttempts[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      isAllowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  return {
    isAllowed: true,
    remaining: maxAttempts - activeAttempts.length,
    resetInSeconds: 0,
  };
}

/**
 * Records a failed attempt for the given key.
 */
export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = store.get(key);

  if (!record) {
    store.set(key, { attempts: [now] });
  } else {
    record.attempts.push(now);
  }
}

/**
 * Resets the attempt counter upon successful authentication.
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * General API route rate limiter (sliding window).
 * Defaults to 60 requests per minute per identifier (e.g., client IP or User ID).
 */
export function checkApiRateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): RateLimitStatus {
  const key = `api:${identifier}`;
  const status = checkRateLimit(key, maxRequests, windowSeconds);
  if (status.isAllowed) {
    recordFailedAttempt(key); // Count this request against the quota
  }
  return status;
}
