-- ═══════════════════════════════════════════════════════════
-- Rangeen Pixels Photography Club — Database Schema
-- Run once: psql -d rangeen_pixels -f schema.sql
-- ═══════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ── Members ──────────────────────────────────────────────────
CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT,                            -- NULL for members added by admin before self-signup
  student_id      TEXT UNIQUE,
  role            TEXT NOT NULL DEFAULT 'member',  -- 'member' | 'committee' | 'admin'
  committee_role  TEXT,                            -- 'President', 'Events Lead', etc.
  avatar_emoji    TEXT DEFAULT '📷',
  experience      TEXT,                            -- 'beginner' | 'hobbyist' | 'intermediate' | 'advanced'
  bio             TEXT,
  is_active       BOOLEAN DEFAULT true,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  dues_paid_until DATE
);

-- ── Member applications (pending join requests) ──────────────
CREATE TABLE applications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  level      TEXT,
  bio        TEXT,
  status     TEXT DEFAULT 'pending',             -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES members(id)
);

-- ── Events ───────────────────────────────────────────────────
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  location    TEXT,
  description TEXT,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  event_type  TEXT DEFAULT 'photowalk',           -- 'photowalk' | 'workshop' | 'exhibition' | 'critique'
  is_public   BOOLEAN DEFAULT true,
  max_spots   INT,
  created_by  UUID REFERENCES members(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Event RSVPs ──────────────────────────────────────────────
CREATE TABLE rsvps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status     TEXT DEFAULT 'going',               -- 'going' | 'maybe' | 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- ── Workshops ────────────────────────────────────────────────
CREATE TABLE workshops (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon         TEXT DEFAULT '◉',
  title        TEXT NOT NULL,
  description  TEXT,
  instructor   UUID REFERENCES members(id),
  is_active    BOOLEAN DEFAULT true,
  semester     TEXT,                             -- e.g. 'Spring 2026'
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gallery photos ───────────────────────────────────────────
CREATE TABLE photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id),
  title        TEXT,
  description  TEXT,
  filename     TEXT NOT NULL,                    -- stored filename in object storage
  url          TEXT NOT NULL,                    -- CDN / storage URL
  category     TEXT,                             -- 'Golden Hour' | 'Street' | etc.
  is_featured  BOOLEAN DEFAULT false,
  shot_at      TIMESTAMPTZ,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gear (equipment library) ─────────────────────────────────
CREATE TABLE gear (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon         TEXT DEFAULT '📷',
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT,                             -- 'camera' | 'lighting' | 'lens' | 'darkroom'
  condition    TEXT DEFAULT 'good',              -- 'excellent' | 'good' | 'fair' | 'repair'
  is_available BOOLEAN DEFAULT true,
  added_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gear loans ───────────────────────────────────────────────
CREATE TABLE gear_loans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gear_id      UUID NOT NULL REFERENCES gear(id),
  member_id    UUID NOT NULL REFERENCES members(id),
  borrowed_at  TIMESTAMPTZ DEFAULT NOW(),
  due_at       TIMESTAMPTZ NOT NULL,
  returned_at  TIMESTAMPTZ,
  notes        TEXT
);

-- ── Awards ───────────────────────────────────────────────────
CREATE TABLE awards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  year         INT,
  winner_id    UUID REFERENCES members(id),
  winner_name  TEXT,                             -- for non-member winners / historical
  level        TEXT DEFAULT 'national',          -- 'local' | 'national' | 'international'
  awarded_at   DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Announcements (ticker + notifications) ───────────────────
CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ── Auth tokens (for admin login) ────────────────────────────
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_events_starts_at  ON events(starts_at);
CREATE INDEX idx_photos_category   ON photos(category);
CREATE INDEX idx_photos_featured   ON photos(is_featured);
CREATE INDEX idx_gear_available    ON gear(is_available);
CREATE INDEX idx_loans_gear        ON gear_loans(gear_id) WHERE returned_at IS NULL;
CREATE INDEX idx_loans_member      ON gear_loans(member_id) WHERE returned_at IS NULL;
CREATE INDEX idx_announcements_active ON announcements(is_active, sort_order);

-- ── Seed announcements ───────────────────────────────────────
INSERT INTO announcements (label, sort_order) VALUES
  ('Rangeen Pixels Photography Club — Est. 2019', 1),
  ('Monthly Photowalks — Every First Saturday', 2),
  ('Annual Exhibition — Spring 2026', 3),
  ('Workshop: Studio Lighting — Register Now', 4),
  ('47 Active Members This Semester', 5);
