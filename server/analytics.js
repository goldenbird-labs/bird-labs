// Cookie-free visitor analytics. The browser sends a small beacon per page view and per
// key action (chat opened, Calendly/WhatsApp clicked…). IP addresses are not stored or
// sent anywhere; location comes from the visitor's time zone.
import { Router } from 'express'
import { store } from './store.js'
import { rateLimit, clean, isBot, parseDevice, parseBrowser } from './util.js'
import { isAdminRequest } from './admin.js'

export const EVENT_TYPES = [
  'pageview', 'chat_open', 'chat_message', 'calendly_click', 'whatsapp_click', 'email_click', 'phone_click',
  'form_start', 'form_submit', 'review_submit', 'application_submit',
]

// "America/Toronto" → "Toronto"; "Asia/Kolkata" → "Kolkata"
function locationFromTimeZone(tz) {
  if (!tz || !tz.includes('/')) return null
  return tz.split('/').pop().replace(/_/g, ' ').slice(0, 100)
}

function referrerHost(ref, ownHost) {
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '')
    if (!host || host === ownHost) return null
    return host.slice(0, 300)
  } catch {
    return null
  }
}

export const analyticsRouter = Router()

analyticsRouter.post('/api/track', rateLimit({ windowMs: 60 * 1000, max: 120 }), async (req, res) => {
  res.status(204).end()
  try {
    const ua = req.get('user-agent') || ''
    if (isBot(ua) || isAdminRequest(req)) return
    const b = req.body || {}
    const type = clean(b.type, 32)
    if (!EVENT_TYPES.includes(type)) return
    const ownHost = (req.hostname || '').replace(/^www\./, '')

    await store.insertEvent({
      type,
      path: clean(b.path, 300) || '/',
      referrer: referrerHost(clean(b.referrer, 1000), ownHost),
      visitor_id: clean(b.vid, 32),
      session_id: clean(b.sid, 32),
      location: locationFromTimeZone(clean(b.tz, 64)),
      device: parseDevice(ua),
      browser: parseBrowser(ua),
      utm_source: clean(b.utm?.source, 100).toLowerCase(),
      utm_medium: clean(b.utm?.medium, 100).toLowerCase(),
      utm_campaign: clean(b.utm?.campaign, 100),
    })
  } catch (err) {
    console.error('Track error:', err.message)
  }
})

// ── Dashboard aggregation ───────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000

function topCounts(map, limit = 8) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, value]) => ({ label, value }))
}

function countBySession(pageviews, keyFn) {
  // Count each session once, attributed to its first page view.
  const firstBySession = new Map()
  for (const e of pageviews) {
    const prev = firstBySession.get(e.session_id)
    if (!prev || e.created_at < prev.created_at) firstBySession.set(e.session_id, e)
  }
  const counts = new Map()
  for (const e of firstBySession.values()) {
    const k = keyFn(e)
    if (k) counts.set(k, (counts.get(k) || 0) + 1)
  }
  return counts
}

function summarize(events, leads) {
  const pageviews = events.filter(e => e.type === 'pageview')
  const visitors = new Set(pageviews.map(e => e.visitor_id)).size
  const sessions = new Set(pageviews.map(e => e.session_id)).size
  return { pageviews: pageviews.length, visitors, sessions, leads: leads.length, conversion: visitors ? leads.length / visitors : 0 }
}

export async function buildStats(days) {
  const tz = process.env.ANALYTICS_TZ || 'America/Toronto'
  const now = Date.now()
  const since = new Date(now - days * DAY)
  const prevSince = new Date(now - 2 * days * DAY)

  const [allEvents, allLeads] = await Promise.all([store.eventsSince(prevSince), store.leadsSince(prevSince)])
  const asDate = d => (d instanceof Date ? d : new Date(d))
  allEvents.forEach(e => { e.created_at = asDate(e.created_at) })
  allLeads.forEach(l => { l.created_at = asDate(l.created_at) })

  const events = allEvents.filter(e => e.created_at >= since)
  const leads = allLeads.filter(l => l.created_at >= since)
  const prevEvents = allEvents.filter(e => e.created_at < since)
  const prevLeads = allLeads.filter(l => l.created_at < since)

  // Daily series, bucketed in the business's time zone.
  const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
  const keys = []
  for (let i = days - 1; i >= 0; i--) {
    const k = dayKey.format(new Date(now - i * DAY))
    if (!keys.includes(k)) keys.push(k)
  }
  const daily = new Map(keys.map(k => [k, { date: k, pageviews: 0, visitors: new Set(), leads: 0 }]))
  for (const e of events) {
    if (e.type !== 'pageview') continue
    const d = daily.get(dayKey.format(e.created_at))
    if (d) { d.pageviews++; d.visitors.add(e.visitor_id) }
  }
  for (const l of leads) {
    const d = daily.get(dayKey.format(l.created_at))
    if (d) d.leads++
  }

  const pageviews = events.filter(e => e.type === 'pageview')
  const actionCounts = {}
  for (const t of EVENT_TYPES) if (t !== 'pageview') actionCounts[t] = 0
  for (const e of events) if (e.type in actionCounts) actionCounts[e.type]++

  const leadSources = { form: 0, chat: 0, review: 0 }
  for (const l of leads) leadSources[l.source] = (leadSources[l.source] || 0) + 1

  // Funnel: unique visitors who did each step.
  const visitorsWith = type => new Set(events.filter(e => e.type === type).map(e => e.visitor_id)).size
  const engagedTypes = new Set(['chat_open', 'calendly_click', 'whatsapp_click', 'email_click', 'phone_click', 'form_start'])
  const engaged = new Set(events.filter(e => engagedTypes.has(e.type)).map(e => e.visitor_id)).size

  return {
    days,
    timeZone: tz,
    totals: summarize(events, leads),
    previous: summarize(prevEvents, prevLeads),
    daily: [...daily.values()].map(d => ({ date: d.date, pageviews: d.pageviews, visitors: d.visitors.size, leads: d.leads })),
    funnel: [
      { label: 'Visitors', value: new Set(pageviews.map(e => e.visitor_id)).size },
      { label: 'Engaged (chat, call, WhatsApp, form)', value: engaged },
      { label: 'Became a lead', value: leads.length },
    ],
    actions: actionCounts,
    leadSources,
    sources: topCounts(countBySession(pageviews, e => e.referrer || 'Direct / none')),
    campaigns: topCounts(countBySession(pageviews, e => e.utm_source ? [e.utm_source, e.utm_campaign].filter(Boolean).join(' · ') : null)),
    locations: topCounts(countBySession(pageviews, e => e.location || 'Unknown')),
    devices: topCounts(countBySession(pageviews, e => e.device || 'Unknown')),
    pages: topCounts(pageviews.reduce((m, e) => m.set(e.path, (m.get(e.path) || 0) + 1), new Map())),
    recentLeads: leads.slice(0, 6).map(l => ({ id: l.id, created_at: l.created_at, source: l.source, name: l.name, email: l.email, service: l.service })),
    chatOpeners: visitorsWith('chat_open'),
  }
}
