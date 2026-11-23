// Careers: public job listings + applications with résumé upload, and the admin API to manage both.
import { Router } from 'express'
import multer from 'multer'
import { store } from './store.js'
import { rateLimit, clean, EMAIL_RE } from './util.js'
import { requireAdmin } from './admin.js'
import { pushover, sendEmail, escapeHtml } from './notify.js'
import { jobPath } from '../src/lib/jobs.js'

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
export const APPLICATION_STATUSES = ['new', 'shortlisted', 'rejected', 'hired']

const MAX_RESUME_BYTES = 5 * 1024 * 1024
const RESUME_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1, fields: 20 },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname.match(/\.[a-z0-9]+$/i)?.[0] || '').toLowerCase()
    const ok = RESUME_TYPES[file.mimetype] || ['.pdf', '.doc', '.docx'].includes(ext)
    cb(ok ? null : Object.assign(new Error('Please upload your résumé as a PDF or Word file.'), { status: 400 }), Boolean(ok))
  },
})

// Run multer and turn its errors into friendly JSON responses.
function acceptResume(req, res, next) {
  upload.single('resume')(req, res, err => {
    if (!err) return next()
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Your résumé is too large — please keep it under 5 MB.' : err.status === 400 ? err.message : 'We couldn’t read that upload. Please try again.'
    res.status(400).json({ error: message })
  })
}

function publicJob(j) {
  return { id: j.id, title: j.title, type: j.type, location: j.location, pay: j.pay, summary: j.summary, description: j.description, created_at: j.created_at }
}

function jobFields(body, { partial = false } = {}) {
  const out = {}
  const set = (k, v) => { if (!partial || k in body) out[k] = v }
  set('title', clean(body.title, 200))
  set('type', JOB_TYPES.includes(body.type) ? body.type : 'Full-time')
  set('location', clean(body.location, 120))
  set('summary', clean(body.summary, 400))
  set('pay', clean(body.pay, 100))
  set('description', clean(body.description, 20000))
  set('status', body.status === 'closed' ? 'closed' : 'open')
  return out
}

export const careersRouter = Router()

// ── Public ───────────────────────────────────────────────────────────────────
careersRouter.get('/api/careers/jobs', async (req, res) => {
  const jobs = await store.list('jobs', { where: { status: 'open' } })
  res.set('Cache-Control', 'no-cache')
  res.json({ jobs: jobs.map(publicJob) })
})

// Sitemap with a page for every open role (replaces a static sitemap.xml).
careersRouter.get('/sitemap.xml', async (req, res) => {
  const base = (process.env.PUBLIC_URL || 'https://birdlabs.net').replace(/\/$/, '')
  const jobs = await store.list('jobs', { where: { status: 'open' } })
  const urls = [
    { loc: `${base}/`, priority: '1.0' },
    { loc: `${base}/careers`, priority: '0.6' },
    ...jobs.map(j => ({ loc: `${base}${jobPath(j)}`, priority: '0.5', lastmod: new Date(j.updated_at || j.created_at).toISOString().slice(0, 10) })),
  ]
  const body = urls.map(u =>
    `  <url><loc>${escapeHtml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`).join('\n')
  res.type('application/xml').set('Cache-Control', 'public, max-age=3600')
    .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`)
})

careersRouter.post('/api/careers/apply', rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many applications from this connection. Please try again later or email hello@birdlabs.net.' }), acceptResume, async (req, res) => {
  const b = req.body || {}
  if (clean(b.company_site)) return res.json({ ok: true }) // honeypot

  const app = {
    name: clean(b.name, 200),
    email: clean(b.email, 254).toLowerCase(),
    phone: clean(b.phone, 64),
    location: clean(b.location, 120),
    links: clean(b.links, 500),
    message: clean(b.message, 5000),
  }
  if (!app.name) return res.status(400).json({ error: 'Please add your name.' })
  if (!EMAIL_RE.test(app.email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (!req.file && !app.links) return res.status(400).json({ error: 'Please attach your résumé or add a link to your LinkedIn or portfolio.' })

  let job = null
  if (b.job_id) {
    job = await store.get('jobs', Number(b.job_id))
    if (!job || job.status !== 'open') return res.status(400).json({ error: 'Sorry, this role is no longer open. Please see our other open roles at birdlabs.net/careers.' })
  }

  let fileId = null
  if (req.file) {
    fileId = await store.insert('files', {
      name: req.file.originalname.slice(0, 255),
      type: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer.toString('base64'),
    })
  }

  await store.insert('applications', {
    ...app,
    job_id: job?.id ?? null,
    job_title: job?.title || 'General application',
    file_id: fileId,
    resume_name: req.file?.originalname?.slice(0, 255) || null,
    status: 'new',
    ip: req.ip,
  })

  pushover(
    `New application — ${job?.title || 'General'}`,
    [`${app.name} <${app.email}>`, app.phone, app.location, app.links, req.file ? `Résumé: ${req.file.originalname}` : null, app.message && `\n${app.message}`].filter(Boolean).join('\n'),
  ).catch(err => console.error('Pushover failed:', err.message))

  sendEmail({
    to: app.email,
    subject: `Thanks for applying to Bird Labs${job ? ` — ${job.title}` : ''}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.6">
        <p>Hi ${escapeHtml(app.name.split(' ')[0])},</p>
        <p>Thanks for your interest in ${job ? `the <strong>${escapeHtml(job.title)}</strong> role at` : 'joining'} Bird Labs. We've received your application and will review it carefully. If there's a good fit, we'll be in touch to arrange a chat.</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:28px">Bird Labs · hello@birdlabs.net · birdlabs.net</p>
      </div>`,
  }).catch(err => console.error('Application email failed:', err.message))

  res.json({ ok: true })
})

// ── Admin ────────────────────────────────────────────────────────────────────
careersRouter.use('/api/admin/jobs', requireAdmin)
careersRouter.use('/api/admin/applications', requireAdmin)

careersRouter.get('/api/admin/jobs', async (req, res) => {
  const [jobs, apps] = await Promise.all([store.list('jobs'), store.list('applications')])
  const counts = new Map()
  for (const a of apps) counts.set(a.job_id, (counts.get(a.job_id) || 0) + 1)
  res.json({ jobs: jobs.map(j => ({ ...j, applications: counts.get(j.id) || 0 })), types: JOB_TYPES })
})

careersRouter.post('/api/admin/jobs', async (req, res) => {
  const fields = jobFields(req.body || {})
  if (!fields.title) return res.status(400).json({ error: 'Give the role a title.' })
  if (!fields.description) return res.status(400).json({ error: 'Add a description of the role.' })
  const id = await store.insert('jobs', { ...fields, updated_at: new Date() })
  res.json({ job: await store.get('jobs', id) })
})

careersRouter.patch('/api/admin/jobs/:id', async (req, res) => {
  const job = await store.get('jobs', req.params.id)
  if (!job) return res.status(404).json({ error: 'Job not found.' })
  const fields = jobFields(req.body || {}, { partial: true })
  if ('title' in fields && !fields.title) return res.status(400).json({ error: 'Title can’t be empty.' })
  await store.update('jobs', job.id, { ...fields, updated_at: new Date() })
  res.json({ job: await store.get('jobs', job.id) })
})

careersRouter.delete('/api/admin/jobs/:id', async (req, res) => {
  const ok = await store.remove('jobs', req.params.id)
  if (!ok) return res.status(404).json({ error: 'Job not found.' })
  res.json({ ok: true }) // applications keep their job_title snapshot
})

careersRouter.get('/api/admin/applications', async (req, res) => {
  res.json({ applications: await store.list('applications'), statuses: APPLICATION_STATUSES })
})

careersRouter.patch('/api/admin/applications/:id', async (req, res) => {
  const app = await store.get('applications', req.params.id)
  if (!app) return res.status(404).json({ error: 'Application not found.' })
  const patch = {}
  if (APPLICATION_STATUSES.includes(req.body?.status)) patch.status = req.body.status
  if (typeof req.body?.notes === 'string') patch.notes = clean(req.body.notes, 5000)
  await store.update('applications', app.id, patch)
  res.json({ ok: true })
})

careersRouter.delete('/api/admin/applications/:id', async (req, res) => {
  const app = await store.get('applications', req.params.id)
  if (!app) return res.status(404).json({ error: 'Application not found.' })
  if (app.file_id) await store.remove('files', app.file_id)
  await store.remove('applications', app.id)
  res.json({ ok: true })
})

careersRouter.get('/api/admin/applications/:id/resume', async (req, res) => {
  const app = await store.get('applications', req.params.id)
  const file = app?.file_id ? await store.get('files', app.file_id) : null
  if (!file) return res.status(404).json({ error: 'No résumé on this application.' })
  const safeName = (file.name || 'resume').replace(/[^\w.\- ]+/g, '_')
  res.set('Content-Type', RESUME_TYPES[file.type] ? file.type : 'application/octet-stream')
  res.set('Content-Disposition', `${req.query.inline && file.type === 'application/pdf' ? 'inline' : 'attachment'}; filename="${safeName}"`)
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('Cache-Control', 'no-store')
  res.send(Buffer.from(file.data, 'base64'))
})
