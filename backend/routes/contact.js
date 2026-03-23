/**
 * backend/routes/contact.js
 * POST /api/contact   — public contact form submission
 * GET  /api/contact   — admin: view all messages
 * PATCH /api/contact/:id/read  — admin: mark as read
 * DELETE /api/contact/:id      — admin: delete message
 */

import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendContactNotification } from '../services/email.js';

const router = Router();

// ── POST /api/contact — public form ──────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const msg = await db.queryOne(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, subject, created_at`,
      [name.trim(), email.toLowerCase().trim(), subject?.trim() || null, message.trim()]
    );

    // Notify coordinator by email (fire and forget)
    sendContactNotification(msg).catch(console.error);

    res.status(201).json({ message: 'Message received. We will get back to you soon!' });
  } catch (err) { next(err); }
});

// ── GET /api/contact — admin: list all messages ───────────────
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { unread } = req.query;
    const rows = await db.query(
      `SELECT id, name, email, subject, message, is_read, created_at
       FROM contact_messages
       WHERE ($1::boolean IS NULL OR is_read = NOT $1)
       ORDER BY created_at DESC`,
      [unread === 'true' ? true : null]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── PATCH /api/contact/:id/read — mark as read ────────────────
router.patch('/:id/read', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const msg = await db.queryOne(
      `UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) { next(err); }
});

// ── DELETE /api/contact/:id ───────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;