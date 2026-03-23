/**
 * api/routes/members.js
 * GET  /api/members               — all active members
 * GET  /api/members?role=committee — committee only
 * GET  /api/members/:id
 * POST /api/members/apply          — public join application
 * POST /api/members               — admin: create member (JWT required)
 * PATCH /api/members/:id           — admin: update member (JWT required)
 */

import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendJoinConfirmation } from '../services/email.js';
import { joinLimiter } from '../middleware/rate-limit.js';

const router = Router();

// ── GET /api/members ─────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    const rows = await db.query(
      `SELECT id, name, committee_role AS role, avatar_emoji AS avatar, is_active
       FROM members
       WHERE is_active = true
         AND ($1::text IS NULL OR role = $1)
       ORDER BY
         CASE role WHEN 'admin' THEN 0 WHEN 'committee' THEN 1 ELSE 2 END,
         joined_at ASC`,
      [role || null]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/members/:id ─────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const member = await db.queryOne(
      'SELECT id, name, email, committee_role, avatar_emoji, bio, joined_at FROM members WHERE id = $1',
      [req.params.id]
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) { next(err); }
});

// ── POST /api/members/apply — public join form ───────────────
router.post('/apply', joinLimiter, async (req, res, next) => {
  try {
    const { name, email, level, bio } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    const existing = await db.queryOne(
      'SELECT id FROM members WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const app = await db.queryOne(
      `INSERT INTO applications (name, email, level, bio)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, created_at`,
      [name, email.toLowerCase(), level, bio]
    );

    // Fire-and-forget confirmation email
    sendJoinConfirmation(app).catch(console.error);

    res.status(201).json({ message: 'Application received', id: app.id });
  } catch (err) { next(err); }
});

// ── POST /api/members — admin create ────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, role, committee_role, avatar_emoji, experience, bio } = req.body;
    const member = await db.queryOne(
      `INSERT INTO members (name, email, role, committee_role, avatar_emoji, experience, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email.toLowerCase(), role || 'member', committee_role, avatar_emoji || '📷', experience, bio]
    );
    res.status(201).json(member);
  } catch (err) { next(err); }
});

// ── PATCH /api/members/:id — admin update ────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, role, committee_role, avatar_emoji, is_active, dues_paid_until } = req.body;
    const member = await db.queryOne(
      `UPDATE members SET
         name             = COALESCE($2, name),
         role             = COALESCE($3, role),
         committee_role   = COALESCE($4, committee_role),
         avatar_emoji     = COALESCE($5, avatar_emoji),
         is_active        = COALESCE($6, is_active),
         dues_paid_until  = COALESCE($7, dues_paid_until)
       WHERE id = $1
       RETURNING *`,
      [req.params.id, name, role, committee_role, avatar_emoji, is_active, dues_paid_until]
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) { next(err); }
});

export default router;
