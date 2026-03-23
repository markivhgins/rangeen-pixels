/**
 * api/services/email.js
 * Nodemailer wrapper for transactional emails.
 * Configure SMTP via environment variables.
 */

import nodemailer from 'nodemailer';

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

export async function sendJoinConfirmation({ name, email }) {
  if (!process.env.SMTP_USER) {
    console.log(`[email skipped — no SMTP_USER] Would send join confirmation to ${email}`);
    return;
  }
  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: 'Welcome to Rangeen Pixels — Application Received 📷',
    text:    `Hi ${name},\n\nWe've received your application to join Rangeen Pixels Photography Club!\n\nOur committee reviews applications weekly. You'll hear from us soon.\n\nKeep shooting,\nRangeen Pixels`,
    html:    `
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

export async function sendEventReminder({ memberEmail, memberName, event }) {
  if (!process.env.SMTP_USER) return;
  await transporter.sendMail({
    from:    FROM,
    to:      memberEmail,
    subject: `Reminder: ${event.title} tomorrow 📸`,
    text:    `Hi ${memberName},\n\nJust a reminder that "${event.title}" is tomorrow at ${event.location}.\n\nSee you there!\nRangeen Pixels`,
  });
}
