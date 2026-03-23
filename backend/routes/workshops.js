/**
 * api/routes/workshops.js
 */
import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query;
    const rows = await db.query(
      `SELECT w.id, w.icon, w.title, w.description AS desc, m.name AS instructor
       FROM workshops w
       LEFT JOIN members m ON w.instructor = m.id
       WHERE ($1::boolean IS NULL OR w.is_active = $1)
       ORDER BY w.title`,
      [active === 'true' ? true : null]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { icon, title, description, instructor, semester } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const w = await db.queryOne(
      `INSERT INTO workshops (icon, title, description, instructor, semester)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [icon || '◉', title, description, instructor || null, semester]
    );
    res.status(201).json(w);
  } catch (err) { next(err); }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { icon, title, description, is_active } = req.body;
    const w = await db.queryOne(
      `UPDATE workshops SET
         icon        = COALESCE($2,icon),
         title       = COALESCE($3,title),
         description = COALESCE($4,description),
         is_active   = COALESCE($5,is_active)
       WHERE id=$1 RETURNING *`,
      [req.params.id, icon, title, description, is_active]
    );
    if (!w) return res.status(404).json({ error: 'Workshop not found' });
    res.json(w);
  } catch (err) { next(err); }
});

export default router;
