/**
 * Rate Limiting Middleware
 * Limits API requests to 20 per hour per IP address
 * Uses in-memory storage (resets on server restart)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number; // Unix timestamp
}

// In-memory store for rate limits
// Note: This resets on server restart. For production, consider using Netlify Blobs or Redis
const rateLimits = new Map<string, RateLimitEntry>();

const RATE_LIMIT = 20; // Requests per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, entry] of rateLimits.entries()) {
    if (entry.resetTime < now) {
      rateLimits.delete(ip);
    }
  }
}

/**
 * Rate limiting middleware
 */
export default defineEventHandler(async (event) => {
  // Skip rate limiting for health check endpoint
  if (event.path === '/api/health') {
    return;
  }

  // Only apply to API routes
  if (!event.path?.startsWith('/api/')) {
    return;
  }

  // Get client IP address
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown';

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupExpiredEntries();
  }

  const now = Date.now();
  let entry = rateLimits.get(ip);

  // Initialize or reset if window expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
    rateLimits.set(ip, entry);
  }

  // Increment request count
  entry.count += 1;

  // Set rate limit headers
  const remaining = Math.max(0, RATE_LIMIT - entry.count);
  const resetTimeSeconds = Math.ceil(entry.resetTime / 1000);

  setResponseHeaders(event, {
    'X-RateLimit-Limit': RATE_LIMIT.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTimeSeconds.toString(),
  });

  // Check if rate limit exceeded
  if (entry.count > RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    setResponseHeaders(event, {
      'Retry-After': retryAfter.toString(),
    });

    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Maximum ${RATE_LIMIT} requests per hour.`,
          details: {
            limit: RATE_LIMIT,
            remaining: 0,
            resetTime: entry.resetTime,
            retryAfter,
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
});
