import 'dotenv/config'
import express from 'express'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { initStore } from './server/store.js'
import { seedOnce } from './server/seed.js'
import { captureLead } from './server/leads.js'
import { chatRouter } from './server/chat.js'
import { analyticsRouter } from './server/analytics.js'
import { adminRouter } from './server/admin.js'
import { portalRouter } from './server/portal.js'
import { supportAdminRouter } from './server/support-admin.js'
import { careersRouter } from './server/careers.js'
import { rateLimit, clean, EMAIL_RE } from './server/util.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Hostinger serves the app behind its CDN/proxy; trust it so req.ip and req.secure are correct.
app.set('trust proxy', true)
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// ── Contact form & free-review leads ─────────────────────────────────────────
app.post('/api/leads', rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many submissions. Please try again later or message us on WhatsApp.' }), async (req, res) => {
  const b = req.body || {}

  // Honeypot: real visitors never see or fill the "company_site" field.
  if (clean(b.company_site)) return res.json({ success: true })

  const source = b.source === 'review' ? 'review' : 'form'
  const lead = {
    source,
    name: clean(b.name, 200),
    email: clean(b.email, 254).toLowerCase(),
    phone: clean(b.phone, 64),
    company: clean(b.company, 200),
    website: clean(b.website, 300),
    service: clean(b.service, 100),
    message: clean(b.message, 5000),
    ip: req.ip,
  }

  if (!EMAIL_RE.test(lead.email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (source === 'form' && (!lead.name || !lead.message)) {
    return res.status(400).json({ error: 'Please add your name and a short message.' })
  }
  if (source === 'review' && !lead.message) lead.message = 'Requested a free website & AI review.'

  try {
    await captureLead(lead)
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Something went wrong on our side. Please email hello@birdlabs.net or message us on WhatsApp.' })
  }
})

app.use(chatRouter)
app.use(analyticsRouter)
app.use(adminRouter)
app.use(supportAdminRouter)
app.use(portalRouter)
app.use(careersRouter)

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Express needs all four arguments to treat this as the error handler.
app.use('/api', (err, req, res, _next) => {
  console.error(`${req.method} ${req.originalUrl} failed:`, err)
  if (!res.headersSent) res.status(500).json({ error: 'Something went wrong. Please try again.' })
})

// ── Built frontend: / (site), /careers, /chat (Birdie), /admin (dashboard), /portal (clients) ──
const distPath = path.join(__dirname, 'dist')
if (existsSync(distPath)) {
  app.use('/assets', express.static(path.join(distPath, 'assets'), { immutable: true, maxAge: '1y' }))
  app.use(express.static(distPath, { extensions: ['html'], maxAge: '1h' }))
  app.get('/admin/{*rest}', (req, res) => res.sendFile(path.join(distPath, 'admin.html')))
  app.get('/portal/{*rest}', (req, res) => res.sendFile(path.join(distPath, 'portal.html')))
  app.get('/{*path}', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

await initStore()
await seedOnce().catch(err => console.error('Seeding failed:', err.message))
app.listen(PORT, () => console.log(`Bird Labs server running at http://localhost:${PORT}`))
