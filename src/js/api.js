/**
 * api.js — All backend communication. Falls back to static data if API offline.
 */

import * as LocalData from '../data/club-data.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TIMEOUT  = 5000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(BASE_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function getNavData() {
  try { return await request('/sections'); }
  catch { return LocalData.NAV_DATA; }
}

export async function getFilmFrames() {
  try { return await request('/sections/summary'); }
  catch { return LocalData.FILM_FRAMES; }
}

export async function getTicker() {
  try { return await request('/announcements'); }
  catch { return LocalData.TICKER_ITEMS; }
}

export async function getEvents() {
  try { return await request('/events?upcoming=true'); }
  catch { return LocalData.EVENTS; }
}

export async function getMembers() {
  try { return await request('/members?role=committee'); }
  catch { return LocalData.MEMBERS; }
}

export async function getFaculty() {
  try { return await request('/members?role=faculty'); }
  catch { return LocalData.FACULTY; }
}

export async function getAchievements() {
  try { return await request('/awards'); }   
  catch { return LocalData.ACHIEVEMENTS; }
}
export async function getGalleryCategories() {
  try { return await request('/gallery/categories'); }
  catch { return LocalData.GALLERY_CATEGORIES; }
}

export async function loadAll() {
  const [
    navData, filmFrames, ticker,
    events,  members,    faculty,
    achievements, categories,
  ] = await Promise.all([
    getNavData(),       getFilmFrames(),       getTicker(),
    getEvents(),        getMembers(),           getFaculty(),
    getAchievements(),  getGalleryCategories(),
  ]);
  return { navData, filmFrames, ticker, events, members, faculty, achievements, categories };
}
