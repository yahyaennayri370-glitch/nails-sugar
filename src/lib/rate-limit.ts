/**
 * In-memory rate limiter for API endpoints.
 *
 * Uses a sliding-window counter approach. In production with multiple
 * instances, replace with Redis-backed rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/** Pre-defined rate limit profiles */
export const RATE_LIMITS = {
  /** Login attempts: strict */
  login: { maxRequests: 5, windowSeconds: 300 } as RateLimitConfig,
  /** Booking creation: moderate */
  booking: { maxRequests: 10, windowSeconds: 60 } as RateLimitConfig,
  /** Contact/public form: moderate */
  contact: { maxRequests: 5, windowSeconds: 60 } as RateLimitConfig,
  /** Admin API: generous */
  admin: { maxRequests: 60, windowSeconds: 60 } as RateLimitConfig,
  /** General API: generous */
  general: { maxRequests: 100, windowSeconds: 60 } as RateLimitConfig,
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Check rate limit for a given identifier.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    store.set(key, {
      count: 1,
      resetTime: now + config.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
    };
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Extract client IP from request headers.
 * Handles X-Forwarded-For for reverse proxy setups.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}
