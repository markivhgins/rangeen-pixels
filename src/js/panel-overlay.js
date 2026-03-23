/**
 * panel-overlay.js
 * Opens and closes the slide-over panel overlay.
 * Wires contact form and event signup to real backend API.
 */

const API = import.meta.env.VITE_API_URL || '/api';

let PANELS = {};

export function initPanelOverlay(panels) {
  PANELS = panels;

  document.getElementById('panelClose').addEventListener('click', closePanel);
  document.getElementById('panelOv').addEventListener('click', e => {
    if (e.target === document.getElementById('panelOv')) closePanel();
  });
  window.addEventListener('hashchange', () => {
    const k = location.hash.slice(1);
    k && PANELS[k] ? openPanel(k) : document.getElementById('panelOv').classList.remove('active');
  });

  const initHash = location.hash.slice(1);
  if (initHash && PANELS[initHash]) openPanel(initHash);
}

export function openPanel(key) {
  const p = PANELS[key]; if (!p) return;
  document.getElementById('panelIn').innerHTML =
    `<div class="panel-tag">◆ ${p.tag}</div><div class="panel-title">${p.title}</div>${p.html}`;
  document.getElementById('panelOv').classList.add('active');
  document.getElementById('panelEl').scrollTop = 0;

  if (key === 'events')  wireEventSignup();
  if (key === 'contact') wireContactForm();
}

export function closePanel() {
  document.getElementById('panelOv').classList.remove('active');
  history.replaceState(null, '', location.pathname + location.search);
}

// ── Contact form — calls POST /api/contact ────────────────────
function wireContactForm() {
  const btn = document.getElementById('ctSendBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const name    = document.getElementById('ct-name')?.value.trim();
    const email   = document.getElementById('ct-email')?.value.trim();
    const message = document.getElementById('ct-msg')?.value.trim();
    const status  = document.getElementById('ct-status');

    // Basic validation
    if (!name || !email || !message) {
      showStatus(status, 'Please fill in all fields.', 'error');
      return;
    }

    // Disable button while sending
    btn.textContent = 'SENDING...';
    btn.disabled = true;

    try {
      const res = await fetch(`${API}/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Success
      showStatus(status, 'Message sent! We will get back to you within 48 hours.', 'success');
      btn.textContent = 'SENT';

      // Clear fields
      document.getElementById('ct-name').value  = '';
      document.getElementById('ct-email').value = '';
      document.getElementById('ct-msg').value   = '';

    } catch (err) {
      showStatus(status, err.message || 'Something went wrong. Please try again.', 'error');
      btn.textContent = 'SEND MESSAGE';
      btn.disabled = false;
    }
  });
}

// ── Event signup — calls POST /api/members/apply ──────────────
function wireEventSignup() {
  const btn = document.getElementById('evSignupBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const name  = document.getElementById('ev-name')?.value.trim();
    const email = document.getElementById('ev-email')?.value.trim();
    const dept  = document.getElementById('ev-dept')?.value.trim();
    const type  = document.getElementById('ev-type')?.value;
    const msg   = document.getElementById('ev-msg');

    if (!name || !email) {
      showStatus(msg, 'Please fill in Name and Email.', 'error');
      return;
    }

    btn.textContent = 'REGISTERING...';
    btn.disabled = true;

    try {
      const res = await fetch(`${API}/members/apply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name,
          email,
          level: dept || 'student',
          bio:   type ? `Submission type: ${type}` : '',
        }),
      });

      const data = await res.json();

      // 409 = already registered — treat as success
      if (res.status === 409) {
        showStatus(msg, 'You are already registered! See you at the event.', 'success');
        btn.textContent = 'ALREADY REGISTERED';
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      showStatus(msg, 'You are registered for Through The Lens! See you there.', 'success');
      btn.textContent = 'REGISTERED';

    } catch (err) {
      showStatus(msg, err.message || 'Something went wrong. Please try again.', 'error');
      btn.textContent = 'CONFIRM REGISTRATION';
      btn.disabled = false;
    }
  });
}

// ── Helper ────────────────────────────────────────────────────
function showStatus(el, text, type) {
  if (!el) return;
  el.style.display = 'block';
  el.style.color   = type === 'error' ? '#e04040' : 'var(--gold)';
  el.textContent   = text;
}