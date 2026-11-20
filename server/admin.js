// Admin panel API: password login (ADMIN_PASSWORD), dashboard stats and lead management.
import crypto from 'crypto'
import { Router } from 'express'
import { store } from './store.js'
import { rateLimit } from './util.js'
import { buildStats } from './analytics.js'

const COOKIE = 'bl_admin'
const SESSION_DAYS = 7

function secret() {
  // Changing ADMIN_PASSWORD automatically signs everyone out.
  return process.env.ADMIN_SESSION_SECRET || crypto.createHash('sha256').update(`bird-labs-admin:${process.env.ADMIN_PASSWORD}`).digest('hex')
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url')
}

function readCookie(req, name) {
  const header = req.headers.cookie || ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export function isAdminRequest(req) {
  if (!process.env.ADMIN_PASSWORD) return false
  const token = readCookie(req, COOKIE)
  if (!token) return false
  const [expires, sig] = token.split('.')
  if (!expires || !sig || Number(expires) < Date.now()) return false
  const expected = sign(expires)
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
}

export function requireAdmin(req, res, next) {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Please sign in.' })
  res.set('Cache-Control', 'no-store')
  next()
}

function setSessionCookie(req, res, token, maxAgeSeconds) {
  const parts = [`${COOKIE}=${encodeURIComponent(token)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSeconds}`]
  if (req.secure) parts.push('Secure')
  res.set('Set-Cookie', parts.join('; '))
}

const LEAD_COLUMNS = ['created_at', 'source', 'name', 'email', 'phone', 'company', 'website', 'service', 'message', 'country', 'city', 'region']

function toCsv(rows) {
  const esc = v => {
    let s = v instanceof Date ? v.toISOString() : v == null ? '' : String(v)
    if (/^[=+\-@]/.test(s)) s = `'${s}` // stop spreadsheet formula injection
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [LEAD_COLUMNS.join(','), ...rows.map(r => LEAD_COLUMNS.map(c => esc(r[c])).join(','))].join('\r\n')
}

export const adminRouter = Router()

adminRouter.post('/api/admin/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many sign-in attempts. Try again in 15 minutes.' }), (req, res) => {
  if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'Admin is not set up yet. Add ADMIN_PASSWORD to the server environment.' })
  const given = crypto.createHash('sha256').update(String(req.body?.password || '')).digest()
  const actual = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest()
  if (!crypto.timingSafeEqual(given, actual)) return res.status(401).json({ error: 'Wrong password.' })
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  setSessionCookie(req, res, `${expires}.${sign(expires)}`, SESSION_DAYS * 24 * 60 * 60)
  res.json({ ok: true })
})

adminRouter.post('/api/admin/logout', (req, res) => {
  setSessionCookie(req, res, '', 0)
  res.json({ ok: true })
})

adminRouter.get('/api/admin/me', (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({ authenticated: isAdminRequest(req), configured: Boolean(process.env.ADMIN_PASSWORD) })
})

adminRouter.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const days = [7, 30, 90, 365].includes(Number(req.query.days)) ? Number(req.query.days) : 30
  try {
    res.json(await buildStats(days))
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'Could not load stats.' })
  }
})

adminRouter.get('/api/admin/leads', requireAdmin, async (req, res) => {
  try {
    res.json({ leads: await store.listLeads() })
  } catch (err) {
    console.error('Leads error:', err)
    res.status(500).json({ error: 'Could not load leads.' })
  }
})

adminRouter.get('/api/admin/leads.csv', requireAdmin, async (req, res) => {
  const leads = await store.listLeads()
  const stamp = new Date().toISOString().slice(0, 10)
  res.set('Content-Type', 'text/csv; charset=utf-8')
  res.set('Content-Disposition', `attachment; filename="birdlabs-leads-${stamp}.csv"`)
  res.send('﻿' + toCsv(leads))
})

adminRouter.delete('/api/admin/leads/:id', requireAdmin, async (req, res) => {
  const ok = await store.deleteLead(req.params.id)
  if (!ok) return res.status(404).json({ error: 'Lead not found.' })
  res.json({ ok: true })
})
