import { useEffect, useRef, useState } from 'react'
import { Briefcase, MapPin, Clock, ArrowRight, ArrowLeft, Rocket, GraduationCap, Users, Upload, FileText, X, CheckCircle2, AlertCircle, Send, Link2, Check, Mail } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'
import ChatWidget from '../components/ChatWidget'
import { track } from '../lib/track'
import { EMAIL } from '../lib/site'
import { jobPath, jobIdFromPath } from '../lib/jobs'

const values = [
  { icon: Rocket, title: 'Real projects, real clients', body: 'You’ll ship websites, chatbots and automations that small businesses rely on every day — and see the difference they make.' },
  { icon: GraduationCap, title: 'Learn modern web & AI', body: 'Work with React, Node.js and the latest AI models, and grow your skills on practical, real-world problems.' },
  { icon: Users, title: 'Small team, big ownership', body: 'Your ideas are heard and your work is visible. You’ll own projects from first conversation to launch.' },
]

const steps = ['We review every application', 'If there’s a fit, we’ll set up a short call', 'Then a practical chat about real work — no trick questions']

// Turns a plain-text job description into blocks: paragraphs, "## headings" and "- bullet" lists.
function parseDescription(text) {
  const blocks = []
  let list = null
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim()
    if (/^[-*•]\s+/.test(line)) {
      if (!list) { list = []; blocks.push({ type: 'ul', items: list }) }
      list.push(line.replace(/^[-*•]\s+/, ''))
      continue
    }
    list = null
    if (!line) continue
    if (/^#{1,3}\s+/.test(line)) blocks.push({ type: 'h', text: line.replace(/^#{1,3}\s+/, '') })
    else blocks.push({ type: 'p', text: line })
  }
  return blocks
}

function Description({ text }) {
  return (
    <div className="space-y-4 text-[17px] text-ink-700">
      {parseDescription(text).map((b, i) => {
        if (b.type === 'h') return <h2 key={i} className="pt-4 text-xl font-bold text-ink-900">{b.text}</h2>
        if (b.type === 'ul') return (
          <ul key={i} className="list-disc space-y-2 pl-5 marker:text-brand-600">
            {b.items.map((it, j) => <li key={j} className="leading-relaxed">{it}</li>)}
          </ul>
        )
        return <p key={i} className="leading-relaxed">{b.text}</p>
      })}
    </div>
  )
}

function JobMeta({ job, className = '' }) {
  return (
    <p className={`flex flex-wrap gap-x-4 gap-y-1 text-ink-500 ${className}`}>
      <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {job.type}</span>
      {job.location && <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {job.location}</span>}
    </p>
  )
}

// Google for Jobs reads this JobPosting data from each role page.
function useJobSeo(job) {
  useEffect(() => {
    if (!job) return
    document.title = `${job.title} (${job.type}, ${job.location}) — Careers at Bird Labs`
    const url = `${window.location.origin}${jobPath(job)}`
    // Keep the address tidy if the role was renamed or the link was shortened to /careers/12.
    if (window.location.pathname !== jobPath(job)) window.history.replaceState(null, '', jobPath(job) + window.location.hash)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
    document.querySelector('meta[name="description"]')?.setAttribute('content', job.summary || job.title)

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = parseDescription(job.description).map(b =>
      b.type === 'h' ? `<h3>${esc(b.text)}</h3>` : b.type === 'ul' ? `<ul>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : `<p>${esc(b.text)}</p>`,
    ).join('')
    const remote = /remote/i.test(job.location || '')
    const place = String(job.location || '').replace(/^remote\s*[—–-]?\s*/i, '').trim()
    const [city, region] = place.split(',').map(s => s.trim())
    const data = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: html,
      datePosted: new Date(job.created_at).toISOString().slice(0, 10),
      employmentType: { 'Full-time': 'FULL_TIME', 'Part-time': 'PART_TIME', Contract: 'CONTRACTOR', Internship: 'INTERN' }[job.type] || 'OTHER',
      hiringOrganization: { '@type': 'Organization', name: 'Bird Labs', sameAs: 'https://birdlabs.net', logo: 'https://birdlabs.net/favicon.svg' },
      directApply: true,
      url,
      ...(remote
        ? { jobLocationType: 'TELECOMMUTE', ...(place && { applicantLocationRequirements: { '@type': 'Country', name: place } }) }
        : { jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: city, ...(region && { addressRegion: region }), addressCountry: 'CA' } } }),
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
    return () => script.remove()
  }, [job])
}

const empty = { name: '', email: '', phone: '', location: '', links: '', message: '', company_site: '' }

function ApplyForm({ job }) {
  const [form, setForm] = useState(empty)
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const fileInput = useRef(null)
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const pickFile = f => {
    setError('')
    if (!f) return setFile(null)
    if (!/\.(pdf|docx?)$/i.test(f.name)) return setError('Please upload your résumé as a PDF or Word file.')
    if (f.size > 5 * 1024 * 1024) return setError('Your résumé is too large — please keep it under 5 MB.')
    setFile(f)
  }

  const submit = async e => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    const data = new FormData()
    for (const [k, v] of Object.entries(form)) data.append(k, v)
    data.append('job_id', job.id)
    if (file) data.append('resume', file)
    try {
      const res = await fetch('/api/careers/apply', { method: 'POST', body: data })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.')
      track('application_submit')
      setStatus('done')
      setForm(empty)
      setFile(null)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div className="card flex flex-col items-center p-10 text-center" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600"><CheckCircle2 size={30} /></span>
        <h2 className="mt-5 text-2xl font-bold">Application sent — thank you!</h2>
        <p className="mt-2 max-w-md text-ink-600">We’ve received your application for <strong className="text-ink-900">{job.title}</strong>. We read every one, and if there’s a good fit we’ll get in touch to arrange a chat.</p>
        <a href="/careers" className="mt-6 text-sm font-medium text-brand-700 hover:text-brand-900">See other open roles</a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8" aria-labelledby="apply-title">
      <div>
        <h2 id="apply-title" className="text-2xl font-extrabold">Apply for this role</h2>
        <p className="mt-1 text-ink-600">{job.title} · {job.type} · {job.location}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="a-name">Full name *</label><input id="a-name" name="name" required autoComplete="name" maxLength={200} className="input" value={form.name} onChange={set} /></div>
        <div><label className="label" htmlFor="a-email">Email *</label><input id="a-email" name="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={set} /></div>
        <div><label className="label" htmlFor="a-phone">Phone <span className="font-normal text-ink-400">(optional)</span></label><input id="a-phone" name="phone" type="tel" autoComplete="tel" maxLength={64} className="input" value={form.phone} onChange={set} /></div>
        <div><label className="label" htmlFor="a-loc">City <span className="font-normal text-ink-400">(optional)</span></label><input id="a-loc" name="location" autoComplete="address-level2" maxLength={120} className="input" value={form.location} onChange={set} /></div>
      </div>
      <div>
        <label className="label" htmlFor="a-links">LinkedIn, portfolio or GitHub</label>
        <input id="a-links" name="links" maxLength={500} className="input" placeholder="https://linkedin.com/in/…" value={form.links} onChange={set} />
      </div>

      <div>
        <span className="label">Résumé <span className="font-normal text-ink-400">(PDF or Word, up to 5 MB)</span></span>
        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-4 py-3">
            <FileText size={20} className="shrink-0 text-brand-700" />
            <span className="min-w-0 flex-1 truncate text-[15px] text-ink-800">{file.name}</span>
            <span className="text-sm text-ink-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            <button type="button" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = '' }} className="rounded p-1 text-ink-500 hover:text-ink-900" aria-label="Remove file"><X size={16} /></button>
          </div>
        ) : (
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 px-4 py-7 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]) }}
          >
            <Upload size={22} className="text-brand-700" />
            <span className="text-[15px] font-medium text-ink-800">Click to upload or drag your file here</span>
            <span className="text-sm text-ink-500">No résumé handy? Add a LinkedIn link above instead.</span>
            <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={e => pickFile(e.target.files?.[0])} />
          </label>
        )}
      </div>

      <div>
        <label className="label" htmlFor="a-msg">Why are you a great fit for this role? <span className="font-normal text-ink-400">(optional)</span></label>
        <textarea id="a-msg" name="message" rows={4} maxLength={5000} className="input resize-y" placeholder="A few lines about your experience and what you’d bring to the team." value={form.message} onChange={set} />
      </div>
      <input type="text" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.company_site} onChange={set} />

      {error && <p className="flex items-center gap-2 text-sm text-red-600" role="alert"><AlertCircle size={16} /> {error}</p>}
      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3.5 text-base">
        {status === 'loading' ? 'Sending…' : <><Send size={18} /> Submit application</>}
      </button>
      <p className="text-center text-sm text-ink-500">We only use your details to consider you for roles at Bird Labs.</p>
    </form>
  )
}

function CopyLink({ job }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${jobPath(job)}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked */ }
  }
  return (
    <button type="button" onClick={copy} className="btn-secondary">
      {copied ? <><Check size={17} /> Link copied</> : <><Link2 size={17} /> Share this role</>}
    </button>
  )
}

// ── /careers/<id>-<slug>: one role, its description and its own application form ──
function JobPage({ job }) {
  useJobSeo(job)
  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-8 sm:pb-14 sm:pt-12">
        <div className="absolute inset-x-0 top-0 -z-10 h-[360px] bg-gradient-to-b from-brand-50/70 to-white" />
        <div className="container-site max-w-6xl">
          <a href="/careers" className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> All open roles</a>
          <p className="eyebrow mt-6">Careers at Bird Labs</p>
          <h1 className="mt-2 text-[2.1rem] font-extrabold leading-[1.1] sm:text-5xl">{job.title}</h1>
          <JobMeta job={job} className="mt-4 text-base" />
          {job.summary && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-600 sm:text-xl">{job.summary}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#apply" className="btn-primary px-6 py-3.5 text-base">Apply now <ArrowRight size={18} /></a>
            <CopyLink job={job} />
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24">
        <div className="container-site grid max-w-6xl gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <article aria-label="About the role">
            <Description text={job.description} />
            <div className="mt-10 rounded-2xl border border-ink-200 bg-ink-50/70 p-6">
              <h2 className="text-lg font-bold">How hiring works</h2>
              <ol className="mt-4 space-y-3 text-ink-700">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-extrabold text-brand-700 ring-1 ring-brand-200">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 text-sm text-ink-500">Questions about this role? Email <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(job.title)}`} className="font-medium text-brand-700">{EMAIL}</a>.</p>
            </div>
          </article>
          <div id="apply" className="scroll-mt-20 lg:sticky lg:top-20 lg:self-start">
            <ApplyForm job={job} />
          </div>
        </div>
      </section>
    </>
  )
}

function RoleClosed() {
  useEffect(() => { document.title = 'Role no longer open — Careers at Bird Labs' }, [])
  return (
    <section className="section">
      <div className="container-site max-w-xl text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Briefcase size={22} /></span>
        <h1 className="mt-5 text-3xl font-extrabold">This role is no longer open</h1>
        <p className="mt-3 text-lg text-ink-600">It may have been filled or closed. Take a look at the roles we’re hiring for now.</p>
        <a href="/careers" className="btn-primary mt-8 px-6 py-3.5 text-base">See open roles <ArrowRight size={18} /></a>
      </div>
    </section>
  )
}

// ── /careers: every open role, each linking to its own page ──
function ListPage({ jobs }) {
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-brand-50/70 to-white" />
        <div className="container-site max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> Careers at Bird Labs
          </p>
          <h1 className="mt-6 text-[2.3rem] font-extrabold leading-[1.1] sm:text-5xl">Help small businesses win online</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-600 sm:text-xl">
            We build websites, AI chatbots and automations that bring small businesses more customers. We’re a small team based in Niagara Falls, Ontario, and we’re always glad to hear from people who care about great work.
          </p>
          <div className="mt-8 flex justify-center">
            <a href="#roles" className="btn-primary px-6 py-3.5 text-base">See open roles <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      <section className="container-site" aria-label="Working at Bird Labs">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white"><Icon size={21} /></span>
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="mt-2 leading-relaxed text-ink-600">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="roles" className="section scroll-mt-16" aria-labelledby="roles-title">
        <div className="container-site max-w-4xl">
          <div className="text-center">
            <p className="eyebrow">Open roles</p>
            <h2 id="roles-title" className="section-title">Current openings</h2>
          </div>
          <div className="mt-10">
            {!jobs ? (
              <p className="py-10 text-center text-ink-400">Loading roles…</p>
            ) : jobs.length ? (
              <ul className="space-y-4">
                {jobs.map(job => (
                  <li key={job.id}>
                    <a href={jobPath(job)} className="card group flex items-start gap-4 p-6 transition hover:border-brand-300 hover:shadow-lg">
                      <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:flex"><Briefcase size={20} /></span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-ink-900 group-hover:text-brand-800">{job.title}</h3>
                        <JobMeta job={job} className="mt-1.5 text-sm" />
                        {job.summary && <p className="mt-3 text-ink-600">{job.summary}</p>}
                        <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-700">View role & apply <ArrowRight size={17} className="transition group-hover:translate-x-0.5" /></span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="card flex flex-col items-center p-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Briefcase size={22} /></span>
                <p className="mt-4 text-lg font-semibold text-ink-900">No open roles right now</p>
                <p className="mt-1 max-w-md text-ink-600">Check back soon — new roles are posted here first.</p>
                <a href={`mailto:${EMAIL}?subject=${encodeURIComponent('Careers at Bird Labs')}`} className="btn-secondary mt-6"><Mail size={17} /> {EMAIL}</a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default function CareersPage() {
  const [jobs, setJobs] = useState(null)
  const jobId = jobIdFromPath(window.location.pathname)

  useEffect(() => {
    fetch('/api/careers/jobs').then(r => r.json()).then(d => {
      const list = d.jobs || []
      // Old share links (/careers#job-12) move to the role's own page.
      const m = window.location.hash.match(/^#job-(\d+)$/)
      const old = m && list.find(j => j.id === Number(m[1]))
      if (old) return window.location.replace(jobPath(old))
      setJobs(list)
    }).catch(() => setJobs([]))
  }, [])

  const job = jobId != null && jobs ? jobs.find(j => j.id === jobId) : null

  return (
    <>
      <Navbar />
      <main id="main">
        {jobId == null ? <ListPage jobs={jobs} />
          : !jobs ? <div className="min-h-[60vh]" aria-busy="true" />
            : job ? <JobPage job={job} />
              : <RoleClosed />}
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
