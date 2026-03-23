/**
 * server.js  — Rangeen Pixels Club Backend
 */

import 'dotenv/config';
import express     from 'express';
import cors        from 'cors';
import helmet      from 'helmet';
import compression from 'compression';
import path        from 'path';
import { fileURLToPath } from 'url';

import sectionsRouter       from './backend/routes/sections.js';
import eventsRouter         from './backend/routes/events.js';
import membersRouter        from './backend/routes/members.js';
import gearRouter           from './backend/routes/gear.js';
import workshopsRouter      from './backend/routes/workshops.js';
import galleryRouter        from './backend/routes/gallery.js';
import awardsRouter         from './backend/routes/awards.js';
import authRouter           from './backend/routes/auth.js';
import announcementsRouter  from './backend/routes/announcements.js';
import contactRouter        from './backend/routes/contact.js';
import { errorHandler }     from './backend/middleware/error-handler.js';
import { requestLogger }    from './backend/middleware/logger.js';
import { apiLimiter, authLimiter, joinLimiter } from './backend/middleware/rate-limit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(compression());
app.use(express.json());
app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/contact', joinLimiter);

app.use('/api/sections',       sectionsRouter);
app.use('/api/events',         eventsRouter);
app.use('/api/members',        membersRouter);
app.use('/api/gear',           gearRouter);
app.use('/api/workshops',      workshopsRouter);
app.use('/api/gallery',        galleryRouter);
app.use('/api/awards',         awardsRouter);
app.use('/api/auth',           authRouter);
app.use('/api/announcements',  announcementsRouter);
app.use('/api/contact',        contactRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use(errorHandler);

app.listen(PORT, () => console.log(`Rangeen Pixels server running on port ${PORT}`));