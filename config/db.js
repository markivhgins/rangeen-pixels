/**
 * config/db.js
 * ─────────────────────────────────────────────────────────────
 * PostgreSQL connection pool using the `pg` package.
 * All DB interaction in route files goes through this pool.
 * ─────────────────────────────────────────────────────────────
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For local dev without DATABASE_URL, set individual vars:
  // host:     process.env.DB_HOST     || 'localhost',
  // port:     process.env.DB_PORT     || 5432,
  // database: process.env.DB_NAME     || 'rangeen_pixels',
  // user:     process.env.DB_USER     || 'postgres',
  // password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }   // Render / Railway / Supabase
    : false,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

/**
 * Convenience wrapper: await db.query(sql, params)
 * Returns rows[] directly.
 */
export const db = {
  async query(text, params = []) {
    const start = Date.now();
    const res   = await pool.query(text, params);
    const dur   = Date.now() - start;
    if (process.env.DEBUG_SQL) console.log(`[SQL ${dur}ms] ${text.slice(0, 80)}`);
    return res.rows;
  },
  async queryOne(text, params = []) {
    const rows = await this.query(text, params);
    return rows[0] ?? null;
  },
  pool,
};

export default db;
