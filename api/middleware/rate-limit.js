/**
 * api/middleware/rate-limit.js
 * ─────────────────────────────────────────────────────────────
 * Simple in-memory rate limiter (no extra deps).
 * For production with multiple server instances, swap the
 * store to Redis using `express-rate-limit` + `rate-limit-redis`.
 *
 * Usage:
 *   import { apiLimiter, authLimiter, applyLimiter } from './rate-limit.js'
 *   router.post('/login', authLimiter, handler)
 *   app.use('/api', apiLimiter)
 * ─────────────────────────────────────────────────────────────
 */

const store = new Map(); // ip → { count, resetAt }

function createLimiter({ windowMs, max, message }) {
  return function rateLimiter(req, res, next) {
    const ip  = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(ip, entry);
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      return res.status(429).json({ error: message || 'Too many requests, please try again later.' });
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - entry.count);
    next();
  };
}

// General API: 120 req / minute
export const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Too many requests. Please wait a moment.',
});

// Auth endpoints: 10 attempts / 15 minutes (brute-force protection)
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});

// Join form: 5 submissions / hour per IP
export const joinLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many applications submitted from this address.',
});

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(ip);
  }
}, 10 * 60 * 1000);
