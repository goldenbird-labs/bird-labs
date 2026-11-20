import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Plus, LogOut, KeyRound, Lock, Send, Link2, Clock, AlertTriangle, CheckCircle2, MessageCircle, ExternalLink } from 'lucide-react'
import Logo from '../components/Logo'
import { api, formatDateTime, timeAgo } from '../admin/api'
import { formatMinutes, PLAN_LABEL } from '../lib/support'
import { StatusBadge, UsageBar } from '../components/SupportUI'
import { EMAIL, WHATSAPP_URL } from '../lib/site'

// ── Sign in ──────────────────────────────────────────────────────────────────
function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/portal/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-brand-50/70 to-white px-4 py-10">
      <a href="/" className="mb-8"><Logo /></a>
      <form onSubmit={submit} className="card w-full max-w-sm p-7 sm:p-8">
        <h1 className="text-2xl font-extrabold">Client portal</h1>
        <p className="mt-1.5 text-ink-600">Sign in to send us a request and see your support hours.</p>
        <label htmlFor="email" className="label mt-6">Email</label>
        <input id="email" type="email" required autoComplete="username" autoFocus className="input" value={email} onChange={e => setEmail(e.target.value)} />
        <label htmlFor="password" className="label mt-4">Password</label>
        <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full"><Lock size={16} /> {busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-6 max-w-sm text-center text-sm text-ink-500">
        Not a client yet, or lost your password? Email <a className="font-medium text-brand-700" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    </div>
  )
}

// ── New request ──────────────────────────────────────────────────────────────
function NewRequest({ onCancel, onCreated }) {
  const [form, setForm] = useState({ title: '', body: '', link: '', priority: 'normal' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { id } = await api('/api/portal/tickets', { method: 'POST', body: JSON.stringify(form) })
      onCreated(id)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
      <div>
        <button type="button" onClick={onCancel} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> Back</button>
        <h2 className="text-xl font-bold">New request</h2>
        <p className="mt-1 text-ink-600">Tell us what you need — the more detail, the faster we can help.</p>
      </div>
      <div>
        <label className="label" htmlFor="t-title">What do you need? *</label>
        <input id="t-title" name="title" required maxLength={200} className="input" placeholder="e.g. Update our holiday opening hours" value={form.title} onChange={set} />
      </div>
      <div>
        <label className="label" htmlFor="t-body">Details *</label>
        <textarea id="t-body" name="body" required rows={6} maxLength={10000} className="input resize-y" placeholder="What should change, where on the site, any text or images we should use…" value={form.body} onChange={set} />
      </div>
      <div>
        <label className="label" htmlFor="t-link">Link to the page <span className="font-normal text-ink-400">(optional)</span></label>
        <input id="t-link" name="link" maxLength={500} className="input" placeholder="https://…" value={form.link} onChange={set} />
      </div>
      <fieldset>
        <legend className="label">How urgent is it?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { v: 'normal', t: 'Normal', d: 'We’ll get to it within our usual turnaround.' },
            { v: 'urgent', t: 'Urgent', d: 'Something is broken or stopping customers.' },
          ].map(o => (
            <label key={o.v} className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${form.priority === o.v ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-ink-300'}`}>
              <input type="radio" name="priority" value={o.v} checked={form.priority === o.v} onChange={set} className="mt-1 h-4 w-4 accent-brand-700" />
              <span>
                <span className="block font-semibold text-ink-900">{o.t}</span>
                <span className="block text-sm text-ink-500">{o.d}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={busy} className="btn-primary"><Send size={16} /> {busy ? 'Sending…' : 'Send request'}</button>
      </div>
    </form>
  )
}

// ── Request detail ───────────────────────────────────────────────────────────
function Message({ author, body, at, customerName }) {
  const mine = author === 'customer'
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${mine ? 'rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-ink-100 text-ink-900'}`}>
        <p className={`mb-1 text-xs font-semibold ${mine ? 'text-brand-100' : 'text-ink-500'}`}>{mine ? customerName || 'You' : 'Bird Labs'} · {timeAgo(at)}</p>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function RequestDetail({ id, onBack, onChanged, me }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => api(`/api/portal/tickets/${id}`).then(setData).catch(e => setError(e.message)), [id])
  useEffect(() => { load() }, [load])

  const send = async e => {
    e.preventDefault()
    if (!reply.trim()) return
    setBusy(true)
    try {
      await api(`/api/portal/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify({ body: reply }) })
      setReply('')
      await load()
      onChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (error) return <div className="card p-6 text-red-700">{error}</div>
  if (!data) return <div className="card p-10 text-center text-ink-400">Loading…</div>
  const { ticket, messages, minutesLogged } = data

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-100 p-6">
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> All requests</button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-bold">{ticket.title}</h2>
          <div className="flex items-center gap-2">
            {ticket.priority === 'urgent' && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200"><AlertTriangle size={12} /> Urgent</span>}
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <p className="mt-1 text-sm text-ink-500">
          Sent {formatDateTime(ticket.created_at)}{minutesLogged ? ` · ${formatMinutes(minutesLogged)} of support used` : ''}
        </p>
        {ticket.status === 'waiting' && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">We need something from you to continue — please reply below.</p>
        )}
      </div>

      <div className="space-y-4 bg-ink-50/50 p-6">
        <Message author="customer" body={ticket.body} at={ticket.created_at} customerName={me.name} />
        {ticket.link && (
          <p className="flex justify-end">
            <a href={ticket.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900"><Link2 size={14} /> {ticket.link}</a>
          </p>
        )}
        {messages.map(m => <Message key={m.id} author={m.author} body={m.body} at={m.created_at} customerName={me.name} />)}
        {!messages.length && <p className="text-center text-sm text-ink-400">We’ve received your request and will reply here.</p>}
      </div>

      <form onSubmit={send} className="border-t border-ink-100 p-4 sm:p-6">
        <label htmlFor="reply" className="sr-only">Your reply</label>
        <textarea id="reply" rows={3} className="input resize-y" placeholder={ticket.status === 'done' ? 'Need something else on this? Reply to reopen it.' : 'Write a reply…'} value={reply} onChange={e => setReply(e.target.value)} maxLength={10000} />
        <div className="mt-3 flex justify-end">
          <button type="submit" disabled={busy || !reply.trim()} className="btn-primary"><Send size={16} /> {busy ? 'Sending…' : 'Send reply'}</button>
        </div>
      </form>
    </div>
  )
}

// ── Change password ──────────────────────────────────────────────────────────
function ChangePassword({ onDone }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    try {
      await api('/api/portal/password', { method: 'POST', body: JSON.stringify({ current, next }) })
      setOk(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={submit} className="card max-w-md space-y-4 p-6 sm:p-8">
      <button type="button" onClick={onDone} className="inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> Back</button>
      <h2 className="text-xl font-bold">Change password</h2>
      {ok ? (
        <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-green-800"><CheckCircle2 size={18} /> Password updated.</p>
      ) : (
        <>
          <div>
            <label className="label" htmlFor="cur">Current password</label>
            <input id="cur" type="password" autoComplete="current-password" required className="input" value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="new">New password</label>
            <input id="new" type="password" autoComplete="new-password" minLength={8} required className="input" value={next} onChange={e => setNext(e.target.value)} />
            <p className="mt-1 text-xs text-ink-500">At least 8 characters.</p>
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full"><KeyRound size={16} /> Update password</button>
        </>
      )}
    </form>
  )
}

// ── Portal shell ─────────────────────────────────────────────────────────────
function readView() {
  const h = window.location.hash
  if (h.startsWith('#request-')) return { name: 'request', id: Number(h.slice(9)) }
  if (h === '#new') return { name: 'new' }
  if (h === '#password') return { name: 'password' }
  return { name: 'list' }
}

export default function PortalApp() {
  const [me, setMe] = useState(undefined)
  const [tickets, setTickets] = useState(null)
  const [view, setView] = useState(readView)

  const loadMe = useCallback(() => api('/api/portal/me').then(setMe).catch(() => setMe(null)), [])
  const loadTickets = useCallback(() => api('/api/portal/tickets').then(d => setTickets(d.tickets)).catch(() => {}), [])

  useEffect(() => { loadMe() }, [loadMe])
  useEffect(() => { if (me) loadTickets() }, [me, loadTickets])
  useEffect(() => {
    const onHash = () => setView(readView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = hash => { window.location.hash = hash; window.scrollTo(0, 0) }

  if (me === undefined) return <div className="min-h-dvh bg-ink-50" />
  if (!me) return <Login onSuccess={loadMe} />

  const { customer, usage } = me
  const logout = async () => {
    await api('/api/portal/logout', { method: 'POST' }).catch(() => {})
    window.location.hash = ''
    setMe(null)
  }
  const openCount = tickets?.filter(t => t.status !== 'done').length || 0

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#" onClick={e => { e.preventDefault(); go('') }} className="flex items-center gap-3">
            <Logo />
            <span className="hidden border-l border-ink-200 pl-3 text-sm font-medium text-ink-500 sm:inline">Client portal</span>
          </a>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => go('password')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-600 hover:text-ink-900"><KeyRound size={15} /> <span className="hidden sm:inline">Password</span></button>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-600 hover:text-ink-900"><LogOut size={15} /> <span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {view.name === 'list' && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold sm:text-3xl">Hi {customer.name.split(' ')[0]} 👋</h1>
                <p className="mt-1 text-ink-600">{customer.company ? `${customer.company} · ` : ''}{PLAN_LABEL[customer.plan] || 'Monthly'} plan</p>
              </div>
              <button type="button" onClick={() => go('new')} className="btn-primary"><Plus size={18} /> New request</button>
            </div>

            <section className="card p-6">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-brand-700" />
                <h2 className="text-base font-bold">Support hours — {usage.month}</h2>
              </div>
              <div className="mt-4"><UsageBar usage={usage} /></div>
              <p className="mt-3 text-sm text-ink-500">Your plan includes {formatMinutes(usage.minutesIncluded)} of support each month for changes, updates and help. Hours reset on the 1st.</p>
            </section>

            <section>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-bold">Your requests</h2>
                {tickets && <span className="text-sm text-ink-500">{openCount} open</span>}
              </div>
              {!tickets ? (
                <div className="card p-10 text-center text-ink-400">Loading…</div>
              ) : tickets.length ? (
                <ul className="space-y-2.5">
                  {tickets.map(t => (
                    <li key={t.id}>
                      <button type="button" onClick={() => go(`request-${t.id}`)} className="card flex w-full items-center gap-4 p-4 text-left transition hover:border-ink-300 sm:p-5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink-900">{t.title}</p>
                          <p className="mt-0.5 text-sm text-ink-500">
                            Updated {timeAgo(t.updated_at || t.created_at)}
                            {t.last_reply_by === 'admin' && t.status !== 'done' && <span className="ml-2 font-medium text-brand-700">· New reply</span>}
                          </p>
                        </div>
                        {t.priority === 'urgent' && <span className="hidden rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200 sm:inline">Urgent</span>}
                        <StatusBadge status={t.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="card flex flex-col items-center p-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700"><MessageCircle size={22} /></span>
                  <p className="mt-4 font-semibold text-ink-900">No requests yet</p>
                  <p className="mt-1 max-w-sm text-sm text-ink-500">Need a change to your website, chatbot or automations? Send us a request and we’ll take it from there.</p>
                  <button type="button" onClick={() => go('new')} className="btn-primary mt-5"><Plus size={18} /> New request</button>
                </div>
              )}
            </section>

            <p className="text-center text-sm text-ink-500">
              Something urgent? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-700">WhatsApp us <ExternalLink size={13} /></a>
            </p>
          </>
        )}

        {view.name === 'new' && <NewRequest onCancel={() => go('')} onCreated={id => { loadTickets(); go(`request-${id}`) }} />}
        {view.name === 'request' && <RequestDetail id={view.id} me={customer} onBack={() => go('')} onChanged={loadTickets} />}
        {view.name === 'password' && <ChangePassword onDone={() => go('')} />}
      </main>
    </div>
  )
}
