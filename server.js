/**
 * server.js  — Rangeen Pixels Club Backend
 * ─────────────────────────────────────────────────────────────
 * Stack: Node.js · Express · PostgreSQL (via pg)
 * Auth:  JWT (jsonwebtoken)
 * Email: Nodemailer (for join confirmations)
 *
 * Start: node server.js   or   npm start
 * Dev:   nodemon server.js
 * ─────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import express     from 'express';
import cors        from 'cors';
import helmet      from 'helmet';
import compression from 'compression';
import path        from 'path';
import { fileURLToPath } from 'url';

import sectionsRouter       from './api/routes/sections.js';
import eventsRouter         from './api/routes/events.js';
import membersRouter        from './api/routes/members.js';
import gearRouter           from './api/routes/gear.js';
import workshopsRouter      from './api/routes/workshops.js';
import galleryRouter        from './api/routes/gallery.js';
import awardsRouter         from './api/routes/awards.js';
import authRouter           from './api/routes/auth.js';
import announcementsRouter  from './api/routes/announcements.js';
import { errorHandler }     from './api/middleware/error-handler.js';
import { requestLogger }    from './api/middleware/logger.js';
import { apiLimiter, authLimiter } from './api/middleware/rate-limit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // Relax for dev; tighten for prod
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(compression());
app.use(express.json());
app.use(requestLogger);

// ── Static frontend (after build) ────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// ── API Routes ───────────────────────────────────────────────
app.use('/api/sections',       sectionsRouter);
app.use('/api/events',         eventsRouter);
app.use('/api/members',        membersRouter);
app.use('/api/gear',           gearRouter);
app.use('/api/workshops',      workshopsRouter);
app.use('/api/gallery',        galleryRouter);
app.use('/api/awards',         awardsRouter);
app.use('/api/auth',           authRouter);
app.use('/api/announcements',  announcementsRouter);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── SPA fallback ─────────────────────────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ── Error handler ────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => console.log(`🎞  Rangeen Pixels server → http://localhost:${PORT}`));
