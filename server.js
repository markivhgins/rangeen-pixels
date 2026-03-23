/**
 * server.js — Rangeen Pixels Club Backend (API-only)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Routes
import sectionsRouter from './backend/routes/sections.js';
import eventsRouter from './backend/routes/events.js';
import membersRouter from './backend/routes/members.js';
import gearRouter from './backend/routes/gear.js';
import workshopsRouter from './backend/routes/workshops.js';
import galleryRouter from './backend/routes/gallery.js';
import awardsRouter from './backend/routes/awards.js';
import authRouter from './backend/routes/auth.js';
import announcementsRouter from './backend/routes/announcements.js';
import contactRouter from './backend/routes/contact.js';

// Middleware
import { errorHandler } from './backend/middleware/error-handler.js';
import { requestLogger } from './backend/middleware/logger.js';
import {
  apiLimiter,
  authLimiter,
  joinLimiter
} from './backend/middleware/rate-limit.js';

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- Security & Core Middleware ---------------- */
app.use(helmet({ contentSecurityPolicy: false }));

// CORS (supports both local + production)
const allowedOrigins = [
  'http://localhost:5173',
  'https://rangeen-pixels.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(compression());
app.use(express.json());
app.use(requestLogger);

/* ---------------- Rate Limiting ---------------- */
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/contact', joinLimiter);

/* ---------------- API Routes ---------------- */
app.use('/api/sections', sectionsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/members', membersRouter);
app.use('/api/gear', gearRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/awards', awardsRouter);
app.use('/api/auth', authRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/contact', contactRouter);

/* ---------------- Health Check ---------------- */
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

/* ---------------- Root Route ---------------- */
app.get('/', (_, res) => {
  res.json({ message: 'Rangeen Pixels API running' });
});

/* ---------------- 404 Handler ---------------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ---------------- Error Handler ---------------- */
app.use(errorHandler);

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Rangeen Pixels API running on port ${PORT}`);
});