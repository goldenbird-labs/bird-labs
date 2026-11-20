// Client portal API: customers sign in with credentials created in the admin panel,
// submit support requests, follow replies and see their monthly support hours.
import { Router } from 'express'
import { store } from './store.js'
import { rateLimit, clean } from './util.js'
import { sign, safeEqual, readCookie, setCookie, hashPassword, verifyPassword, portalSecret } from './session.js'
import { pushover } from './notify.js'
import { PRIORITIES, publicCustomer, usageFor, ticketThread, findCustomerByEmail } from './support.js'

const COOKIE = 'bl_client'
const SESSION_DAYS = 30

function issueSession(req, res, customer) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = `${customer.id}.${customer.session_version || 0}.${expires}`
  setCookie(req, res, COOKIE, `${payload}.${sign(portalSecret(), payload)}`, SESSION_DAYS * 24 * 60 * 60)
}

async function currentCustomer(req) {
  const token = readCookie(req, COOKIE)
  if (!token) return null
  const [id, version, expires, sig] = token.split('.')
  if (!sig || Number(expires) < Date.now()) return null
  if (!safeEqual(sig, sign(portalSecret(), `${id}.${version}.${expires}`))) return null
  const customer = await store.get('customers', id)
  if (!customer || !customer.active || String(customer.session_version || 0) !== version) return null
  return customer
}

async function requireCustomer(req, res, next) {
  try {
    const customer = await currentCustomer(req)
    if (!customer) return res.status(401).json({ error: 'Please sign in.' })
    req.customer = customer
    res.set('Cache-Control', 'no-store')
    next()
  } catch (err) {
    next(err)
  }
}

async function ownTicket(req, res) {
  const ticket = await store.get('tickets', req.params.id)
  if (!ticket || ticket.customer_id !== req.customer.id) {
    res.status(404).json({ error: 'Request not found.' })
    return null
  }
  return ticket
}

function who(c) {
  return c.company ? `${c.name} (${c.company})` : c.name
}

export const portalRouter = Router()

portalRouter.post('/api/portal/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many sign-in attempts. Try again in 15 minutes.' }), async (req, res) => {
  const email = clean(req.body?.email, 254).toLowerCase()
  const password = String(req.body?.password || '')
  const customer = email ? await findCustomerByEmail(email) : null
  const ok = customer && customer.active && (await verifyPassword(password, customer.password_hash))
  if (!ok) return res.status(401).json({ error: 'That email and password don’t match. Contact Bird Labs if you need a new password.' })
  await store.update('customers', customer.id, { last_login_at: new Date() })
  issueSession(req, res, customer)
  res.json({ ok: true })
})

portalRouter.post('/api/portal/logout', (req, res) => {
  setCookie(req, res, COOKIE, '', 0)
  res.json({ ok: true })
})

portalRouter.get('/api/portal/me', requireCustomer, async (req, res) => {
  res.json({ customer: publicCustomer(req.customer), usage: await usageFor(req.customer) })
})

portalRouter.post('/api/portal/password', requireCustomer, rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), async (req, res) => {
  const current = String(req.body?.current || '')
  const next = String(req.body?.next || '')
  if (!(await verifyPassword(current, req.customer.password_hash))) return res.status(400).json({ error: 'Your current password is incorrect.' })
  if (next.length < 8) return res.status(400).json({ error: 'Use at least 8 characters for the new password.' })
  const session_version = (req.customer.session_version || 0) + 1
  await store.update('customers', req.customer.id, { password_hash: await hashPassword(next), session_version })
  issueSession(req, res, { ...req.customer, session_version })
  res.json({ ok: true })
})

portalRouter.get('/api/portal/tickets', requireCustomer, async (req, res) => {
  const tickets = await store.list('tickets', { where: { customer_id: req.customer.id } })
  tickets.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
  res.json({ tickets })
})

portalRouter.post('/api/portal/tickets', requireCustomer, rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }), async (req, res) => {
  const title = clean(req.body?.title, 200)
  const body = clean(req.body?.body, 10000)
  const link = clean(req.body?.link, 500)
  const priority = PRIORITIES.includes(req.body?.priority) ? req.body.priority : 'normal'
  if (!title || !body) return res.status(400).json({ error: 'Please add a short title and describe what you need.' })

  const now = new Date()
  const id = await store.insert('tickets', { customer_id: req.customer.id, title, body, link, priority, status: 'open', updated_at: now, last_reply_by: 'customer' })
  pushover(
    `${priority === 'urgent' ? 'URGENT ' : ''}Support request — ${req.customer.company || req.customer.name}`,
    `${who(req.customer)}\n${title}\n\n${body}`,
    { priority: priority === 'urgent' ? 1 : 0 },
  ).catch(err => console.error('Pushover failed:', err.message))
  res.json({ ok: true, id })
})

portalRouter.get('/api/portal/tickets/:id', requireCustomer, async (req, res) => {
  const ticket = await ownTicket(req, res)
  if (!ticket) return
  const entries = await store.list('time_entries', { where: { ticket_id: ticket.id } })
  res.json({
    ticket,
    messages: await ticketThread(ticket.id),
    minutesLogged: entries.reduce((s, e) => s + (e.minutes || 0), 0),
  })
})

portalRouter.post('/api/portal/tickets/:id/messages', requireCustomer, rateLimit({ windowMs: 60 * 60 * 1000, max: 60 }), async (req, res) => {
  const ticket = await ownTicket(req, res)
  if (!ticket) return
  const body = clean(req.body?.body, 10000)
  if (!body) return res.status(400).json({ error: 'Please write a message.' })
  await store.insert('ticket_messages', { ticket_id: ticket.id, author: 'customer', body })
  const reopen = ticket.status === 'waiting' || ticket.status === 'done'
  await store.update('tickets', ticket.id, { updated_at: new Date(), last_reply_by: 'customer', ...(reopen ? { status: 'open' } : {}) })
  pushover(`Reply on request — ${req.customer.company || req.customer.name}`, `${who(req.customer)}\nRe: ${ticket.title}\n\n${body}`)
    .catch(err => console.error('Pushover failed:', err.message))
  res.json({ ok: true })
})
