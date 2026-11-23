import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, ChevronDown, Download, Eye, Trash2, Mail, Phone, MapPin, Link2, Pencil, ExternalLink, RefreshCw, FileText } from 'lucide-react'
import { api, formatDateTime, timeAgo } from './api'
import { jobPath } from '../lib/jobs'

const APP_STATUS = {
  new: { label: 'New', className: 'bg-blue-50 text-blue-800 ring-blue-200' },
  shortlisted: { label: 'Shortlisted', className: 'bg-brand-50 text-brand-800 ring-brand-200' },
  rejected: { label: 'Not a fit', className: 'bg-ink-100 text-ink-700 ring-ink-200' },
  hired: { label: 'Hired', className: 'bg-green-50 text-green-800 ring-green-200' },
}

const DESCRIPTION_HINT = `About the role
A short paragraph about what this person will do.

## What you'll do
- Build and launch client websites
- Set up AI chatbots for small businesses

## What we're looking for
- 1+ years with React or similar
- Clear, friendly communication`

function Badge({ status }) {
  const s = APP_STATUS[status] || APP_STATUS.new
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.className}`}>{s.label}</span>
}

function safeHref(link) {
  const first = String(link || '').split(/[\s,]+/).find(Boolean)
  if (!first || !/\./.test(first)) return null
  return /^https?:\/\//i.test(first) ? first : `https://${first}`
}

// ── Applications ─────────────────────────────────────────────────────────────
function ApplicationRow({ app, onChange, onDelete }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(app.notes || '')
  const [saved, setSaved] = useState(false)
  const link = safeHref(app.links)

  const patch = async body => {
    await api(`/api/admin/applications/${app.id}`, { method: 'PATCH', body: JSON.stringify(body) })
    onChange()
  }

  return (
    <li className="rounded-2xl border border-ink-200 bg-white">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${app.status === 'new' ? 'bg-brand-600' : 'bg-transparent'}`} />
        <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[1.2fr_1.3fr] sm:items-center sm:gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{app.name}</p>
            <p className="truncate text-sm text-ink-500">{app.email}</p>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-800">{app.job_title}</p>
            <p className="truncate text-sm text-ink-500">{app.resume_name ? 'Résumé attached' : 'No résumé'} · {timeAgo(app.created_at)}</p>
          </div>
        </div>
        <Badge status={app.status} />
        <ChevronDown size={18} className={`shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-ink-100 p-4 sm:p-5">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={`mailto:${app.email}`} className="inline-flex items-center gap-1.5 text-ink-700 hover:text-brand-700"><Mail size={15} /> {app.email}</a>
            {app.phone && <a href={`tel:${app.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 text-ink-700 hover:text-brand-700"><Phone size={15} /> {app.phone}</a>}
            {app.location && <span className="inline-flex items-center gap-1.5 text-ink-700"><MapPin size={15} /> {app.location}</span>}
            {link && <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-900"><Link2 size={15} /> {app.links}</a>}
          </div>

          {app.resume_name && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-ink-50 p-3">
              <FileText size={18} className="text-brand-700" />
              <span className="min-w-0 flex-1 truncate text-sm text-ink-800">{app.resume_name}</span>
              {/\.pdf$/i.test(app.resume_name) && (
                <a href={`/api/admin/applications/${app.id}/resume?inline=1`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300"><Eye size={15} /> View</a>
              )}
              <a href={`/api/admin/applications/${app.id}/resume`} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300"><Download size={15} /> Download</a>
            </div>
          )}

          {app.message && (
            <div>
              <p className="text-sm text-ink-500">Message</p>
              <p className="mt-1 whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm text-ink-900">{app.message}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-ink-500">Status</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(APP_STATUS).map(([k, s]) => (
                <button key={k} type="button" onClick={() => patch({ status: k })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition ${app.status === k ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-300'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-ink-500" htmlFor={`notes-${app.id}`}>Private notes</label>
            <textarea id={`notes-${app.id}`} rows={2} className="input mt-1 text-sm" value={notes} onChange={e => { setNotes(e.target.value); setSaved(false) }} placeholder="Interview notes, next steps…" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-ink-400">Applied {formatDateTime(app.created_at)}</span>
              <div className="flex items-center gap-2">
                {saved && <span className="text-xs text-green-700">Saved</span>}
                <button type="button" onClick={async () => { await patch({ notes }); setSaved(true) }} className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white">Save notes</button>
                <button type="button" onClick={() => onDelete(app)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

function Applications({ jobs, onCountChange }) {
  const [apps, setApps] = useState(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('active')
  const [job, setJob] = useState('all')

  const load = useCallback(() => api('/api/admin/applications').then(d => {
    setApps(d.applications)
    onCountChange?.(d.applications.filter(a => a.status === 'new').length)
  }).catch(e => setError(e.message)), [onCountChange])
  useEffect(() => { load() }, [load])

  const counts = useMemo(() => {
    const c = { all: apps?.length || 0, active: 0 }
    for (const a of apps || []) {
      c[a.status] = (c[a.status] || 0) + 1
      if (a.status === 'new' || a.status === 'shortlisted') c.active++
    }
    return c
  }, [apps])

  const visible = (apps || []).filter(a =>
    (status === 'all' || (status === 'active' ? a.status === 'new' || a.status === 'shortlisted' : a.status === status)) &&
    (job === 'all' || (job === 'general' ? !a.job_id : String(a.job_id) === job)),
  )

  const onDelete = async a => {
    if (!window.confirm(`Delete ${a.name}’s application and résumé? This can’t be undone.`)) return
    await api(`/api/admin/applications/${a.id}`, { method: 'DELETE' }).catch(e => window.alert(e.message))
    load()
  }

  const filters = [['active', 'To review'], ['new', 'New'], ['shortlisted', 'Shortlisted'], ['hired', 'Hired'], ['rejected', 'Not a fit'], ['all', 'All']]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {filters.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setStatus(k)} aria-pressed={status === k}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${status === k ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900'}`}>
              {label} <span className="opacity-60">{counts[k] || 0}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select value={job} onChange={e => setJob(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm" aria-label="Filter by role">
            <option value="all">All roles</option>
            <option value="general">General applications</option>
            {jobs.map(j => <option key={j.id} value={String(j.id)}>{j.title}</option>)}
          </select>
          <button type="button" onClick={load} className="rounded-lg p-2 text-ink-500 hover:bg-white hover:text-ink-900" aria-label="Refresh"><RefreshCw size={16} /></button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!apps && !error && <p className="py-16 text-center text-ink-400">Loading…</p>}
      {apps && (visible.length ? (
        <ul className="space-y-2.5">{visible.map(a => <ApplicationRow key={a.id} app={a} onChange={load} onDelete={onDelete} />)}</ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-14 text-center">
          <p className="font-medium text-ink-700">{apps.length ? 'Nothing here' : 'No applications yet'}</p>
          <p className="mt-1 text-sm text-ink-500">{apps.length ? 'Try another filter.' : 'Applications from your Careers page will appear here.'}</p>
        </div>
      ))}
    </div>
  )
}

// ── Jobs ─────────────────────────────────────────────────────────────────────
function JobForm({ initial, types, onSave, onCancel, busy }) {
  const [f, setF] = useState(() => ({ title: '', type: 'Full-time', location: '', summary: '', description: '', status: 'open', ...initial }))
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-bold">{initial?.id ? `Edit “${initial.title}”` : 'Post a new role'}</h3>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1.2fr]">
        <div><label className="label" htmlFor="jf-title">Job title *</label><input id="jf-title" required maxLength={200} className="input" value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Web Developer" /></div>
        <div>
          <label className="label" htmlFor="jf-type">Type</label>
          <select id="jf-type" className="input" value={f.type} onChange={e => set('type', e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div><label className="label" htmlFor="jf-loc">Location</label><input id="jf-loc" maxLength={120} className="input" value={f.location || ''} onChange={e => set('location', e.target.value)} placeholder="Remote / Niagara Falls, ON" /></div>
      </div>
      <div><label className="label" htmlFor="jf-sum">One-line summary</label><input id="jf-sum" maxLength={400} className="input" value={f.summary || ''} onChange={e => set('summary', e.target.value)} placeholder="Shown on the job card before it’s opened" /></div>
      <div>
        <label className="label" htmlFor="jf-desc">Description *</label>
        <textarea id="jf-desc" required rows={12} className="input font-mono text-sm" value={f.description} onChange={e => set('description', e.target.value)} placeholder={DESCRIPTION_HINT} />
        <p className="mt-1 text-xs text-ink-500">Start a line with <code>## </code> for a heading and <code>- </code> for a bullet point.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={f.status === 'open'} onChange={e => set('status', e.target.checked ? 'open' : 'closed')} className="h-4 w-4 accent-brand-700" />
          Show on the Careers page
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary py-2.5">Cancel</button>
          <button type="submit" disabled={busy} className="btn-primary py-2.5">{initial?.id ? 'Save changes' : 'Post role'}</button>
        </div>
      </div>
    </form>
  )
}

function Jobs({ data, reload }) {
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const save = async form => {
    setBusy(true)
    setError('')
    try {
      if (editing === 'new') await api('/api/admin/jobs', { method: 'POST', body: JSON.stringify(form) })
      else await api(`/api/admin/jobs/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) })
      setEditing(null)
      reload()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const toggle = async j => {
    await api(`/api/admin/jobs/${j.id}`, { method: 'PATCH', body: JSON.stringify({ status: j.status === 'open' ? 'closed' : 'open' }) }).catch(e => setError(e.message))
    reload()
  }

  const remove = async j => {
    if (!window.confirm(`Delete “${j.title}”? Its applications are kept.`)) return
    await api(`/api/admin/jobs/${j.id}`, { method: 'DELETE' }).catch(e => setError(e.message))
    reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-600">Open roles appear on <a href="/careers" target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-medium text-brand-700">your Careers page <ExternalLink size={13} /></a></p>
        {editing !== 'new' && <button type="button" onClick={() => setEditing('new')} className="btn-primary py-2.5"><Plus size={16} /> Post a role</button>}
      </div>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {editing && <JobForm initial={editing === 'new' ? null : editing} types={data.types} busy={busy} onSave={save} onCancel={() => setEditing(null)} />}

      {data.jobs.length ? (
        <ul className="space-y-2.5">
          {data.jobs.map(j => (
            <li key={j.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-4 ${j.status === 'open' ? 'border-ink-200' : 'border-dashed border-ink-300'}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{j.title}</p>
                <p className="text-sm text-ink-500">{j.type}{j.location ? ` · ${j.location}` : ''} · {j.applications} application{j.applications === 1 ? '' : 's'} · posted {timeAgo(j.created_at)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${j.status === 'open' ? 'bg-green-50 text-green-800 ring-green-200' : 'bg-ink-100 text-ink-600 ring-ink-200'}`}>{j.status === 'open' ? 'Live' : 'Closed'}</span>
              <div className="flex gap-1">
                {j.status === 'open' && <a href={jobPath(j)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50"><ExternalLink size={14} /> View page</a>}
                <button type="button" onClick={() => setEditing(j)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50"><Pencil size={14} /> Edit</button>
                <button type="button" onClick={() => toggle(j)} className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50">{j.status === 'open' ? 'Close' : 'Reopen'}</button>
                <button type="button" onClick={() => remove(j)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${j.title}`}><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : !editing && (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-14 text-center">
          <p className="font-medium text-ink-700">No roles posted</p>
          <p className="mt-1 text-sm text-ink-500">Each role you post gets its own page with its own application form.</p>
        </div>
      )}
    </div>
  )
}

export default function Careers({ onCountChange }) {
  const [view, setView] = useState('applications')
  const [jobsData, setJobsData] = useState(null)
  const loadJobs = useCallback(() => api('/api/admin/jobs').then(setJobsData).catch(() => {}), [])
  useEffect(() => { loadJobs() }, [loadJobs])

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1" role="tablist">
        {[['applications', 'Applications'], ['jobs', `Jobs${jobsData ? ` (${jobsData.jobs.filter(j => j.status === 'open').length} live)` : ''}`]].map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${view === k ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}>
            {label}
          </button>
        ))}
      </div>
      {view === 'applications' && <Applications jobs={jobsData?.jobs || []} onCountChange={onCountChange} />}
      {view === 'jobs' && (jobsData ? <Jobs data={jobsData} reload={loadJobs} /> : <p className="py-16 text-center text-ink-400">Loading…</p>)}
    </div>
  )
}
