/**
 * ticker.js
 * Renders the bottom scrolling ticker from data.
 */

export function initTicker(items) {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  // Duplicate for seamless loop
  const doubled = [...items, ...items];
  track.innerHTML = doubled
    .map(item => `<div class="tick"><b>◆</b> ${item.label.toUpperCase()}</div>`)
    .join('');
}
