/**
 * api/middleware/error-handler.js
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}
