import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Trash2, Search, Check, ChevronDown, Mail, Phone, RefreshCw, Globe } from 'lucide-react'
import { api, SOURCE_LABELS, formatDateTime, timeAgo } from './api'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'form', label: 'Contact form' },
  { key: 'chat', label: 'Chatbot' },
  { key: 'review', label: 'Free review' },
]

const SOURCE_STYLE = {
  form: 'bg-blue-50 text-blue-800 ring-blue-200',
  chat: 'bg-brand-50 text-brand-800 ring-brand-200',
  review: 'bg-amber-50 text-amber-900 ring-amber-200',
}

const COLUMNS = [
  ['Date', l => formatDateTime(l.created_at)],
  ['Source', l => SOURCE_LABELS[l.source] || l.source],
  ['Name', l => l.name],
  ['Email', l => l.email],
  ['Phone', l => l.phone],
  ['Business', l => l.company],
  ['Website', l => l.website],
  ['Interested in', l => l.service],
  ['Message', l => l.message],
  ['Location', l => [l.city, l.region, l.country].filter(Boolean).join(', ')],
]

const tsvCell = v => String(v ?? '').replace(/[\t\r\n]+/g, ' ').trim()

function leadAsText(l) {
  return COLUMNS.map(([k, f]) => [k, f(l)]).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

function CopyButton({ text, label = 'Copy', className = '' }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => { await copyText(text); setDone(true); setTimeout(() => setDone(false), 1500) }}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300 hover:text-ink-900 ${className}`}
    >
      {done ? <Check size={15} className="text-green-600" /> : <Copy size={15} />} {done ? 'Copied' : label}
    </button>
  )
}

function LeadRow({ lead, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="rounded-2xl border border-ink-200 bg-white">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-start gap-4 p-4 text-left sm:items-center" aria-expanded={open}>
        <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[1.3fr_1.6fr_1fr] sm:items-center sm:gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{lead.name || '(no name)'}</p>
            <p className="truncate text-sm text-ink-500">{lead.company || lead.website || '—'}</p>
          </div>
          <div className="mt-1 min-w-0 sm:mt-0">
            <p className="truncate text-sm text-ink-800">{lead.email}</p>
            <p className="truncate text-sm text-ink-500">{lead.message || '—'}</p>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:flex-col sm:items-end sm:gap-1">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${SOURCE_STYLE[lead.source] || 'bg-ink-50 text-ink-700 ring-ink-200'}`}>
              {SOURCE_LABELS[lead.source] || lead.source}
            </span>
            <span className="text-xs text-ink-400" title={formatDateTime(lead.created_at)}>{timeAgo(lead.created_at)}</span>
          </div>
        </div>
        <ChevronDown size={18} className={`mt-1 shrink-0 text-ink-400 transition-transform sm:mt-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-ink-100 p-4">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {COLUMNS.filter(([k]) => k !== 'Message').map(([k, f]) => {
              const v = f(lead)
              return v ? (
                <div key={k}>
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="mt-0.5 break-words text-ink-900">{v}</dd>
                </div>
              ) : null
            })}
          </dl>
          {lead.message && (
            <div className="mt-4">
              <p className="text-sm text-ink-500">Message</p>
              <p className="mt-1 whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm text-ink-900">{lead.message}</p>
            </div>
          )}
          {lead.transcript && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-brand-700">Show chat transcript</summary>
              <pre className="mt-2 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-ink-50 p-3 font-sans text-sm text-ink-800">{lead.transcript}</pre>
            </details>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <CopyButton text={leadAsText(lead)} label="Copy details" />
            <CopyButton text={lead.email} label="Copy email" />
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300"><Mail size={15} /> Email</a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300"><Phone size={15} /> Call</a>
            )}
            {lead.website && /\./.test(lead.website) && (
              <a href={/^https?:\/\//.test(lead.website) ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300"><Globe size={15} /> Open website</a>
            )}
            <button type="button" onClick={() => onDelete(lead)} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

export default function Leads() {
  const [leads, setLeads] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setLeads((await api('/api/admin/leads')).leads)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visible = useMemo(() => {
    if (!leads) return []
    const q = query.trim().toLowerCase()
    return leads.filter(l =>
      (filter === 'all' || l.source === filter) &&
      (!q || [l.name, l.email, l.phone, l.company, l.website, l.message, l.service].some(v => v && v.toLowerCase().includes(q))),
    )
  }, [leads, filter, query])

  const tsv = useMemo(() => [
    COLUMNS.map(([k]) => k).join('\t'),
    ...visible.map(l => COLUMNS.map(([, f]) => tsvCell(f(l))).join('\t')),
  ].join('\n'), [visible])

  const onDelete = async lead => {
    if (!window.confirm(`Delete the lead from ${lead.name || lead.email}? This can't be undone.`)) return
    try {
      await api(`/api/admin/leads/${lead.id}`, { method: 'DELETE' })
      setLeads(ls => ls.filter(l => l.id !== lead.id))
    } catch (e) {
      window.alert(e.message)
    }
  }

  const counts = useMemo(() => {
    const c = { all: leads?.length || 0 }
    for (const l of leads || []) c[l.source] = (c[l.source] || 0) + 1
    return c
  }, [leads])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by source">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${filter === f.key ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900'}`}
            >
              {f.label} <span className="opacity-60">{counts[f.key] || 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Search leads</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email, message…" className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
          </label>
          <CopyButton text={tsv} label={`Copy ${visible.length} for Sheets/Excel`} />
          <a href="/api/admin/leads.csv" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-ink-300">
            <Download size={15} /> CSV
          </a>
          <button type="button" onClick={load} className="rounded-lg p-2 text-ink-500 hover:bg-white hover:text-ink-900" aria-label="Refresh leads">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!leads && !error && <p className="py-20 text-center text-ink-400">Loading…</p>}

      {leads && (visible.length ? (
        <ul className="space-y-2.5">
          {visible.map(l => <LeadRow key={l.id} lead={l} onDelete={onDelete} />)}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <p className="font-medium text-ink-700">{leads.length ? 'No leads match your filters' : 'No leads yet'}</p>
          <p className="mt-1 text-sm text-ink-500">{leads.length ? 'Try a different search or source.' : 'Leads from the contact form, chatbot and free review requests will appear here.'}</p>
        </div>
      ))}
    </div>
  )
}
