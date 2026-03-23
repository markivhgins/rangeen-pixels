/**
 * film-strip.js
 * ─────────────────────────────────────────────────────────────
 * Renders the horizontal film strip and manages its popup.
 * ─────────────────────────────────────────────────────────────
 */

export function initFilmStrip(frames) {
  const track  = document.getElementById('filmTrack');
  const popup  = document.getElementById('film-popup');
  const fpClose = document.getElementById('fpClose');
  const n = frames.length;
  let activeFrame = null;

  // Build 3 sets for seamless CSS loop
  let html = '';
  for (let rep = 0; rep < 3; rep++) {
    for (let i = 0; i < n; i++) {
      const f = frames[i];
      html += `<div class="vfr" data-idx="${i}" role="button" tabindex="0" aria-label="Open ${f.title}">
        <div class="vfr-img"></div>
        <div class="vfr-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="vfr-label">${f.tag}</div>
      </div>`;
    }
  }
  track.innerHTML = html;
  track.style.animation = 'filmLeft 45s linear infinite';

  // ── Popup helpers ─────────────────────────────────────────
  function showPopup(frameEl, idx) {
    const f = frames[idx % n];
    document.getElementById('fpTag').textContent    = f.tag;
    document.getElementById('fpTitle').textContent  = f.title;
    document.getElementById('fpBody').textContent   = f.body;
    document.getElementById('fpFooter').textContent = f.footer;

    const rect = frameEl.getBoundingClientRect();
    const pw = 360, ph = 180;
    let left = rect.left + rect.width / 2 - pw / 2;
    let top  = rect.top - ph - 14;
    if (top  < 10) top  = rect.bottom + 14;
    if (left < 10) left = 10;
    if (left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;

    popup.style.left  = left + 'px';
    popup.style.top   = top  + 'px';
    popup.style.width = pw   + 'px';
    popup.classList.add('show');
    activeFrame = frameEl;
    track.style.animationPlayState = 'paused';
  }

  function hidePopup() {
    popup.classList.remove('show');
    track.style.animationPlayState = 'running';
    activeFrame = null;
  }

  // ── Events ───────────────────────────────────────────────
  fpClose.addEventListener('click', e => { e.stopPropagation(); hidePopup(); });
  popup.addEventListener('click', e => e.stopPropagation());

  document.addEventListener('click', e => {
    const fr = e.target.closest('.vfr');
    if (fr) {
      const idx = parseInt(fr.dataset.idx, 10);
      activeFrame === fr && popup.classList.contains('show') ? hidePopup() : showPopup(fr, idx);
    } else if (!popup.contains(e.target)) {
      hidePopup();
    }
  });

  track.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const fr = e.target.closest('.vfr');
      if (fr) { e.preventDefault(); fr.click(); }
    }
  });
}
