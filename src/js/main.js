/**
 * main.js — App entry point.
 */

import { loadAll }          from './api.js';
import { buildPanels }      from './panels.js';
import { initFilmStrip }    from './film-strip.js';
import { initTicker }       from './ticker.js';
import { initCircInfo }     from './circ-info.js';
import { initLens }         from './lens.js';
import { initPanelOverlay, openPanel, closePanel } from './panel-overlay.js';

const HOLD = 2200, FDUR = 950;

// Keep lens reference outside try so boot timers can reach it
let lensRef = null;

async function boot() {
  try {
    // ── 1. Load data ───────────────────────────────────────────
    const data = await loadAll();

    // ── 2. Build panels ────────────────────────────────────────
    const panels = buildPanels(data);

    // ── 3. Init modules ────────────────────────────────────────
    initTicker(data.ticker);
    initFilmStrip(data.filmFrames);
    initPanelOverlay(panels);

    const lens = initLens(openPanel);
    lensRef = lens;

    const circ = initCircInfo(data.navData, (key) => {
      lens.collapseLens();
      setTimeout(() => openPanel(key), 500);
    });

    // ── 4. Wire nav radial ─────────────────────────────────────
    const navRadialEl = document.getElementById('navRadial');
    const KEYS = Object.keys(data.navData);
    let navIdx = 0;

    navRadialEl.querySelectorAll('.nav-item:not(.center)').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const key = el.dataset.key;
        if (lens.isExpanded) {
          circ.showInfo(key);
        } else {
          lens.expandLens();
          setTimeout(() => circ.showInfo(key), 750);
        }
      });
      el.addEventListener('mouseenter', () => {
        if (lens.isExpanded && el.dataset.key) circ.showInfo(el.dataset.key);
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });

    // Grip knobs
    function navCycle(dir) {
      if (!lens.isExpanded) {
        lens.expandLens();
        setTimeout(() => {
          navIdx = (navIdx + dir + KEYS.length) % KEYS.length;
          circ.showInfo(KEYS[navIdx]);
        }, 800);
        return;
      }
      navIdx = (navIdx + dir + KEYS.length) % KEYS.length;
      circ.showInfo(KEYS[navIdx]);
    }

    document.getElementById('navUp').addEventListener('click', () => {
      navCycle(-1);
      const k = document.getElementById('navUp');
      k.classList.remove('flash'); void k.offsetWidth; k.classList.add('flash');
      setTimeout(() => k.classList.remove('flash'), 300);
    });
    document.getElementById('navDn').addEventListener('click', () => {
      navCycle(1);
      const k = document.getElementById('navDn');
      k.classList.remove('flash'); void k.offsetWidth; k.classList.add('flash');
      setTimeout(() => k.classList.remove('flash'), 300);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (lens.isExpanded) lens.collapseLens();
        else closePanel();
      }
    });

  } catch (err) {
    console.error('Boot data error (UI will still show):', err);
  }

  // ── 5. Boot sequence — always fires regardless of data errors ─
  setTimeout(() => {
    document.getElementById('intro').classList.add('out');
    document.getElementById('flash').classList.add('fire');
  }, HOLD);

  setTimeout(() => {
    document.getElementById('scene').classList.add('show');
    document.getElementById('shutterBlades').classList.add('open');
    document.getElementById('lensGlass').classList.add('open');
  }, HOLD + FDUR * 0.5);

  setTimeout(() => {
    document.getElementById('lensInt').classList.add('visible');
    if (lensRef) lensRef.buildNav();
  }, HOLD + FDUR + 200);
}

boot();
