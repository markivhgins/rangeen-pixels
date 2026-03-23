-- ═══════════════════════════════════════════════════════════
-- Rangeen Pixels — Full Schema
-- Safe to run on an existing DB (uses IF NOT EXISTS).
-- Only the DROP block at the top is destructive — comment it
-- out if you want to preserve existing data.
-- ═══════════════════════════════════════════════════════════

-- ── Drop all tables (comment out to preserve data) ───────────
DROP TABLE IF EXISTS contact_messages  CASCADE;
DROP TABLE IF EXISTS refresh_tokens    CASCADE;
DROP TABLE IF EXISTS gear_loans        CASCADE;
DROP TABLE IF EXISTS rsvps             CASCADE;
DROP TABLE IF EXISTS photos            CASCADE;
DROP TABLE IF EXISTS awards            CASCADE;
DROP TABLE IF EXISTS announcements     CASCADE;
DROP TABLE IF EXISTS workshops         CASCADE;
DROP TABLE IF EXISTS gear              CASCADE;
DROP TABLE IF EXISTS events            CASCADE;
DROP TABLE IF EXISTS applications      CASCADE;
DROP TABLE IF EXISTS members           CASCADE;

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Members ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT,
  student_id      TEXT UNIQUE,
  role            TEXT NOT NULL DEFAULT 'member',
  committee_role  TEXT,
  avatar_emoji    TEXT DEFAULT '📷',
  experience      TEXT,
  bio             TEXT,
  is_active       BOOLEAN DEFAULT true,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  dues_paid_until DATE
);

-- ── Member applications ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  level        TEXT,
  bio          TEXT,
  status       TEXT DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES members(id)
);

-- ── Events ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  location     TEXT,
  description  TEXT,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ,
  event_type   TEXT DEFAULT 'photowalk',
  is_public    BOOLEAN DEFAULT true,
  max_spots    INT,
  created_by   UUID REFERENCES members(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Event RSVPs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status     TEXT DEFAULT 'going',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- ── Workshops ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workshops (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon         TEXT DEFAULT '◉',
  title        TEXT NOT NULL,
  description  TEXT,
  instructor   UUID REFERENCES members(id),
  is_active    BOOLEAN DEFAULT true,
  semester     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gallery photos ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES members(id),
  title        TEXT,
  description  TEXT,
  filename     TEXT NOT NULL,
  url          TEXT NOT NULL,
  category     TEXT,
  is_featured  BOOLEAN DEFAULT false,
  shot_at      TIMESTAMPTZ,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gear ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gear (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon         TEXT DEFAULT '📷',
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  condition    TEXT DEFAULT 'good',
  is_available BOOLEAN DEFAULT true,
  added_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gear loans ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gear_loans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gear_id      UUID NOT NULL REFERENCES gear(id),
  member_id    UUID NOT NULL REFERENCES members(id),
  borrowed_at  TIMESTAMPTZ DEFAULT NOW(),
  due_at       TIMESTAMPTZ NOT NULL,
  returned_at  TIMESTAMPTZ,
  notes        TEXT
);

-- ── Awards ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS awards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  year         INT,
  winner_id    UUID REFERENCES members(id),
  winner_name  TEXT,
  level        TEXT DEFAULT 'national',
  awarded_at   DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Announcements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ── Contact messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auth refresh tokens ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_starts_at     ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_photos_category      ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_featured      ON photos(is_featured);
CREATE INDEX IF NOT EXISTS idx_gear_available       ON gear(is_available);
CREATE INDEX IF NOT EXISTS idx_loans_gear           ON gear_loans(gear_id)   WHERE returned_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_loans_member         ON gear_loans(member_id) WHERE returned_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_unread       ON contact_messages(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_applications_status  ON applications(status, created_at);

-- ── Seed: announcements ───────────────────────────────────────
INSERT INTO announcements (label, sort_order) VALUES
  ('Rangeen Pixels Photography Club — Est. 2019', 1),
  ('Monthly Photowalks — Every First Saturday',   2),
  ('Annual Exhibition — Spring 2026',              3),
  ('Workshop: Studio Lighting — Register Now',     4),
  ('47 Active Members This Semester',              5)
ON CONFLICT DO NOTHING;

-- ── Seed: sample events ───────────────────────────────────────
INSERT INTO events (title, location, description, starts_at, event_type, max_spots) VALUES
  ('April Photowalk — Old City', 'Old City Gate, 7:00 AM',
   'Golden hour walk through the old city lanes. Bring your camera and a charged battery.',
   NOW() + INTERVAL '10 days', 'photowalk', 20),
  ('Studio Lighting Workshop',   'Club Studio, Room 204',
   'Learn 3-point lighting with Profoto B10 strobes. Hands-on session for all levels.',
   NOW() + INTERVAL '18 days', 'workshop', 12),
  ('Spring Exhibition 2026',     'Main Hall Gallery',
   'Annual showcase of the best member work from the past year. Open to the public.',
   NOW() + INTERVAL '30 days', 'exhibition', NULL)
ON CONFLICT DO NOTHING;