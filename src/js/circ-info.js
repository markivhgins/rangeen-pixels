/**
 * circ-info.js
 * Manages the pip-boy circular info display and radial nav icons.
 */

const NAV_ICONS = {
  gallery:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  events:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  members:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  about:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  faculty:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  achievements: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  contact:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
};

export function initCircInfo(navData, onOpenPanel) {
  const navRadialEl = document.getElementById('navRadial');
  let currentKey = null;

  // Build tick marks
  const svg = document.getElementById('ciTicksSvg');
  const n = 60, cx = 50, cy = 50, r = 47;
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const long = i % 5 === 0;
    const len = long ? 3.5 : 1.8;
    const op = long ? 0.35 : 0.15;
    const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a);
    const x2 = cx + (r - len) * Math.cos(a), y2 = cy + (r - len) * Math.sin(a);
    s += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="rgba(57,255,143,${op})" stroke-width="${long ? 0.8 : 0.5}"/>`;
  }
  svg.innerHTML = s;

  // Inject icons into nav items
  navRadialEl.querySelectorAll('.nav-item:not(.center)').forEach(el => {
    const key = el.dataset.key;
    const icoEl = el.querySelector('.ico');
    if (icoEl && NAV_ICONS[key]) icoEl.innerHTML = NAV_ICONS[key];
  });

  function showInfo(key) {
    const d = navData[key]; if (!d) return;
    currentKey = key;

    navRadialEl.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('selected', el.dataset.key === key));

    document.getElementById('ciEyebrow').textContent = d.eyebrow;
    document.getElementById('ciIcon').innerHTML = NAV_ICONS[key] || '';

    const nameEl = document.getElementById('ciName');
    nameEl.textContent = d.name;
    nameEl.classList.remove('flicker');
    void nameEl.offsetWidth;
    nameEl.classList.add('flicker');

    document.getElementById('ciDesc').textContent = d.desc;
    document.getElementById('ciStats').innerHTML = d.stats.map((stat, i) =>
      (i > 0 ? '<div class="ci-stat-divider"></div>' : '') +
      `<div class="ci-stat"><div class="v">${stat.v}</div><div class="k">${stat.k}</div></div>`
    ).join('');

    const arc = 301.6;
    const fill = document.getElementById('ciArcFill');
    fill.style.strokeDashoffset = arc;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.strokeDashoffset = (arc * (1 - d.prog / 100)).toFixed(2);
    }));

    document.getElementById('ciIdle').classList.add('gone');
    document.getElementById('ciCard').classList.remove('gone');
  }

  function clearInfo() {
    currentKey = null;
    document.getElementById('ciIdle').classList.remove('gone');
    document.getElementById('ciCard').classList.add('gone');
    document.getElementById('ciArcFill').style.strokeDashoffset = '301.6';
    navRadialEl.querySelectorAll('.nav-item').forEach(el => el.classList.remove('selected'));
  }

  document.getElementById('ciOpenBtn').addEventListener('click', () => {
    if (currentKey) onOpenPanel(currentKey);
  });

  return { showInfo, clearInfo, getCurrentKey: () => currentKey };
}
