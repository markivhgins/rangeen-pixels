/**
 * api/routes/announcements.js
 * GET   /api/announcements         — active announcements (ticker items)
 * POST  /api/announcements         — admin: create announcement
 * PATCH /api/announcements/:id     — admin: update / toggle active
 * DELETE /api/announcements/:id    — admin: delete
 * PATCH /api/announcements/reorder — admin: update sort_order for all
 */

import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ── GET /api/announcements ───────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT id, label, sort_order
       FROM announcements
       WHERE is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY sort_order ASC, created_at ASC`
    );
    // Fallback static data if table is empty
    if (!rows.length) {
      return res.json([
        { label: 'Rangeen Pixels Photography Club — Est. 2019' },
        { label: 'Monthly Photowalks — Every First Saturday' },
        { label: 'Annual Exhibition — Spring 2026' },
        { label: 'Workshop: Studio Lighting — Register Now' },
        { label: '47 Active Members This Semester' },
      ]);
    }
    res.json(rows);
  } catch (err) { next(err); }
});

// ── POST /api/announcements ──────────────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { label, sort_order, expires_at } = req.body;
    if (!label) return res.status(400).json({ error: 'label required' });
    const row = await db.queryOne(
      `INSERT INTO announcements (label, sort_order, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [label, sort_order ?? 0, expires_at ?? null]
    );
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// ── PATCH /api/announcements/reorder ────────────────────────
router.patch('/reorder', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // body: [{ id, sort_order }, ...]
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
    await Promise.all(items.map(({ id, sort_order }) =>
      db.query('UPDATE announcements SET sort_order = $2 WHERE id = $1', [id, sort_order])
    ));
    res.json({ message: 'Reordered' });
  } catch (err) { next(err); }
});

// ── PATCH /api/announcements/:id ────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { label, is_active, sort_order, expires_at } = req.body;
    const row = await db.queryOne(
      `UPDATE announcements SET
         label      = COALESCE($2, label),
         is_active  = COALESCE($3, is_active),
         sort_order = COALESCE($4, sort_order),
         expires_at = COALESCE($5, expires_at)
       WHERE id = $1
       RETURNING *`,
      [req.params.id, label, is_active, sort_order, expires_at]
    );
    if (!row) return res.status(404).json({ error: 'Announcement not found' });
    res.json(row);
  } catch (err) { next(err); }
});

// ── DELETE /api/announcements/:id ───────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
