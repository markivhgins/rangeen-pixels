/**
 * api/routes/auth.js
 * POST /api/auth/login    — email + password → access + refresh tokens
 * POST /api/auth/refresh  — refresh access token
 * POST /api/auth/logout   — invalidate refresh token
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../config/db.js';

const router = Router();
const ACCESS_TTL  = '15m';
const REFRESH_TTL = '7d';
const JWT_SECRET  = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

function signAccess(member) {
  return jwt.sign(
    { id: member.id, role: member.role, name: member.name },
    JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const member = await db.queryOne(
      'SELECT * FROM members WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
    if (!member || !member.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, member.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccess(member);
    const refreshToken = jwt.sign({ id: member.id }, JWT_SECRET, { expiresIn: REFRESH_TTL });

    await db.query(
      `INSERT INTO refresh_tokens (member_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [member.id, refreshToken]
    );

    res.json({
      accessToken,
      refreshToken,
      member: { id: member.id, name: member.name, role: member.role },
    });
  } catch (err) { next(err); }
});

// ── POST /api/auth/refresh ───────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const stored = await db.queryOne(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    if (!stored) return res.status(401).json({ error: 'Invalid or expired refresh token' });

    const member = await db.queryOne('SELECT * FROM members WHERE id = $1', [payload.id]);
    if (!member) return res.status(401).json({ error: 'Member not found' });

    res.json({ accessToken: signAccess(member) });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    next(err);
  }
});

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
});

export default router;
