// Lead capture: every lead is saved to the database, and copied to Google Sheets
// and Pushover when those are configured. A lead only counts as lost if every
// destination fails, in which case it is printed to the server log as a last resort.
import { readFileSync } from 'fs'
import { google } from 'googleapis'
import { store } from './store.js'

// ── IP location (leads only — page-view analytics never sends IPs anywhere) ──
const geoCache = new Map()

function isPrivateIp(ip) {
  return !ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || ip.startsWith('::ffff:127.') || ip.startsWith('fc') || ip.startsWith('fd')
}

async function lookupIp(rawIp) {
  const ip = (rawIp || '').replace(/^::ffff:/, '')
  if (isPrivateIp(ip)) return { country: 'Local', city: '', region: '' }
  if (geoCache.has(ip)) return geoCache.get(ip)
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city,regionName`, {
      signal: AbortSignal.timeout(3000),
    })
    const data = await res.json()
    const geo = data.status === 'success'
      ? { country: data.country || '', city: data.city || '', region: data.regionName || '' }
      : { country: '', city: '', region: '' }
    if (geoCache.size > 2000) geoCache.clear()
    geoCache.set(ip, geo)
    return geo
  } catch {
    return { country: '', city: '', region: '' }
  }
}

// ── Google Sheets (optional copy) ────────────────────────────────────────────
let sheets = null
try {
  let credentials = null
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  else if (process.env.GOOGLE_CREDENTIALS_PATH) credentials = JSON.parse(readFileSync(process.env.GOOGLE_CREDENTIALS_PATH, 'utf8'))
  if (credentials) {
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
    sheets = google.sheets({ version: 'v4', auth })
  }
} catch (e) {
  console.warn('Google Sheets not configured:', e.message)
}

async function appendToSheet(lead) {
  if (!sheets || !process.env.GOOGLE_SHEET_ID) return false
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC'
  // Columns A–J match the original sheet layout; K–M were added later.
  const row = [timestamp, lead.name, lead.email, lead.phone, lead.company, lead.message, lead.ip, lead.country, lead.city, lead.region, lead.service, lead.source, lead.website]
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:M',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row.map(v => v || '')] },
  })
  return true
}

// ── Pushover (optional phone notification) ───────────────────────────────────
const SOURCE_LABEL = { form: 'Contact form', chat: 'Chatbot', review: 'Free review request' }

async function sendPushover(lead) {
  const token = process.env.PUSHOVER_APP_TOKEN || process.env.PUSHOVER_TOKEN
  const user = process.env.PUSHOVER_USER_KEY || process.env.PUSHOVER_USER
  if (!token || !user) return false

  const lines = [
    `Source: ${SOURCE_LABEL[lead.source] || lead.source}`,
    `Name: ${lead.name || 'N/A'}`,
    `Email: ${lead.email || 'N/A'}`,
    lead.phone && `Phone: ${lead.phone}`,
    lead.company && `Company: ${lead.company}`,
    lead.website && `Website: ${lead.website}`,
    lead.service && `Interested in: ${lead.service}`,
    `Location: ${[lead.city, lead.country].filter(Boolean).join(', ') || 'Unknown'}`,
    lead.message && `\n${lead.message}`,
  ].filter(Boolean)

  const res = await fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, user, title: 'New lead — Bird Labs', message: lines.join('\n').slice(0, 1024), priority: 1 }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Pushover responded ${res.status}`)
  return true
}

// Returns once the lead is safely stored somewhere; throws only if every destination failed.
export async function captureLead(input) {
  const geo = await lookupIp(input.ip)
  const lead = { ...input, ...geo }

  const [db, sheet, push] = await Promise.allSettled([store.insertLead(lead), appendToSheet(lead), sendPushover(lead)])
  for (const [name, r] of [['database', db], ['Google Sheets', sheet], ['Pushover', push]]) {
    if (r.status === 'rejected') console.error(`Lead → ${name} failed:`, r.reason?.message || r.reason)
  }

  const saved = db.status === 'fulfilled' || (sheet.status === 'fulfilled' && sheet.value) || (push.status === 'fulfilled' && push.value)
  if (!saved) {
    console.error('LEAD NOT SAVED ANYWHERE — recover from this log line:', JSON.stringify(lead))
    throw new Error('Lead could not be saved')
  }
  return lead
}
