/**
 * lens.js
 * ─────────────────────────────────────────────────────────────
 * Manages the lens expand/collapse portal animation and
 * the nav radial build/layout.
 * ─────────────────────────────────────────────────────────────
 */

let isExpanded = false;
let _origLensRect = null;

export function initLens(onOpenPanel) {
  const lensAsm     = document.getElementById('lensAsm');
  const lensSection = document.getElementById('lensSection');
  const portal      = document.getElementById('lens-portal');
  const vignette    = document.getElementById('lens-vignette');
  const closePill   = document.getElementById('lens-close');
  const camCol      = document.getElementById('camCol');
  const lensFlashEl = document.getElementById('lens-flash');
  const navRadialEl = document.getElementById('navRadial');
  const lensInt     = document.getElementById('lensInt');
  const circInfo    = document.getElementById('circ-info');

  // ── ResizeObserver keeps nav aligned when portal resizes ──
  let _roActive = true;
  const _ro = new ResizeObserver(() => { if (_roActive) buildNav(); });
  _ro.observe(navRadialEl);

  function buildNav() {
    const ring = [...navRadialEl.querySelectorAll('.nav-item:not(.center)')];
    const home = navRadialEl.querySelector('.nav-item.center');
    const rect = navRadialEl.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    if (W < 10) return;
    const cx = W / 2, cy = H / 2;

    if (isExpanded) {
      // r-inner band geometry:
      //   r-inner outer edge: inset 17% → radius = 33% of W
      //   iris inner edge:    inset 25% → radius = 25% of W
      //   Band center: 29% radius, icon size 7% → spans 25.5%–32.5% fits cleanly
      const sz = Math.max(44, Math.min(70, W * 0.07));
      const R  = W * 0.29;

      let orb = navRadialEl.querySelector('.orbit-ring');
      if (!orb) { orb = document.createElement('div'); orb.className = 'orbit-ring'; navRadialEl.prepend(orb); }
      const od = R * 2;
      orb.style.cssText = `width:${od}px;height:${od}px;top:${cy - od/2}px;left:${cx - od/2}px;border-color:rgba(57,255,143,.1);opacity:1;`;

      ring.forEach((el, i) => {
        const a = (i / ring.length) * 2 * Math.PI - Math.PI / 2;
        el.style.left          = (cx + R * Math.cos(a) - sz / 2) + 'px';
        el.style.top           = (cy + R * Math.sin(a) - sz / 2) + 'px';
        el.style.width         = sz + 'px';
        el.style.height        = sz + 'px';
        el.style.opacity       = '';
        el.style.transform     = '';
        el.style.pointerEvents = '';
      });

      // Hide center — pip-boy owns the center
      if (home) {
        home.style.cssText = 'left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;animation:none;';
      }

    } else {
      const sz = Math.max(30, Math.min(50, W * 0.16));
      const orb = navRadialEl.querySelector('.orbit-ring');
      if (orb) orb.style.opacity = '0';
      ring.forEach(el => {
        el.style.left          = '-9999px';
        el.style.top           = '-9999px';
        el.style.opacity       = '0';
        el.style.pointerEvents = 'none';
      });
      if (home) {
        home.style.cssText = `left:${cx - sz/2}px;top:${cy - sz/2}px;width:${sz}px;height:${sz}px;opacity:1;pointer-events:all;`;
      }
    }
  }

  function expandLens() {
    if (isExpanded) return;
    isExpanded = true;

    // Camera flash
    lensFlashEl.classList.remove('blink');
    void lensFlashEl.offsetWidth;
    lensFlashEl.classList.add('blink');

    // Capture current lens bounding rect before any DOM move
    const rect = lensAsm.getBoundingClientRect();
    _origLensRect = rect;

    // Size portal to match lens exactly (instant, no transition yet)
    Object.assign(portal.style, {
      transition: 'none',
      left:   rect.left   + 'px',
      top:    rect.top    + 'px',
      width:  rect.width  + 'px',
      height: rect.height + 'px',
    });

    // Move lens into portal then reflow
    portal.appendChild(lensAsm);
    void portal.offsetWidth;

    // Animate portal to fullscreen
    const VW = window.innerWidth, VH = window.innerHeight;
    const EL = Math.min(VW * 0.96, VH * 0.95);
    const tl = (VW - EL) / 2, tt = (VH - EL) / 2;
    portal.style.transition = 'left .85s cubic-bezier(.16,1,.3,1),top .85s cubic-bezier(.16,1,.3,1),width .85s cubic-bezier(.16,1,.3,1),height .85s cubic-bezier(.16,1,.3,1)';
    portal.style.left   = tl + 'px';
    portal.style.top    = tt + 'px';
    portal.style.width  = EL + 'px';
    portal.style.height = EL + 'px';
    portal.classList.add('is-expanded');

    _roActive = false; // pause observer during animation
    lensAsm.classList.add('lens-expanded');

    vignette.classList.add('show');
    closePill.classList.add('show');
    document.getElementById('shutterBtn').classList.add('active-btn');

    camCol.style.transform = 'translateX(-55px) scale(.97)';
    camCol.style.opacity   = '0';
    setTimeout(() => { camCol.style.visibility = 'hidden'; }, 500);

    setTimeout(() => {
      _roActive = true;
      buildNav();
      requestAnimationFrame(() => {
        buildNav(); // second pass after layout settles
        if (circInfo) circInfo.classList.add('show');
        document.getElementById('hintText').textContent = '— HOVER AN ICON TO EXPLORE · ESC TO CLOSE —';
        // Stagger icon entrance
        const items = [...navRadialEl.querySelectorAll('.nav-item:not(.center)')];
        items.forEach((el, i) => setTimeout(() => el.classList.add('show'), i * 60 + 30));
      });
    }, 920);
  }

  function collapseLens() {
    if (!isExpanded) return;

    // Hide info display
    if (circInfo) circInfo.classList.remove('show');

    // Reset circ-info card to idle state (mirrors clearInfo in circ-info.js)
    const ciIdle    = document.getElementById('ciIdle');
    const ciCard    = document.getElementById('ciCard');
    const ciArcFill = document.getElementById('ciArcFill');
    if (ciIdle)    ciIdle.classList.remove('gone');
    if (ciCard)    ciCard.classList.add('gone');
    if (ciArcFill) ciArcFill.style.strokeDashoffset = '301.6';
    navRadialEl.querySelectorAll('.nav-item').forEach(el => el.classList.remove('selected'));

    document.getElementById('shutterBtn').classList.remove('active-btn');

    // Get original slot position
    let rect = _origLensRect;
    if (!rect) {
      const ph = document.createElement('div');
      ph.style.cssText = `width:var(--L);height:var(--L);visibility:hidden;flex-shrink:0;`;
      lensSection.appendChild(ph);
      rect = ph.getBoundingClientRect();
      lensSection.removeChild(ph);
    }

    // Animate portal back
    portal.style.transition = 'left .7s cubic-bezier(.4,0,.2,1),top .7s cubic-bezier(.4,0,.2,1),width .7s cubic-bezier(.4,0,.2,1),height .7s cubic-bezier(.4,0,.2,1)';
    portal.style.left   = rect.left   + 'px';
    portal.style.top    = rect.top    + 'px';
    portal.style.width  = rect.width  + 'px';
    portal.style.height = rect.height + 'px';

    // Camera slides back in
    camCol.style.visibility = '';
    camCol.style.transform  = '';
    camCol.style.opacity    = '1';
    vignette.classList.remove('show');
    closePill.classList.remove('show');
    portal.classList.remove('is-expanded');
    lensAsm.classList.remove('lens-expanded');

    setTimeout(() => {
      isExpanded = false;
      _origLensRect = null;
      navRadialEl.querySelectorAll('.nav-item:not(.center)').forEach(el => el.classList.remove('show'));
      lensAsm.style.width  = '';
      lensAsm.style.height = '';
      lensSection.insertBefore(lensAsm, lensSection.querySelector('.cam-brand-label')?.nextSibling || null);
      portal.style.cssText = '';
      buildNav();
      document.getElementById('hintText').textContent = '— CLICK ◎ TO EXPAND · TAP ICONS TO EXPLORE —';
    }, 720);
  }

  // ── Wiring ────────────────────────────────────────────────
  document.getElementById('shutterBtn').addEventListener('click', () =>
    isExpanded ? collapseLens() : expandLens());

  document.getElementById('homeBtn').addEventListener('click', e => {
    e.preventDefault();
    isExpanded ? collapseLens() : expandLens();
  });

  vignette.addEventListener('click', collapseLens);
  closePill.addEventListener('click', collapseLens);

  document.getElementById('refreshBtn').addEventListener('click', () => {
    const b = document.getElementById('refreshBtn');
    b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
    lensFlashEl.classList.remove('blink'); void lensFlashEl.offsetWidth; lensFlashEl.classList.add('blink');
    setTimeout(() => location.reload(), 400);
  });

  window.addEventListener('resize', () => { if (!isExpanded) buildNav(); });

  return { expandLens, collapseLens, buildNav, get isExpanded() { return isExpanded; } };
}