/**
 * config/run-schema.js
 * ─────────────────────────────────────────────────────────────
 * Runs config/schema.sql against the database using the pg
 * Node.js driver — no psql binary needed, works on Windows.
 *
 * Run: npm run db:init
 * ─────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import pg from 'pg';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

async function runSchema() {
  if (!process.env.DATABASE_URL) {
    console.error('\n❌  DATABASE_URL is not set in your .env file.\n');
    console.error('    Copy .env.example to .env and fill in your database connection string.\n');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  let client;
  try {
    client = await pool.connect();
    console.log('✅  Connected to database.\n');

    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

    // Split on semicolons to run statement by statement,
    // skipping blank lines and comments
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let count = 0;
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        count++;
        // Print first line of each statement as progress
        const preview = stmt.split('\n').find(l => l.trim() && !l.trim().startsWith('--')) || '';
        console.log(`  ✓  ${preview.slice(0, 72)}${preview.length > 72 ? '…' : ''}`);
      } catch (err) {
        // Already-exists errors (42P07 = duplicate table, 42710 = duplicate object) are fine
        if (err.code === '42P07' || err.code === '42710' || err.code === '42701') {
          console.log(`  ~  (already exists, skipped)`);
        } else {
          console.error(`\n❌  Statement failed:\n${stmt}\n\nError: ${err.message}\n`);
          throw err;
        }
      }
    }

    console.log(`\n✅  Schema applied — ${count} statements executed.\n`);
    console.log('    Next step: npm run db:seed\n');

  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runSchema().catch(err => {
  console.error('\n❌  Schema run failed:', err.message, '\n');
  process.exit(1);
});
