/**
 * api/routes/sections.js
 * GET /api/sections         — nav card data (the DATA object in JS)
 * GET /api/sections/summary — film strip summaries (the FRAMES object)
 */

import { Router } from 'express';
import db from '../../config/db.js';

const router = Router();

// Aggregates live DB counts into the NAV_DATA shape the frontend expects
router.get('/', async (req, res, next) => {
  try {
    const [memberCount, eventCount, nextEvent, gearCount, trophyCount, workshopCount] = await Promise.all([
      db.queryOne('SELECT COUNT(*) AS n FROM members WHERE is_active = true'),
      db.queryOne("SELECT COUNT(*) AS n FROM events WHERE starts_at >= NOW() AND is_public = true"),
      db.queryOne("SELECT to_char(starts_at,'Mon DD') AS label FROM events WHERE starts_at >= NOW() AND is_public = true ORDER BY starts_at LIMIT 1"),
      db.queryOne('SELECT COUNT(*) AS n FROM gear'),
      db.queryOne('SELECT COUNT(*) AS n FROM awards'),
      db.queryOne('SELECT COUNT(*) AS n FROM workshops WHERE is_active = true'),
    ]);

    const mc = Number(memberCount?.n || 47);
    const ec = Number(eventCount?.n  || 12);
    const gc = Number(gearCount?.n   || 31);
    const tc = Number(trophyCount?.n || 6);
    const wc = Number(workshopCount?.n || 5);
    const ne = nextEvent?.label?.toUpperCase().replace(' ', ' ') || 'SOON';

    res.json({
      gallery:   { eyebrow: 'Visual Archive', name: 'GALLERY',   desc: 'Golden hour, darkroom prints & raw street documentary — member work from across the globe.',    stats: [{ v: '247', k: 'Prints' }, { v: '35mm', k: 'Format' }, { v: 'f/2.8', k: 'Avg' }],       prog: 87 },
      events:    { eyebrow: 'Schedule',       name: 'EVENTS',    desc: 'Monthly photowalks, darkroom open nights, portfolio critiques, and Spring Exhibition.',          stats: [{ v: ec, k: 'This term' }, { v: ne, k: 'Next event' }, { v: 'APR 28', k: 'Exhibition' }], prog: 58 },
      about:     { eyebrow: 'Club profile',   name: 'ABOUT',     desc: 'Founded 2019. Full darkroom, studio bay, 30-body lending library — from point-and-shoot to Hasselblad.', stats: [{ v: mc, k: 'Members' }, { v: '2019', k: 'Founded' }, { v: '1', k: 'Darkroom' }], prog: 94 },
      workshops: { eyebrow: 'Training',       name: 'WORKSHOPS', desc: 'Film 101, studio lighting, Lightroom, street ethics, composition — every semester.',             stats: [{ v: wc, k: 'Active' }, { v: '8hr', k: 'Per session' }, { v: 'Free', k: 'Members' }],   prog: 38 },
      members:   { eyebrow: 'Personnel',      name: 'MEMBERS',   desc: 'Photographers across all disciplines. A committee of six leads the club.',                       stats: [{ v: mc, k: 'Active' }, { v: '6', k: 'Committee' }, { v: '3yr', k: 'Avg tenure' }],  prog: 78 },
      gear:      { eyebrow: 'Equipment',      name: 'GEAR',      desc: 'Canon R6, Hasselblad 500CM, Nikon FM2, Profoto B10, Durst enlargers.',                           stats: [{ v: gc, k: 'Bodies' }, { v: '48hr', k: 'Max loan' }, { v: 'Free', k: 'Members' }],   prog: 62 },
      join:      { eyebrow: 'Membership',     name: 'JOIN US',   desc: 'Open to all enrolled students. Annual dues €20 covers darkroom, gear & all events.',             stats: [{ v: '€20', k: 'Per year' }, { v: 'Open', k: 'Status' }, { v: '∞', k: 'Access' }],    prog: 100 },
      awards:    { eyebrow: 'Recognition',    name: 'AWARDS',    desc: 'NPSA Photo of Year, National Student Award, Best University Club 2024.',                         stats: [{ v: tc, k: 'Trophies' }, { v: '2025', k: 'Last win' }, { v: 'Natl.', k: 'Level' }],  prog: 93 },
    });
  } catch (err) { next(err); }
});

// Film strip summary cards
router.get('/summary', async (req, res, next) => {
  try {
    const mc = Number((await db.queryOne('SELECT COUNT(*) AS n FROM members WHERE is_active=true'))?.n || 47);
    const ec = Number((await db.queryOne("SELECT COUNT(*) AS n FROM events WHERE starts_at>=NOW()"))?.n || 12);
    res.json([
      { key:'gallery',   tag:'Gallery',     title:'Photo Gallery',   body:'A curated collection of member work — golden hour, darkroom prints, street documentary.',           footer:'247 prints · 35mm & digital' },
      { key:'events',    tag:'Events',      title:'Upcoming Events', body:`Monthly photowalks, film nights, portfolio critiques. ${ec} events this term.`,                     footer:`${ec} events this term` },
      { key:'about',     tag:'About Us',    title:'Rangeen Pixels',  body:`Founded 2019 in a dorm room. Now running a darkroom, studio bay, and 30+ camera lending library.`,  footer:`Est. 2019 · ${mc} members` },
      { key:'workshops', tag:'Workshops',   title:'Learn With Us',   body:'Film 101, Studio Lighting, Lightroom, Street Ethics, Composition Deep Dive — every semester.',       footer:'5 active workshops' },
      { key:'members',   tag:'Members',     title:'Our Community',   body:`${mc} active photographers across all disciplines. A six-person committee leads the club.`,          footer:`${mc} active · 6 on committee` },
      { key:'gear',      tag:'Gear Library',title:'Borrow a Camera', body:'Canon R6, Hasselblad 500CM, Nikon FM2, Profoto B10 strobes. 48-hour loans, free for members.',      footer:'31 bodies · 48hr max loan' },
      { key:'join',      tag:'Join',        title:'Become a Member', body:'Open to all enrolled students. Annual dues €20 cover darkroom access, all gear loans, and events.',  footer:'€20/year · Open enrollment' },
      { key:'awards',    tag:'Awards',      title:'Honours',         body:'NPSA Photo of the Year, National Student Award, Best University Club 2024.',                        footer:'6 trophies · National level' },
    ]);
  } catch (err) { next(err); }
});

export default router;
