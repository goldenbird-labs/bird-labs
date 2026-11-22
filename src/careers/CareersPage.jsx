import { useEffect, useRef, useState } from 'react'
import { Briefcase, MapPin, Clock, ChevronDown, ArrowRight, Rocket, GraduationCap, Users, Upload, FileText, X, CheckCircle2, AlertCircle, Send, Link2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'
import ChatWidget from '../components/ChatWidget'
import { track } from '../lib/track'
import { EMAIL } from '../lib/site'

const values = [
  { icon: Rocket, title: 'Real projects, real clients', body: 'You’ll ship websites, chatbots and automations that small businesses rely on every day — and see the difference they make.' },
  { icon: GraduationCap, title: 'Learn modern web & AI', body: 'Work with React, Node.js and the latest AI models, and grow your skills on practical, real-world problems.' },
  { icon: Users, title: 'Small team, big ownership', body: 'Your ideas are heard and your work is visible. You’ll own projects from first conversation to launch.' },
]

// Turns a plain-text job description into paragraphs, "## headings" and "- bullet" lists.
function Description({ text }) {
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
  return (
    <div className="space-y-3 text-ink-700">
      {blocks.map((b, i) => {
        if (b.type === 'h') return <h4 key={i} className="pt-2 text-base font-bold text-ink-900">{b.text}</h4>
        if (b.type === 'ul') return (
          <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-brand-600">
            {b.items.map((it, j) => <li key={j}>{it}</li>)}
          </ul>
        )
        return <p key={i} className="leading-relaxed">{b.text}</p>
      })}
    </div>
  )
}

function JobCard({ job, open, onToggle, onApply }) {
  return (
    <li id={`job-${job.id}`} className="card scroll-mt-24 overflow-hidden">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 p-6 text-left">
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:flex"><Briefcase size={20} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">{job.title}</h3>
          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1"><Clock size={14} /> {job.type}</span>
            {job.location && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {job.location}</span>}
          </p>
          {job.summary && <p className="mt-3 text-ink-600">{job.summary}</p>}
        </div>
        <ChevronDown size={20} className={`mt-1 shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-ink-100 px-6 pb-6 pt-5 sm:pl-[5.25rem]">
          <Description text={job.description} />
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={onApply} className="btn-primary"><Send size={17} /> Apply for this role</button>
            <button
              type="button"
              onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/careers#job-${job.id}`) } catch { /* ignore */ } }}
              className="btn-secondary"
            >
              <Link2 size={17} /> Copy link
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

const empty = { name: '', email: '', phone: '', location: '', links: '', message: '', company_site: '' }

function ApplyForm({ jobs, jobId, setJobId, formRef }) {
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
    if (jobId) data.append('job_id', jobId)
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
      <div ref={formRef} className="card flex flex-col items-center p-10 text-center" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600"><CheckCircle2 size={30} /></span>
        <h3 className="mt-5 text-2xl font-bold">Application sent — thank you!</h3>
        <p className="mt-2 max-w-md text-ink-600">We read every application. If there’s a good fit, we’ll get in touch to arrange a chat.</p>
        <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm font-medium text-ink-500 hover:text-ink-800">Send another application</button>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
      <div>
        <label className="label" htmlFor="a-role">Role</label>
        <select id="a-role" className="input" value={jobId} onChange={e => setJobId(e.target.value)}>
          <option value="">General application — any future role</option>
          {jobs.map(j => <option key={j.id} value={String(j.id)}>{j.title} ({j.type})</option>)}
        </select>
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
        <label className="label" htmlFor="a-msg">Why Bird Labs? <span className="font-normal text-ink-400">(optional)</span></label>
        <textarea id="a-msg" name="message" rows={4} maxLength={5000} className="input resize-y" placeholder="Tell us a little about yourself and what you’d like to work on." value={form.message} onChange={set} />
      </div>
      <input type="text" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.company_site} onChange={set} />

      {error && <p className="flex items-center gap-2 text-sm text-red-600" role="alert"><AlertCircle size={16} /> {error}</p>}
      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3.5 text-base">
        {status === 'loading' ? 'Sending…' : <><Send size={18} /> Send application</>}
      </button>
      <p className="text-center text-sm text-ink-500">We only use your details to consider you for roles at Bird Labs.</p>
    </form>
  )
}

export default function CareersPage() {
  const [jobs, setJobs] = useState(null)
  const [openJob, setOpenJob] = useState(null)
  const [jobId, setJobId] = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    fetch('/api/careers/jobs').then(r => r.json()).then(d => {
      setJobs(d.jobs || [])
      const m = window.location.hash.match(/^#job-(\d+)$/)
      if (m && d.jobs?.some(j => j.id === Number(m[1]))) {
        setOpenJob(Number(m[1]))
        setTimeout(() => document.getElementById(`job-${m[1]}`)?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }).catch(() => setJobs([]))
  }, [])

  const applyFor = id => {
    setJobId(id ? String(id) : '')
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <>
      <Navbar />
      <main id="main">
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
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#roles" className="btn-primary px-6 py-3.5 text-base">See open roles <ArrowRight size={18} /></a>
              <button type="button" onClick={() => applyFor('')} className="btn-secondary px-6 py-3.5 text-base">Send a general application</button>
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
                  {jobs.map(j => (
                    <JobCard key={j.id} job={j} open={openJob === j.id} onToggle={() => setOpenJob(o => (o === j.id ? null : j.id))} onApply={() => applyFor(j.id)} />
                  ))}
                </ul>
              ) : (
                <div className="card flex flex-col items-center p-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Briefcase size={22} /></span>
                  <p className="mt-4 text-lg font-semibold text-ink-900">No open roles right now</p>
                  <p className="mt-1 max-w-md text-ink-600">We’re still keen to meet great people. Send a general application and we’ll reach out when something fits.</p>
                  <button type="button" onClick={() => applyFor('')} className="btn-primary mt-6">Send a general application</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="apply" className="section scroll-mt-16 bg-ink-50/70" aria-labelledby="apply-title">
          <div className="container-site grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <div>
              <p className="eyebrow">Apply</p>
              <h2 id="apply-title" className="section-title">Tell us about yourself</h2>
              <p className="section-lead">Pick a role, or send a general application. It only takes a couple of minutes.</p>
              <ol className="mt-8 space-y-4 text-ink-700">
                {['We review every application', 'If there’s a fit, we’ll set up a short call', 'Then a practical chat about real work — no trick questions'].map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-extrabold text-brand-700 ring-1 ring-brand-200">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-sm text-ink-500">Questions? Email <a href={`mailto:${EMAIL}`} className="font-medium text-brand-700">{EMAIL}</a>.</p>
            </div>
            <ApplyForm jobs={jobs || []} jobId={jobId} setJobId={setJobId} formRef={formRef} />
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
