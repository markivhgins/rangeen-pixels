/**
 * config/seed.js
 * ─────────────────────────────────────────────────────────────
 * Populates a fresh database with realistic sample data.
 * Run: npm run db:seed   (or: node config/seed.js)
 *
 * Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING.
 * ─────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

async function seed() {
  console.log('🌱  Seeding database...\n');

  // ── Members ───────────────────────────────────────────────
  console.log('→  members');
  const adminHash = await bcrypt.hash('admin1234', 12);
  const memberHash = await bcrypt.hash('member1234', 12);

  const members = await Promise.all([
    db.queryOne(`
      INSERT INTO members (name, email, password_hash, role, committee_role, avatar_emoji, experience, bio)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ['Maya Chen', 'maya@rangeenpixels.club', adminHash, 'admin', 'President', '📷', 'advanced',
       'Started shooting on a borrowed Nikon FM2 in 2018. Never looked back.']
    ),
    db.queryOne(`
      INSERT INTO members (name, email, password_hash, role, committee_role, avatar_emoji, experience, bio)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ['Arjun Patel', 'arjun@rangeenpixels.club', memberHash, 'committee', 'Vice President', '🎞', 'intermediate',
       'Documentary and street. Prefers HP5 pushed to 3200.']
    ),
    db.queryOne(`
      INSERT INTO members (name, email, password_hash, role, committee_role, avatar_emoji, experience)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ['Sofia Torres', 'sofia@rangeenpixels.club', memberHash, 'committee', 'Events Lead', '🌟', 'advanced']
    ),
    db.queryOne(`
      INSERT INTO members (name, email, password_hash, role, committee_role, avatar_emoji, experience)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ["James O'Brien", 'james@rangeenpixels.club', memberHash, 'committee', 'Darkroom Manager', '🔲', 'advanced']
    ),
    db.queryOne(`
      INSERT INTO members (name, email, password_hash, role, committee_role, avatar_emoji, experience)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ['Priya Singh', 'priya@rangeenpixels.club', memberHash, 'committee', 'Gallery Curator', '🎨', 'intermediate']
    ),
    db.queryOne(`
      INSERT INTO members (name, email, password_hash, role, committee_role, avatar_emoji, experience)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ['Lucas Kim', 'lucas@rangeenpixels.club', memberHash, 'committee', 'Gear & Equipment', '⚙', 'hobbyist']
    ),
  ]);

  // Filter out null results (already existed)
  const [maya, arjun] = members;
  const mayaId  = maya?.id;
  const arjunId = arjun?.id;

  // ── Events ────────────────────────────────────────────────
  console.log('→  events');
  const now = new Date();
  const day = (d) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);

  await db.query(`
    INSERT INTO events (title, location, description, starts_at, ends_at, event_type, max_spots, created_by)
    VALUES
      ('Golden Hour Photowalk',          'Campus Botanic Garden',        'Bring your camera and meet at the main gate at 5:30 PM. All levels welcome.',           $1, $2, 'photowalk', 30, $13),
      ('Film Development Workshop',      'Darkroom, Arts Block B',       'Learn to develop your own 35mm film from scratch. Chemicals provided.',                  $3, $4, 'workshop',  12, $13),
      ('Street Photography Challenge',   'City Centre',                  'All-day challenge. Submit your best 3 shots by midnight. Prizes for top entries.',        $5, $6, 'photowalk', NULL, $13),
      ('Annual Spring Exhibition',       'Gallery Hall, Main Campus',    'Opening night of our annual exhibition. All members can submit up to 2 prints.',          $7, $8, 'exhibition',NULL, $13),
      ('Portrait Session — Open Studio', 'Studio 3, Arts Complex',       'Book a 30-minute slot with our studio lights. Shooting partners welcome.',               $9, $10,'workshop', 20, $13),
      ('Darkroom Open Night',            'Darkroom, Arts Block B',       'Drop-in session. Print from your negatives with support from the darkroom team.',         $11,$12,'workshop', 8,  $13)
    ON CONFLICT DO NOTHING`,
    [
      day(2),  day(2),
      day(12), new Date(day(12).getTime() + 3*60*60*1000),
      day(25), day(25),
      day(39), new Date(day(39).getTime() + 4*60*60*1000),
      day(46), new Date(day(46).getTime() + 3*60*60*1000),
      day(53), new Date(day(53).getTime() + 2*60*60*1000),
      mayaId,
    ]
  ).catch(() => console.log('  (events skipped — already exist)'));

  // ── Workshops ─────────────────────────────────────────────
  console.log('→  workshops');
  await db.query(`
    INSERT INTO workshops (icon, title, description, is_active, semester)
    VALUES
      ('◉', 'Film Photography 101',         'Loading, developing, and printing in the darkroom. No experience needed.',         true, 'Spring 2026'),
      ('◈', 'Studio Lighting Masterclass',  'Three-point setups, softboxes, colour gels, and OCF basics.',                      true, 'Spring 2026'),
      ('◆', 'Lightroom & Editing',           'Culling, tonal grading, building your personal palette.',                          true, 'Spring 2026'),
      ('◇', 'Street Photography Ethics',    'Navigate consent, find your documentary voice, and stay safe.',                    true, 'Spring 2026'),
      ('✦', 'Composition Deep Dive',         'Rules of thirds, leading lines, negative space — then when to break the rules.',   true, 'Spring 2026')
    ON CONFLICT DO NOTHING`
  ).catch(() => console.log('  (workshops skipped — already exist)'));

  // ── Gear ──────────────────────────────────────────────────
  console.log('→  gear');
  await db.query(`
    INSERT INTO gear (icon, name, description, category, condition, is_available)
    VALUES
      ('📷', 'Canon EOS R6 Mark II',     'Full-frame mirrorless. 40fps. Great in low light.',           'camera',   'excellent', true),
      ('📷', 'Hasselblad 500CM',          'Medium format film. 6×6 negatives. Book well in advance.',   'camera',   'good',      true),
      ('📷', 'Nikon FM2 (unit 1)',         '35mm SLR. Mechanical shutter. Fully manual.',                'camera',   'good',      true),
      ('📷', 'Nikon FM2 (unit 2)',         '35mm SLR. Mechanical shutter. Fully manual.',                'camera',   'good',      true),
      ('📷', 'Nikon FM2 (unit 3)',         '35mm SLR. Mechanical shutter. Fully manual.',                'camera',   'fair',      true),
      ('💡', 'Profoto B10 Kit (2-head)',   '2× B10 monolights, umbrellas, triggers, carry bag.',         'lighting', 'excellent', true),
      ('💡', 'Godox AD200 Kit',            'Portable strobe. Great for outdoor portraits.',              'lighting', 'good',      true),
      ('🎞', 'Durst M605 Enlarger #1',    '35mm + medium format. In darkroom bay 1.',                   'darkroom', 'good',      true),
      ('🎞', 'Durst M605 Enlarger #2',    '35mm + medium format. In darkroom bay 2.',                   'darkroom', 'good',      true),
      ('🎞', 'Durst M605 Enlarger #3',    '35mm + medium format. In darkroom bay 3.',                   'darkroom', 'fair',      true),
      ('🎞', 'Durst M605 Enlarger #4',    '35mm + medium format. In darkroom bay 4.',                   'darkroom', 'good',      true),
      ('🔭', 'Canon 70-200mm f/2.8L IS',  'L-series telephoto zoom. IS II. EF mount.',                  'lens',     'excellent', true),
      ('🔭', 'Canon 50mm f/1.4',           'Classic nifty fifty. EF mount.',                             'lens',     'good',      true),
      ('🔭', 'Sigma 35mm f/1.4 Art',       'Exceptional sharpness. EF mount.',                          'lens',     'excellent', true)
    ON CONFLICT DO NOTHING`
  ).catch(() => console.log('  (gear skipped — already exist)'));

  // ── Awards ────────────────────────────────────────────────
  console.log('→  awards');
  await db.query(`
    INSERT INTO awards (title, description, year, winner_name, level, awarded_at)
    VALUES
      ('NPSA Photo of the Year',               '"Morning Market, Hanoi"',                  2025, 'Maya Chen',      'national',      '2025-03-10'),
      ('National Student Photography Award',   'Documentary Category',                     2024, 'Arjun Patel',    'national',      '2024-11-18'),
      ('Best University Photography Club',     'Intercollegiate Arts Council',             2024, 'Rangeen Pixels', 'national',      '2024-06-05'),
      ('Regional Press Photography Prize',     '"The March"',                              2024, 'Sofia Torres',   'local',         '2024-04-22'),
      ('Graduate Showcase — Dublin Gallery',   'Five members selected, Spring 2024',       2024, 'Club Members',   'international', '2024-05-01'),
      ('Darkroom Print Excellence Award',      'Alternative Process category',             2023, 'James O''Brien', 'local',         '2023-11-30')
    ON CONFLICT DO NOTHING`
  ).catch(() => console.log('  (awards skipped — already exist)'));

  // ── Announcements ────────────────────────────────────────
  console.log('→  announcements');
  await db.query(`
    INSERT INTO announcements (label, sort_order)
    VALUES
      ('Rangeen Pixels Photography Club — Est. 2019', 1),
      ('Monthly Photowalks — Every First Saturday',   2),
      ('Annual Exhibition — Spring 2026',             3),
      ('Workshop: Studio Lighting — Register Now',    4),
      ('47 Active Members This Semester',             5)
    ON CONFLICT DO NOTHING`
  ).catch(() => console.log('  (announcements skipped — already exist)'));

  console.log('\n✅  Seed complete.\n');
  console.log('  Admin login:  maya@rangeenpixels.club  /  admin1234');
  console.log('  Member login: arjun@rangeenpixels.club /  member1234');
  console.log('  ⚠️  Change these passwords before going live!\n');

  await db.pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
