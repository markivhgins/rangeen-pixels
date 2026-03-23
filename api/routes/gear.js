/**
 * api/routes/gear.js
 * GET  /api/gear                 — full gear list with availability
 * GET  /api/gear/:id
 * POST /api/gear/book            — book a piece of gear (auth required)
 * POST /api/gear/:id/return      — mark gear returned (auth required)
 * POST /api/gear                 — admin: add gear
 * PATCH /api/gear/:id            — admin: update gear
 */

import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ── GET /api/gear ────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT
         g.id, g.icon, g.name, g.description, g.category, g.condition,
         g.is_available,
         l.due_at,
         m.name AS loaned_to
       FROM gear g
       LEFT JOIN gear_loans l ON l.gear_id = g.id AND l.returned_at IS NULL
       LEFT JOIN members m ON l.member_id = m.id
       ORDER BY g.category, g.name`
    );

    // Shape to match frontend: { icon, name, status }
    const shaped = rows.map(r => ({
      id:           r.id,
      icon:         r.icon,
      name:         r.name,
      status:       r.is_available
        ? `${r.description || r.category} · Available`
        : `On loan until ${new Date(r.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      is_available: r.is_available,
      category:     r.category,
      condition:    r.condition,
    }));
    res.json(shaped);
  } catch (err) { next(err); }
});

// ── GET /api/gear/:id ────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const item = await db.queryOne('SELECT * FROM gear WHERE id = $1', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Gear not found' });
    res.json(item);
  } catch (err) { next(err); }
});

// ── POST /api/gear/book ──────────────────────────────────────
router.post('/book', requireAuth, async (req, res, next) => {
  try {
    const { gearId, returnDate } = req.body;
    if (!gearId || !returnDate) return res.status(400).json({ error: 'gearId and returnDate required' });

    // Check availability
    const item = await db.queryOne('SELECT * FROM gear WHERE id = $1', [gearId]);
    if (!item) return res.status(404).json({ error: 'Gear not found' });
    if (!item.is_available) return res.status(409).json({ error: 'Gear is not available' });

    // Max 48-hour loan
    const due = new Date(returnDate);
    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);
    if (diffHours > 48) return res.status(400).json({ error: 'Maximum loan period is 48 hours' });

    // Create loan + mark unavailable
    const [loan] = await Promise.all([
      db.queryOne(
        `INSERT INTO gear_loans (gear_id, member_id, due_at)
         VALUES ($1, $2, $3) RETURNING *`,
        [gearId, req.user.id, due]
      ),
      db.query('UPDATE gear SET is_available = false WHERE id = $1', [gearId]),
    ]);
    res.status(201).json(loan);
  } catch (err) { next(err); }
});

// ── POST /api/gear/:id/return ────────────────────────────────
router.post('/:id/return', requireAuth, async (req, res, next) => {
  try {
    const loan = await db.queryOne(
      `UPDATE gear_loans SET returned_at = NOW()
       WHERE gear_id = $1 AND member_id = $2 AND returned_at IS NULL
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!loan) return res.status(404).json({ error: 'Active loan not found' });
    await db.query('UPDATE gear SET is_available = true WHERE id = $1', [req.params.id]);
    res.json({ message: 'Returned successfully', loan });
  } catch (err) { next(err); }
});

// ── POST /api/gear — admin: add item ─────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { icon, name, description, category, condition } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const item = await db.queryOne(
      `INSERT INTO gear (icon, name, description, category, condition)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [icon || '📷', name, description, category, condition || 'good']
    );
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// ── PATCH /api/gear/:id ───────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { icon, name, description, category, condition, is_available } = req.body;
    const item = await db.queryOne(
      `UPDATE gear SET
         icon         = COALESCE($2, icon),
         name         = COALESCE($3, name),
         description  = COALESCE($4, description),
         category     = COALESCE($5, category),
         condition    = COALESCE($6, condition),
         is_available = COALESCE($7, is_available)
       WHERE id = $1 RETURNING *`,
      [req.params.id, icon, name, description, category, condition, is_available]
    );
    if (!item) return res.status(404).json({ error: 'Gear not found' });
    res.json(item);
  } catch (err) { next(err); }
});

export default router;
