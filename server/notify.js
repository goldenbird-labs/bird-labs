// Outgoing notifications: Pushover to the business owner's phone, email to customers (Resend).
import { Resend } from 'resend'

// Returns true if sent, false if Pushover isn't configured; throws on delivery failure.
export async function pushover(title, message, { priority = 0, url } = {}) {
  const token = process.env.PUSHOVER_APP_TOKEN || process.env.PUSHOVER_TOKEN
  const user = process.env.PUSHOVER_USER_KEY || process.env.PUSHOVER_USER
  if (!token || !user) return false
  const res = await fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, user, title, message: String(message).slice(0, 1024), priority, ...(url ? { url } : {}) }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Pushover responded ${res.status}`)
  return true
}

// Returns true if sent, false if Resend isn't configured; throws on delivery failure.
export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY || !to) return false
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.EMAIL_FROM || 'Bird Labs <hello@birdlabs.net>',
    to,
    subject,
    html,
  })
  if (error) throw new Error(error.message)
  return true
}

export const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function siteUrl(req) {
  return process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`
}
