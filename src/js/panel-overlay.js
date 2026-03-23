/**
 * panel-overlay.js
 * Opens and closes the slide-over panel overlay.
 */

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

function wireEventSignup() {
  const btn = document.getElementById('evSignupBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const name  = document.getElementById('ev-name')?.value.trim();
    const email = document.getElementById('ev-email')?.value.trim();
    const msg   = document.getElementById('ev-msg');
    if (!name || !email) {
      if (msg) { msg.style.display = 'block'; msg.style.color = '#e04040'; msg.textContent = 'Please fill in Name and Email.'; }
      return;
    }
    if (msg) { msg.style.display = 'block'; msg.style.color = 'var(--gold)'; msg.textContent = 'You are registered for Through The Lens! See you there.'; }
    btn.textContent = 'REGISTERED';
    btn.disabled = true;
  });
}

function wireContactForm() {
  const btn = document.getElementById('ctSendBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const name   = document.getElementById('ct-name')?.value.trim();
    const email  = document.getElementById('ct-email')?.value.trim();
    const msg    = document.getElementById('ct-msg')?.value.trim();
    const status = document.getElementById('ct-status');
    if (!name || !email || !msg) {
      if (status) { status.style.display = 'block'; status.style.color = '#e04040'; status.textContent = 'Please fill in all fields.'; }
      return;
    }
    if (status) { status.style.display = 'block'; status.style.color = 'var(--gold)'; status.textContent = 'Message sent! We will get back to you within 48 hours.'; }
    btn.textContent = 'SENT';
    btn.disabled = true;
  });
}
