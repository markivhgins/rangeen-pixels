/**
 * backend/services/email.js
 * Nodemailer wrapper for all transactional emails.
 * All functions are safe to call even when SMTP is not configured —
 * they silently log and return without throwing.
 */

import nodemailer from 'nodemailer';

const configured = !!process.env.SMTP_USER;

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || 'Rangeen Pixels <noreply@rangeenpixels.club>';

function skip(fn) {
  if (!configured) {
    console.log(`[email skipped — SMTP not configured] ${fn}`);
    return true;
  }
  return false;
}

// ── Join confirmation ─────────────────────────────────────────
export async function sendJoinConfirmation({ name, email }) {
  if (skip('sendJoinConfirmation')) return;
  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: 'Welcome to Rangeen Pixels — Application Received 📷',
    text:    `Hi ${name},\n\nWe've received your application to join Rangeen Pixels Photography Club!\n\nOur committee reviews applications weekly. You'll hear from us soon.\n\nKeep shooting,\nRangeen Pixels`,
    html: `
      <div style="font-family:monospace;background:#060606;color:#f0ead8;padding:40px;max-width:500px;margin:0 auto;">
        <h1 style="font-size:2rem;letter-spacing:.3em;color:#c9a84c;">RANGEEN PIXELS</h1>
        <p style="color:#c9a84c;font-size:.75rem;letter-spacing:.3em;">PHOTOGRAPHY CLUB</p>
        <hr style="border-color:#1a1a1a;margin:24px 0;">
        <p>Hi <strong>${name}</strong>,</p>
        <p>We've received your application to join Rangeen Pixels Photography Club!</p>
        <p>Our committee reviews applications weekly. You'll hear from us soon.</p>
        <hr style="border-color:#1a1a1a;margin:24px 0;">
        <p style="color:#888;font-size:.75rem;">Keep shooting — Rangeen Pixels</p>
      </div>`,
  });
}

// ── Event RSVP confirmation ───────────────────────────────────
export async function sendRsvpConfirmation({ memberName, memberEmail, event }) {
  if (skip('sendRsvpConfirmation')) return;
  const date = new Date(event.starts_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const time = new Date(event.starts_at).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
  await transporter.sendMail({
    from:    FROM,
    to:      memberEmail,
    subject: `You're registered for ${event.title} 📸`,
    text:    `Hi ${memberName},\n\nYou're registered for "${event.title}".\n\nDate: ${date}\nTime: ${time}\nLocation: ${event.location || 'TBA'}\n\nSee you there!\nRangeen Pixels`,
    html: `
      <div style="font-family:monospace;background:#060606;color:#f0ead8;padding:40px;max-width:500px;margin:0 auto;">
        <h1 style="font-size:2rem;letter-spacing:.3em;color:#c9a84c;">RANGEEN PIXELS</h1>
        <p style="color:#c9a84c;font-size:.75rem;letter-spacing:.3em;">PHOTOGRAPHY CLUB</p>
        <hr style="border-color:#1a1a1a;margin:24px 0;">
        <p>Hi <strong>${memberName}</strong>,</p>
        <p>You're confirmed for <strong>${event.title}</strong>.</p>
        <table style="width:100%;margin:16px 0;border-collapse:collapse;">
          <tr><td style="color:#888;padding:4px 0;width:90px;">Date</td><td>${date}</td></tr>
          <tr><td style="color:#888;padding:4px 0;">Time</td><td>${time}</td></tr>
          <tr><td style="color:#888;padding:4px 0;">Location</td><td>${event.location || 'TBA'}</td></tr>
        </table>
        <hr style="border-color:#1a1a1a;margin:24px 0;">
        <p style="color:#888;font-size:.75rem;">See you there — Rangeen Pixels</p>
      </div>`,
  });
}

// ── Event reminder ────────────────────────────────────────────
export async function sendEventReminder({ memberEmail, memberName, event }) {
  if (skip('sendEventReminder')) return;
  await transporter.sendMail({
    from:    FROM,
    to:      memberEmail,
    subject: `Reminder: ${event.title} tomorrow 📸`,
    text:    `Hi ${memberName},\n\nJust a reminder that "${event.title}" is tomorrow at ${event.location}.\n\nSee you there!\nRangeen Pixels`,
  });
}

// ── Contact form notification to coordinator ──────────────────
export async function sendContactNotification({ name, email, subject, message }) {
  if (skip('sendContactNotification')) return;
  await transporter.sendMail({
    from:    FROM,
    to:      process.env.SMTP_USER,   // sends to the club's own inbox
    replyTo: email,                   // coordinator can reply directly to sender
    subject: `[Contact Form] ${subject || 'New message'} — from ${name}`,
    text:    `New contact form message:\n\nFrom: ${name} <${email}>\nSubject: ${subject || '(none)'}\n\n${message}`,
    html: `
      <div style="font-family:monospace;background:#060606;color:#f0ead8;padding:40px;max-width:500px;margin:0 auto;">
        <h1 style="font-size:2rem;letter-spacing:.3em;color:#c9a84c;">RANGEEN PIXELS</h1>
        <p style="color:#c9a84c;font-size:.75rem;letter-spacing:.3em;">CONTACT FORM MESSAGE</p>
        <hr style="border-color:#1a1a1a;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#888;padding:4px 0;width:80px;">From</td><td>${name}</td></tr>
          <tr><td style="color:#888;padding:4px 0;">Email</td><td><a href="mailto:${email}" style="color:#c9a84c;">${email}</a></td></tr>
          <tr><td style="color:#888;padding:4px 0;">Subject</td><td>${subject || '(none)'}</td></tr>
        </table>
        <hr style="border-color:#1a1a1a;margin:24px 0;">
        <p style="white-space:pre-wrap;">${message}</p>
        <hr style="border-color:#1a1a1a;margin:24px 0;">
        <p style="color:#888;font-size:.75rem;">Reply directly to this email to respond to ${name}.</p>
      </div>`,
  });
}