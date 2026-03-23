/**
 * api/routes/gallery.js
 */
import { Router } from 'express';
import db from '../../config/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getPresignedUploadUrl, validatePhotoUpload } from '../services/storage.js';

const router = Router();

// GET /api/gallery/categories — distinct categories + count
router.get('/categories', async (req, res, next) => {
  try {
    const rows = await db.query(
      `SELECT category AS label, COUNT(*) AS count
       FROM photos
       GROUP BY category
       ORDER BY count DESC`
    );
    // Fallback static categories if no photos yet
    if (!rows.length) {
      return res.json([
        ['🌆','Golden Hour'],['🌿','Botanica'],['👤','Portraits'],
        ['🌊','Seascape'],['🏙','Urban Life'],['🎭','Street'],
        ['🌌','Astrophoto'],['🍂','Seasons'],['🔬','Macro'],
      ]);
    }
    const emojiMap = {
      'Golden Hour':'🌆','Botanica':'🌿','Portraits':'👤','Seascape':'🌊',
      'Urban Life':'🏙','Street':'🎭','Astrophoto':'🌌','Seasons':'🍂','Macro':'🔬',
    };
    res.json(rows.map(r => [emojiMap[r.label] || '📷', r.label]));
  } catch (err) { next(err); }
});

// GET /api/gallery?category=Street&featured=true
router.get('/', async (req, res, next) => {
  try {
    const { category, featured, limit = 50 } = req.query;
    const rows = await db.query(
      `SELECT p.id, p.url, p.title, p.category, p.shot_at, m.name AS author
       FROM photos p
       JOIN members m ON p.member_id = m.id
       WHERE ($1::text IS NULL OR p.category = $1)
         AND ($2::boolean IS NULL OR p.is_featured = $2)
       ORDER BY p.uploaded_at DESC
       LIMIT $3`,
      [category || null, featured === 'true' ? true : null, Number(limit)]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/gallery — upload metadata (actual file goes to object storage via presigned URL)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, filename, url, category, shot_at } = req.body;
    if (!filename || !url) return res.status(400).json({ error: 'filename and url required' });
    const photo = await db.queryOne(
      `INSERT INTO photos (member_id, title, filename, url, category, shot_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, title, filename, url, category, shot_at || null]
    );
    res.status(201).json(photo);
  } catch (err) { next(err); }
});

// POST /api/gallery/presign — get a presigned S3 URL for direct upload
router.post('/presign', requireAuth, async (req, res, next) => {
  try {
    const { filename, mimeType, sizeBytes } = req.body;
    if (!filename || !mimeType) {
      return res.status(400).json({ error: 'filename and mimeType required' });
    }
    const validation = validatePhotoUpload(mimeType, sizeBytes);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const result = await getPresignedUploadUrl(filename, mimeType, req.user.id);
    res.json(result); // { key, uploadUrl, publicUrl }
  } catch (err) {
    if (err.message.includes('Storage not configured')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
