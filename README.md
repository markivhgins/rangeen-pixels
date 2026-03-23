# Rangeen Pixels — Photography Club Website

> Modular frontend + full backend plan for a working club website.

---

## Project Structure

```
rangeen-pixels/
│
├── index.html                   ← Modular HTML (no inline JS)
├── server.js                    ← Express backend entry point
├── package.json
├── .env.example                 ← Copy to .env, fill in values
│
├── src/
│   ├── css/
│   │   └── main.css             ← All styles (extracted from original)
│   └── js/
│       ├── main.js              ← App entry point — orchestrates all modules
│       ├── api.js               ← All fetch calls + graceful fallback to static data
│       ├── film-strip.js        ← Horizontal film strip UI
│       ├── ticker.js            ← Bottom scrolling ticker
│       ├── circ-info.js         ← Pip-boy circular display + radial nav icons
│       ├── lens.js              ← Lens expand/collapse portal animation
│       ├── panel-overlay.js     ← Panel slide-over (open/close + join form wiring)
│       └── panels.js            ← Panel HTML builders (gallery, events, etc.)
│
├── src/data/
│   └── club-data.js             ← Static fallback data (mirrors DB schema)
│
├── config/
│   ├── db.js                    ← PostgreSQL connection pool
│   └── schema.sql               ← Full DB schema (run once to set up)
│
└── api/
    ├── routes/
    │   ├── auth.js              ← POST /login /refresh /logout (JWT)
    │   ├── sections.js          ← GET /sections (nav data with live counts)
    │   ├── members.js           ← CRUD members + POST /apply (join form)
    │   ├── events.js            ← CRUD events + POST /:id/rsvp
    │   ├── workshops.js         ← CRUD workshops
    │   ├── gear.js              ← Gear list + POST /book + POST /:id/return
    │   ├── gallery.js           ← Photo list + categories
    │   └── awards.js            ← CRUD awards
    ├── middleware/
    │   ├── auth.js              ← requireAuth / requireAdmin middleware
    │   ├── error-handler.js
    │   └── logger.js
    └── services/
        └── email.js             ← Nodemailer (join confirmation, event reminders)
```

---

## How the Frontend ↔ Backend Connection Works

### The Key File: `src/js/api.js`

Every piece of data the frontend needs goes through `api.js`. Each function:
1. Tries to fetch from the real API (`/api/...`)
2. If the server isn't running yet, **silently falls back** to the static data in `club-data.js`

This means the site works immediately out of the box, and connecting the backend is a single swap — you just deploy the server and the frontend automatically switches to live data.

```
index.html
  └── main.js
        ├── api.js ──→ GET /api/sections        (live counts from DB)
        │         ──→ GET /api/events?upcoming=true
        │         ──→ GET /api/members?role=committee
        │         ──→ ... (all other endpoints)
        │         ↓ fallback if server offline
        │         club-data.js (static data)
        │
        ├── film-strip.js   (renders film frames)
        ├── ticker.js       (renders ticker)
        ├── circ-info.js    (circular display + icons)
        ├── lens.js         (expand/collapse animation)
        ├── panel-overlay.js (slide panels)
        └── panels.js       (builds panel HTML from data)
```

---

## Backend Setup (Step-by-Step)

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```bash
# Create DB (run once)
createdb rangeen_pixels

# Run schema
npm run db:init
# or: psql rangeen_pixels -f config/schema.sql
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET at minimum
```

### 4. Run the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The Express server serves both the API (`/api/*`) and the static frontend from `/public`. In development, use Vite's dev server (`npm run build` then `npm start`, or configure a proxy).

---

## Database Schema Overview

| Table            | Purpose                                      |
|------------------|----------------------------------------------|
| `members`        | All club members + roles + dues status        |
| `applications`   | Pending join form submissions                 |
| `events`         | Photowalks, workshops, exhibitions            |
| `rsvps`          | Member event RSVPs                            |
| `workshops`      | Recurring workshop catalogue                  |
| `photos`         | Gallery photos (metadata; files go to S3/CDN) |
| `gear`           | Equipment library items                       |
| `gear_loans`     | Active/historical gear borrowing              |
| `awards`         | Club awards and honours                       |
| `announcements`  | Ticker items (managed via DB, not hardcoded)  |
| `refresh_tokens` | JWT refresh token store                       |

---

## API Endpoints

### Public (no auth needed)
| Method | Path                        | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/sections`             | Nav data with live member/event counts |
| GET    | `/api/sections/summary`     | Film strip frame summaries         |
| GET    | `/api/events?upcoming=true` | Upcoming events list               |
| GET    | `/api/members?role=committee` | Committee members               |
| GET    | `/api/workshops?active=true` | Active workshops                  |
| GET    | `/api/gear`                 | Gear library with availability     |
| GET    | `/api/gallery/categories`   | Gallery category list              |
| GET    | `/api/awards`               | Awards list                        |
| GET    | `/api/announcements`        | Ticker items                       |
| POST   | `/api/members/apply`        | Submit join application            |
| POST   | `/api/auth/login`           | Admin login → JWT tokens           |
| POST   | `/api/auth/refresh`         | Refresh access token               |

### Authenticated (JWT Bearer required)
| Method | Path                   | Description                     |
|--------|------------------------|---------------------------------|
| POST   | `/api/events/:id/rsvp` | RSVP to an event                |
| POST   | `/api/gear/book`       | Book a piece of gear            |
| POST   | `/api/gear/:id/return` | Mark gear as returned           |
| POST   | `/api/gallery`         | Upload photo metadata           |

### Admin only (committee/admin role)
| Method | Path                | Description             |
|--------|---------------------|-------------------------|
| POST   | `/api/events`       | Create event            |
| PATCH  | `/api/events/:id`   | Update event            |
| DELETE | `/api/events/:id`   | Delete event            |
| POST   | `/api/members`      | Create member           |
| PATCH  | `/api/members/:id`  | Update member           |
| POST   | `/api/workshops`    | Create workshop         |
| POST   | `/api/gear`         | Add gear item           |
| PATCH  | `/api/gear/:id`     | Update gear             |
| POST   | `/api/awards`       | Add award               |
| DELETE | `/api/awards/:id`   | Delete award            |

---

## Deployment Options

### Recommended Stack (all free tiers available)

| Layer        | Service                          | Notes                              |
|--------------|----------------------------------|------------------------------------|
| **Backend**  | [Render](https://render.com)     | Free Node.js web service           |
| **Database** | [Supabase](https://supabase.com) | Free PostgreSQL, 500MB             |
| **Frontend** | [Vercel](https://vercel.com)     | Free static hosting + CDN          |
| **Photos**   | [Cloudflare R2](https://cloudflare.com/r2) | Free 10GB object storage |
| **Email**    | [Resend](https://resend.com) or Gmail SMTP | Free tier available    |

### Quick deploy to Render + Supabase

```bash
# 1. Push to GitHub

# 2. Create Supabase project → get DATABASE_URL from Settings > Database
#    Run schema.sql in Supabase SQL editor

# 3. Create Render web service → connect GitHub repo
#    Add env vars: DATABASE_URL, JWT_SECRET, NODE_ENV=production

# 4. Update ALLOWED_ORIGIN in .env to your Vercel URL
```

---

## Photo Upload Flow (Gallery)

Since photos are binary files, they don't go through the Express API directly:

```
1. Frontend requests a presigned URL: POST /api/gallery/presign
2. Backend generates presigned S3 URL (valid 5 min)
3. Frontend uploads directly to S3/R2 from the browser
4. Frontend saves metadata: POST /api/gallery { url, filename, category }
```

This keeps the backend lightweight and avoids file size limits. Add `aws-sdk` or `@aws-sdk/client-s3` to implement the presign endpoint.

---

## Adding an Admin Dashboard

The backend is fully ready for an admin UI. You can build it as:
- A separate `/admin` route served by the same Express server
- A standalone React app (Vite) that talks to the same API
- A tool like [AdminJS](https://adminjs.co) auto-generates CRUD UI from your schema

Key admin actions to build first:
1. Approve / reject join applications
2. Create / edit events
3. Mark gear as returned / update condition
4. Feature photos in gallery
5. Manage ticker announcements

---

## Environment Variables Reference

| Variable           | Required | Description                              |
|--------------------|----------|------------------------------------------|
| `DATABASE_URL`     | ✓        | PostgreSQL connection string             |
| `JWT_SECRET`       | ✓        | Long random string for signing JWTs      |
| `PORT`             |          | Server port (default 3000)               |
| `NODE_ENV`         |          | `production` enables SSL for DB          |
| `ALLOWED_ORIGIN`   |          | CORS origin for your frontend URL        |
| `SMTP_HOST/USER/PASS` |       | SMTP credentials for confirmation emails |
| `STORAGE_BUCKET`   |          | S3/R2 bucket for photo uploads           |
| `AWS_ACCESS_KEY_ID` |         | S3/R2 access key                         |
