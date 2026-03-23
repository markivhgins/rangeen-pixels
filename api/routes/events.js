/**
 * api/routes/events.js
 * GET  /api/events              — all events (optional ?upcoming=true)
 * GET  /api/events/:id
 * POST /api/events/:id/rsvp     — RSVP to an event (auth required)
 * POST /api/events              — admin: create event
 * PATCH /api/events/:id         — admin: update event
 * DELETE /api/events/:id        — admin: delete event
 */

import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ── GET /api/events ──────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { upcoming } = req.query;
    const rows = await db.query(
      `SELECT
         id, title, location, description,
         starts_at, ends_at, event_type, max_spots,
         (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') AS rsvp_count
       FROM events e
       WHERE is_public = true
         AND ($1::boolean IS NULL OR starts_at >= NOW())
       ORDER BY starts_at ASC`,
      [upcoming === 'true' ? true : null]
    );

    // Shape into the format the frontend expects:
    // { day, month, title, info }
    const shaped = rows.map(r => ({
      id:    r.id,
      day:   new Date(r.starts_at).getDate().toString().padStart(2, '0'),
      month: new Date(r.starts_at).toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      title: r.title,
      info:  [r.location, new Date(r.starts_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })].filter(Boolean).join(' · '),
      // Raw data for richer use
      starts_at:  r.starts_at,
      event_type: r.event_type,
      rsvp_count: Number(r.rsvp_count),
      max_spots:  r.max_spots,
    }));
    res.json(shaped);
  } catch (err) { next(err); }
});

// ── GET /api/events/:id ──────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const event = await db.queryOne(
      `SELECT e.*, m.name AS created_by_name
       FROM events e
       LEFT JOIN members m ON e.created_by = m.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
});

// ── POST /api/events/:id/rsvp ────────────────────────────────
router.post('/:id/rsvp', requireAuth, async (req, res, next) => {
  try {
    const { status = 'going' } = req.body;
    const rsvp = await db.queryOne(
      `INSERT INTO rsvps (event_id, member_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, member_id)
       DO UPDATE SET status = $3
       RETURNING *`,
      [req.params.id, req.user.id, status]
    );
    res.json(rsvp);
  } catch (err) { next(err); }
});

// ── POST /api/events — admin create ─────────────────────────
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, location, description, starts_at, ends_at, event_type, max_spots } = req.body;
    if (!title || !starts_at) return res.status(400).json({ error: 'title and starts_at required' });
    const event = await db.queryOne(
      `INSERT INTO events (title, location, description, starts_at, ends_at, event_type, max_spots, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, location, description, starts_at, ends_at, event_type || 'photowalk', max_spots, req.user.id]
    );
    res.status(201).json(event);
  } catch (err) { next(err); }
});

// ── PATCH /api/events/:id ────────────────────────────────────
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, location, description, starts_at, ends_at, event_type, is_public, max_spots } = req.body;
    const event = await db.queryOne(
      `UPDATE events SET
         title       = COALESCE($2, title),
         location    = COALESCE($3, location),
         description = COALESCE($4, description),
         starts_at   = COALESCE($5, starts_at),
         ends_at     = COALESCE($6, ends_at),
         event_type  = COALESCE($7, event_type),
         is_public   = COALESCE($8, is_public),
         max_spots   = COALESCE($9, max_spots)
       WHERE id = $1
       RETURNING *`,
      [req.params.id, title, location, description, starts_at, ends_at, event_type, is_public, max_spots]
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
});

// ── DELETE /api/events/:id ───────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
