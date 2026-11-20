// Admin API for client accounts and support requests.
import { Router } from 'express'
import { store } from './store.js'
import { clean, EMAIL_RE } from './util.js'
import { requireAdmin } from './admin.js'
import { hashPassword, generatePassword } from './session.js'
import { sendEmail, escapeHtml, siteUrl } from './notify.js'
import { PLANS, STATUSES, PRIORITIES, publicCustomer, usageFor, ticketThread, findCustomerByEmail } from './support.js'

export const supportAdminRouter = Router()
supportAdminRouter.use('/api/admin/customers', requireAdmin)
supportAdminRouter.use('/api/admin/tickets', requireAdmin)
supportAdminRouter.use('/api/admin/time', requireAdmin)

function customerFields(body, { partial = false } = {}) {
  const out = {}
  const set = (key, value) => { if (!partial || key in body) out[key] = value }
  set('name', clean(body.name, 200))
  set('company', clean(body.company, 200))
  set('email', clean(body.email, 254).toLowerCase())
  set('phone', clean(body.phone, 64))
  set('notes', clean(body.notes, 5000))
  set('plan', PLANS[body.plan] ? body.plan : 'growth')
  if (!partial || 'support_hours' in body) {
    const hours = Number(body.support_hours)
    out.support_hours = Number.isFinite(hours) && hours >= 0 && hours <= 200 ? hours : PLANS[out.plan || 'growth']?.hours
  }
  if ('active' in body) out.active = body.active ? 1 : 0
  return out
}

// ── Customers ────────────────────────────────────────────────────────────────
supportAdminRouter.get('/api/admin/customers', async (req, res) => {
  const [customers, openTickets] = await Promise.all([store.list('customers'), store.list('tickets')])
  const openCount = new Map()
  for (const t of openTickets) if (t.status !== 'done') openCount.set(t.customer_id, (openCount.get(t.customer_id) || 0) + 1)
  const rows = await Promise.all(customers.map(async c => ({ ...publicCustomer(c), usage: await usageFor(c), openTickets: openCount.get(c.id) || 0 })))
  res.json({ customers: rows, plans: PLANS })
})

supportAdminRouter.post('/api/admin/customers', async (req, res) => {
  const fields = customerFields(req.body || {})
  if (!fields.name) return res.status(400).json({ error: 'Add the customer’s name.' })
  if (!EMAIL_RE.test(fields.email)) return res.status(400).json({ error: 'Add a valid email — the customer signs in with it.' })
  if (await findCustomerByEmail(fields.email)) return res.status(409).json({ error: 'A customer with that email already exists.' })
  const password = generatePassword()
  const id = await store.insert('customers', { ...fields, password_hash: await hashPassword(password), active: 1, session_version: 0 })
  res.json({ customer: publicCustomer(await store.get('customers', id)), password })
})

supportAdminRouter.patch('/api/admin/customers/:id', async (req, res) => {
  const customer = await store.get('customers', req.params.id)
  if (!customer) return res.status(404).json({ error: 'Customer not found.' })
  const fields = customerFields(req.body || {}, { partial: true })
  if ('email' in fields) {
    if (!EMAIL_RE.test(fields.email)) return res.status(400).json({ error: 'Enter a valid email.' })
    const other = await findCustomerByEmail(fields.email)
    if (other && other.id !== customer.id) return res.status(409).json({ error: 'Another customer already uses that email.' })
  }
  if ('name' in fields && !fields.name) return res.status(400).json({ error: 'Name can’t be empty.' })
  // Deactivating signs the customer out everywhere.
  if (fields.active === 0) fields.session_version = (customer.session_version || 0) + 1
  await store.update('customers', customer.id, fields)
  res.json({ customer: publicCustomer(await store.get('customers', customer.id)) })
})

supportAdminRouter.post('/api/admin/customers/:id/reset-password', async (req, res) => {
  const customer = await store.get('customers', req.params.id)
  if (!customer) return res.status(404).json({ error: 'Customer not found.' })
  const password = generatePassword()
  await store.update('customers', customer.id, { password_hash: await hashPassword(password), session_version: (customer.session_version || 0) + 1 })
  res.json({ password })
})

// ── Tickets ──────────────────────────────────────────────────────────────────
supportAdminRouter.get('/api/admin/tickets', async (req, res) => {
  const [tickets, customers] = await Promise.all([store.list('tickets'), store.list('customers')])
  const byId = new Map(customers.map(c => [c.id, c]))
  tickets.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
  res.json({
    statuses: STATUSES,
    tickets: tickets.map(t => {
      const c = byId.get(t.customer_id)
      return { ...t, customer: c ? { id: c.id, name: c.name, company: c.company } : null }
    }),
  })
})

supportAdminRouter.get('/api/admin/tickets/:id', async (req, res) => {
  const ticket = await store.get('tickets', req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Request not found.' })
  const customer = await store.get('customers', ticket.customer_id)
  const [messages, time] = await Promise.all([ticketThread(ticket.id), store.list('time_entries', { where: { ticket_id: ticket.id } })])
  res.json({
    ticket,
    customer: publicCustomer(customer),
    usage: customer ? await usageFor(customer) : null,
    messages,
    time,
    statuses: STATUSES,
  })
})

supportAdminRouter.patch('/api/admin/tickets/:id', async (req, res) => {
  const ticket = await store.get('tickets', req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Request not found.' })
  const patch = { updated_at: new Date() }
  if (req.body?.status in STATUSES) patch.status = req.body.status
  if (PRIORITIES.includes(req.body?.priority)) patch.priority = req.body.priority
  await store.update('tickets', ticket.id, patch)
  res.json({ ok: true })
})

supportAdminRouter.post('/api/admin/tickets/:id/messages', async (req, res) => {
  const ticket = await store.get('tickets', req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Request not found.' })
  const body = clean(req.body?.body, 10000)
  if (!body) return res.status(400).json({ error: 'Write a reply first.' })
  const status = req.body?.status in STATUSES ? req.body.status : ticket.status
  await store.insert('ticket_messages', { ticket_id: ticket.id, author: 'admin', body })
  await store.update('tickets', ticket.id, { status, updated_at: new Date(), last_reply_by: 'admin' })

  let emailed = false
  const customer = await store.get('customers', ticket.customer_id)
  if (customer?.email) {
    const portal = `${siteUrl(req)}/portal#request-${ticket.id}`
    try {
      emailed = await sendEmail({
        to: customer.email,
        subject: `Update on your request: ${ticket.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.6">
            <p>Hi ${escapeHtml((customer.name || '').split(' ')[0] || 'there')},</p>
            <p>We've replied to your request <strong>${escapeHtml(ticket.title)}</strong>${status !== ticket.status ? ` and marked it <strong>${escapeHtml(STATUSES[status])}</strong>` : ''}:</p>
            <blockquote style="margin:16px 0;padding:12px 16px;background:#f5f3ff;border-left:3px solid #6d28d9;white-space:pre-wrap">${escapeHtml(body)}</blockquote>
            <p><a href="${portal}" style="background:#6d28d9;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Open your client portal</a></p>
            <p style="color:#94a3b8;font-size:12px;margin-top:28px">Bird Labs · hello@birdlabs.net</p>
          </div>`,
      })
    } catch (err) {
      console.error('Reply email failed:', err.message)
    }
  }
  res.json({ ok: true, emailed })
})

supportAdminRouter.post('/api/admin/tickets/:id/time', async (req, res) => {
  const ticket = await store.get('tickets', req.params.id)
  if (!ticket) return res.status(404).json({ error: 'Request not found.' })
  const minutes = Math.round(Number(req.body?.minutes))
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 24 * 60) return res.status(400).json({ error: 'Enter the time in minutes (1–1440).' })
  await store.insert('time_entries', { ticket_id: ticket.id, customer_id: ticket.customer_id, minutes, note: clean(req.body?.note, 300) })
  res.json({ ok: true })
})

supportAdminRouter.delete('/api/admin/time/:id', async (req, res) => {
  const ok = await store.remove('time_entries', req.params.id)
  if (!ok) return res.status(404).json({ error: 'Time entry not found.' })
  res.json({ ok: true })
})
