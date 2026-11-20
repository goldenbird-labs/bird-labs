import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, AlertTriangle, Link2, Send, Clock, Trash2, RefreshCw, Mail, Phone } from 'lucide-react'
import { api, formatDateTime, timeAgo } from './api'
import { ADMIN_STATUS_LABEL, formatMinutes } from '../lib/support'
import { StatusBadge, UsageBar } from '../components/SupportUI'

const FILTERS = [
  { key: 'active', label: 'Active' },
  { key: 'open', label: 'New' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'waiting', label: 'Waiting on customer' },
  { key: 'done', label: 'Done' },
  { key: 'all', label: 'All' },
]

function Bubble({ author, body, at, name }) {
  const ours = author === 'admin'
  return (
    <div className={`flex ${ours ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${ours ? 'rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-white text-ink-900 ring-1 ring-ink-200'}`}>
        <p className={`mb-1 text-xs font-semibold ${ours ? 'text-brand-100' : 'text-ink-500'}`}>{ours ? 'You (Bird Labs)' : name} · {timeAgo(at)}</p>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function Detail({ id, onBack, onChanged }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [replyStatus, setReplyStatus] = useState('')
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')

  const load = useCallback(() => api(`/api/admin/tickets/${id}`).then(d => {
    setData(d)
    setReplyStatus(d.ticket.status === 'open' ? 'in_progress' : d.ticket.status)
  }).catch(e => setError(e.message)), [id])
  useEffect(() => { load() }, [load])

  const run = async (fn, message) => {
    setBusy(true)
    setError('')
    try {
      const result = await fn()
      await load()
      onChanged()
      if (message) setFlash(typeof message === 'function' ? message(result) : message)
      setTimeout(() => setFlash(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const sendReply = e => {
    e.preventDefault()
    if (!reply.trim()) return
    run(async () => {
      const r = await api(`/api/admin/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify({ body: reply, status: replyStatus }) })
      setReply('')
      return r
    }, r => (r.emailed ? 'Reply sent — customer emailed.' : 'Reply saved. (Email not configured, so the customer sees it in their portal.)'))
  }

  const logTime = e => {
    e.preventDefault()
    run(async () => {
      await api(`/api/admin/tickets/${id}/time`, { method: 'POST', body: JSON.stringify({ minutes: Number(minutes), note }) })
      setMinutes('')
      setNote('')
    }, 'Time logged.')
  }

  if (!data) return <div className="rounded-2xl border border-ink-200 bg-white p-10 text-center text-ink-400">{error || 'Loading…'}</div>
  const { ticket, customer, usage, messages, time } = data
  const name = customer?.name || 'Customer'
  const total = time.reduce((s, t) => s + t.minutes, 0)

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="border-b border-ink-100 p-5">
          <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> All requests</button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-bold">{ticket.title}</h2>
            <div className="flex items-center gap-2">
              {ticket.priority === 'urgent' && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200"><AlertTriangle size={12} /> Urgent</span>}
              <StatusBadge status={ticket.status} admin />
            </div>
          </div>
          <p className="mt-1 text-sm text-ink-500">From {name}{customer?.company ? ` · ${customer.company}` : ''} · {formatDateTime(ticket.created_at)}</p>
        </div>

        <div className="space-y-4 bg-ink-50 p-5">
          <Bubble author="customer" body={ticket.body} at={ticket.created_at} name={name} />
          {ticket.link && (
            <a href={ticket.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700"><Link2 size={14} /> {ticket.link}</a>
          )}
          {messages.map(m => <Bubble key={m.id} author={m.author} body={m.body} at={m.created_at} name={name} />)}
        </div>

        <form onSubmit={sendReply} className="space-y-3 border-t border-ink-100 p-5">
          <label htmlFor="admin-reply" className="label">Reply to {name.split(' ')[0]}</label>
          <textarea id="admin-reply" rows={4} className="input resize-y" value={reply} onChange={e => setReply(e.target.value)} placeholder="Write your reply…" />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2 text-sm text-ink-600">
              Then mark as
              <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-sm">
                {Object.entries(ADMIN_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <button type="submit" disabled={busy || !reply.trim()} className="btn-primary py-2.5"><Send size={16} /> Send reply</button>
          </div>
        </form>
      </div>

      <aside className="space-y-5">
        {(flash || error) && (
          <p className={`rounded-xl p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`} role="status">{error || flash}</p>
        )}

        <section className="rounded-2xl border border-ink-200 bg-white p-5">
          <h3 className="text-sm font-bold">Status</h3>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {Object.entries(ADMIN_STATUS_LABEL).map(([k, v]) => (
              <button
                key={k}
                type="button"
                disabled={busy}
                onClick={() => run(() => api(`/api/admin/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status: k }) }))}
                className={`rounded-lg px-2.5 py-2 text-xs font-medium ring-1 transition ${ticket.status === k ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-ink-700 ring-ink-200 hover:ring-ink-300'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => api(`/api/admin/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ priority: ticket.priority === 'urgent' ? 'normal' : 'urgent' }) }))}
            className="mt-3 text-xs font-medium text-ink-500 hover:text-ink-900"
          >
            {ticket.priority === 'urgent' ? 'Mark as normal priority' : 'Mark as urgent'}
          </button>
        </section>

        <section className="rounded-2xl border border-ink-200 bg-white p-5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold"><Clock size={15} /> Time on this request</h3>
          <p className="mt-1 text-2xl font-extrabold tabular-nums">{formatMinutes(total)}</p>
          <form onSubmit={logTime} className="mt-3 space-y-2">
            <div className="flex gap-2">
              <input type="number" min={1} max={1440} required value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="Minutes" className="w-24 rounded-lg border border-ink-200 px-3 py-2 text-sm" aria-label="Minutes spent" />
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="What you did (optional)" maxLength={300} className="min-w-0 flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm" aria-label="Note" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[15, 30, 60].map(m => (
                <button key={m} type="button" onClick={() => setMinutes(String(m))} className="rounded-md bg-ink-100 px-2 py-1 text-xs font-medium text-ink-700 hover:bg-ink-200">{formatMinutes(m)}</button>
              ))}
              <button type="submit" disabled={busy || !minutes} className="ml-auto rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Log time</button>
            </div>
          </form>
          {time.length > 0 && (
            <ul className="mt-4 divide-y divide-ink-100 text-sm">
              {time.map(t => (
                <li key={t.id} className="flex items-start justify-between gap-2 py-2">
                  <span>
                    <span className="font-medium text-ink-900">{formatMinutes(t.minutes)}</span>
                    <span className="text-ink-500"> · {timeAgo(t.created_at)}</span>
                    {t.note && <span className="block text-ink-600">{t.note}</span>}
                  </span>
                  <button type="button" onClick={() => window.confirm('Remove this time entry?') && run(() => api(`/api/admin/time/${t.id}`, { method: 'DELETE' }))} className="rounded p-1 text-ink-400 hover:text-red-600" aria-label="Remove time entry"><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {customer && usage && (
          <section className="rounded-2xl border border-ink-200 bg-white p-5">
            <h3 className="text-sm font-bold">{customer.company || customer.name}</h3>
            <p className="text-xs text-ink-500">{usage.month} support hours</p>
            <div className="mt-3"><UsageBar usage={usage} compact /></div>
            <div className="mt-4 space-y-1.5 text-sm">
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-700"><Mail size={14} /> {customer.email}</a>
              {customer.phone && <a href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-700"><Phone size={14} /> {customer.phone}</a>}
            </div>
          </section>
        )}
      </aside>
    </div>
  )
}

export default function Requests({ onCountChange }) {
  const [tickets, setTickets] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('active')
  const [openId, setOpenId] = useState(() => {
    const m = window.location.hash.match(/^#requests-(\d+)$/)
    return m ? Number(m[1]) : null
  })

  const load = useCallback(() => api('/api/admin/tickets').then(d => {
    setTickets(d.tickets)
    onCountChange?.(d.tickets.filter(t => t.status === 'open' || (t.status !== 'done' && t.last_reply_by === 'customer')).length)
  }).catch(e => setError(e.message)), [onCountChange])
  useEffect(() => { load() }, [load])
  useEffect(() => { window.history.replaceState(null, '', openId ? `#requests-${openId}` : '#requests') }, [openId])

  const counts = useMemo(() => {
    const c = { all: tickets?.length || 0, active: 0 }
    for (const t of tickets || []) {
      c[t.status] = (c[t.status] || 0) + 1
      if (t.status !== 'done') c.active++
    }
    return c
  }, [tickets])

  const visible = (tickets || []).filter(t => filter === 'all' || (filter === 'active' ? t.status !== 'done' : t.status === filter))

  if (openId) return <Detail id={openId} onBack={() => setOpenId(null)} onChanged={load} />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {FILTERS.map(f => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${filter === f.key ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-ink-900'}`}>
              {f.label} <span className="opacity-60">{counts[f.key] || 0}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={load} className="rounded-lg p-2 text-ink-500 hover:bg-white hover:text-ink-900" aria-label="Refresh"><RefreshCw size={16} /></button>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!tickets && !error && <p className="py-20 text-center text-ink-400">Loading…</p>}

      {tickets && (visible.length ? (
        <ul className="space-y-2.5">
          {visible.map(t => {
            const needsYou = t.status === 'open' || (t.status !== 'done' && t.last_reply_by === 'customer')
            return (
              <li key={t.id}>
                <button type="button" onClick={() => setOpenId(t.id)} className="flex w-full items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 text-left transition hover:border-ink-300">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${needsYou ? 'bg-brand-600' : 'bg-transparent'}`} aria-label={needsYou ? 'Needs your reply' : undefined} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{t.title}</p>
                    <p className="truncate text-sm text-ink-500">{t.customer ? (t.customer.company || t.customer.name) : 'Deleted customer'} · updated {timeAgo(t.updated_at || t.created_at)}</p>
                  </div>
                  {t.priority === 'urgent' && <span className="hidden items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200 sm:inline-flex"><AlertTriangle size={12} /> Urgent</span>}
                  <StatusBadge status={t.status} admin />
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <p className="font-medium text-ink-700">{tickets.length ? 'Nothing here' : 'No requests yet'}</p>
          <p className="mt-1 text-sm text-ink-500">{tickets.length ? 'Try another filter.' : 'When clients send requests from their portal, they’ll appear here.'}</p>
        </div>
      ))}
    </div>
  )
}
