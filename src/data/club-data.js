/**
 * club-data.js — Static fallback data. Mirrors DB content.
 */

export const TICKER_ITEMS = [
  { label: 'Rangeen Pixels Photography Club — Est. 2019' },
  { label: 'Event: Through The Lens — Register Now' },
  { label: 'New Gallery Submissions Open' },
  { label: 'Meet the Team — Check Members Section' },
  { label: 'Questions? Reach Us via Contact' },
];

export const FILM_FRAMES = [
  { key: 'gallery',      tag: 'Gallery',      title: 'Photo Gallery',      body: 'A curated collection of member work — golden hour, portraits, street documentary.',                footer: '247 prints · 35mm & digital' },
  { key: 'events',       tag: 'Events',        title: 'Through The Lens',   body: 'Our flagship event. Sign up to participate, showcase your work, and connect with fellow photographers.', footer: '1 event · Open registration' },
  { key: 'members',      tag: 'Members',       title: 'Our Community',      body: 'Coordinators, leads, and members working together behind the lens.',                                footer: 'Coordinators · Leads · Members' },
  { key: 'about',        tag: 'About Us',      title: 'Rangeen Pixels',     body: 'A college photography club built on a shared love for seeing the world through glass.',            footer: 'Est. 2019 · AMU' },
  { key: 'faculty',      tag: 'Faculty',       title: 'Faculty Advisors',   body: 'Our faculty mentors guide the club and bring academic depth to our craft.',                        footer: 'Dept. of Fine Arts' },
  { key: 'achievements', tag: 'Achievements',  title: 'Our Milestones',     body: 'Competitions won, exhibitions held, and recognition earned by Rangeen Pixels members.',            footer: 'Growing every semester' },
  { key: 'contact',      tag: 'Contact',       title: 'Get In Touch',       body: 'Have a question or collaboration in mind? Reach out to the team directly.',                       footer: 'We respond within 48hrs' },
];

export const NAV_DATA = {
  gallery:      { eyebrow: 'Visual Archive', name: 'GALLERY',      desc: 'Member photography — portraits, street, golden hour and more.',                           stats: [{ v: '247', k: 'Photos' },    { v: '35mm',   k: 'Format' },    { v: 'f/2.8',  k: 'Avg aperture' }], prog: 87 },
  events:       { eyebrow: 'Upcoming',       name: 'EVENTS',       desc: 'Sign up for Through The Lens — our flagship photography event this semester.',            stats: [{ v: '1',    k: 'Event' },     { v: 'Open',   k: 'Signup' },    { v: 'Soon',   k: 'Deadline' }],      prog: 60 },
  members:      { eyebrow: 'The Team',       name: 'MEMBERS',      desc: 'Coordinators, leads and members — the people who make Rangeen Pixels happen.',            stats: [{ v: '2',    k: 'Coords' },    { v: '4',      k: 'Leads' },     { v: '40+',    k: 'Members' }],       prog: 78 },
  about:        { eyebrow: 'Club Profile',   name: 'ABOUT',        desc: 'Founded 2019. A college club united by a love for photography and visual storytelling.',  stats: [{ v: '2019', k: 'Founded' },  { v: 'AMU',    k: 'Campus' },    { v: 'inf',    k: 'Passion' }],       prog: 94 },
  faculty:      { eyebrow: 'Mentors',        name: 'FACULTY',      desc: 'Our faculty advisors bring guidance, expertise and institutional support to the club.',   stats: [{ v: 'Fine', k: 'Arts Dept' },{ v: 'Advise', k: 'Role' },     { v: '2+',     k: 'Mentors' }],       prog: 70 },
  achievements: { eyebrow: 'Milestones',     name: 'ACHIEVEMENTS', desc: 'Competitions, exhibitions and recognition earned by our members over the years.',         stats: [{ v: '6+',   k: 'Awards' },   { v: '3',      k: 'Exhibitions'},{ v: 'Natl.',   k: 'Level' }],        prog: 82 },
  contact:      { eyebrow: 'Reach Us',       name: 'CONTACT',      desc: 'Questions, collaborations, or just want to say hi — get in touch with the team.',        stats: [{ v: '48hr', k: 'Response' }, { v: 'Open',   k: 'Inbox' },    { v: 'DM',     k: 'Instagram' }],    prog: 100 },
};

export const MEMBERS = {
  coordinators: [
    { avatar: '📷', name: 'Arjun Patel',  role: 'Co-ordinator' },
    { avatar: '🎞', name: 'Maya Chen',    role: 'Co-ordinator' },
  ],
  leads: [
    { avatar: '🌟', name: 'Sofia Torres', role: 'Events Lead' },
    { avatar: '🎨', name: 'Priya Singh',  role: 'Gallery Lead' },
    { avatar: '📸', name: 'Rohan Mehta',  role: 'Technical Lead' },
    { avatar: '✏️', name: 'Aisha Kapoor', role: 'Content Lead' },
  ],
  members: [
    { avatar: '👁', name: 'Lucas Kim',     role: 'Member' },
    { avatar: '🌿', name: 'Zara Ahmed',    role: 'Member' },
    { avatar: '🔲', name: "James O'Brien", role: 'Member' },
    { avatar: '🌊', name: 'Dev Sharma',    role: 'Member' },
  ],
};

export const FACULTY = [
  { avatar: '🎓', name: 'Prof. R. Verma', role: 'Faculty Advisor', dept: 'Dept. of Fine Arts' },
  { avatar: '🎓', name: 'Dr. S. Naqvi',   role: 'Co-Advisor',      dept: 'Dept. of Mass Communication' },
];

export const EVENTS = [
  {
    day: '15', month: 'APR',
    title: 'Through The Lens',
    info: 'Main Auditorium · 10:00 AM onwards',
    description: 'Our flagship photography event. Open to all students — submit your best shot, attend the showcase, and connect with fellow photographers.',
    signup: true,
  },
];

export const ACHIEVEMENTS = [
  { title: 'Best Photography Club — Intercollegiate Arts Council 2024', desc: 'Recognised across participating colleges' },
  { title: 'Annual Spring Exhibition 2024',                             desc: 'Over 200 prints displayed, 500+ attendees' },
  { title: 'Through The Lens Vol. 1 — 2023',                           desc: 'Inaugural event, 80+ participants' },
  { title: 'Featured in Campus Newsletter',                             desc: 'Three-page spread on club activities' },
  { title: 'Photography Workshop Series',                               desc: '5 workshops, 150+ students trained' },
];

export const GALLERY_CATEGORIES = [
  ['🌆','Golden Hour'], ['🌿','Botanica'],  ['👤','Portraits'],
  ['🌊','Seascape'],    ['🏙','Urban Life'], ['🎭','Street'],
  ['🌌','Astrophoto'],  ['🍂','Seasons'],    ['🔬','Macro'],
];
