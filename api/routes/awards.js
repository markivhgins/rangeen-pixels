/**
 * api/routes/awards.js
 */
import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT a.id, a.title, a.description AS desc, a.year, a.level,
              COALESCE(m.name, a.winner_name) AS winner_name
       FROM awards a
       LEFT JOIN members m ON a.winner_id = m.id
       ORDER BY a.awarded_at DESC NULLS LAST, a.year DESC`
    );
    // Map to frontend shape: { title, desc }
    const shaped = rows.map(r => ({
      title: r.year ? `${r.year} ${r.title}` : r.title,
      desc:  r.winner_name ? `${r.winner_name}${r.desc ? ' — ' + r.desc : ''}` : (r.desc || ''),
    }));
    res.json(shaped);
  } catch (err) { next(err); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, year, winner_id, winner_name, level, awarded_at } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const award = await db.queryOne(
      `INSERT INTO awards (title, description, year, winner_id, winner_name, level, awarded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, year, winner_id || null, winner_name, level || 'national', awarded_at || null]
    );
    res.status(201).json(award);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await db.query('DELETE FROM awards WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
