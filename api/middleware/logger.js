/**
 * api/middleware/logger.js
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const dur = Date.now() - start;
    const color = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}${req.method}\x1b[0m ${req.path} ${res.statusCode} — ${dur}ms`);
  });
  next();
}
