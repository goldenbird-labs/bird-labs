import { useCallback, useEffect, useState } from 'react'
import { Plus, Copy, Check, KeyRound, X, Pencil, RefreshCw } from 'lucide-react'
import { api, timeAgo } from './api'
import { PLAN_LABEL } from '../lib/support'
import { UsageBar } from '../components/SupportUI'

const PORTAL_URL = `${window.location.origin}/portal`

function credentialsText(customer, password) {
  return [
    `Hi ${customer.name.split(' ')[0]},`,
    '',
    'Here are your Bird Labs client portal details. Use the portal to send us requests and see your monthly support hours.',
    '',
    `Portal: ${PORTAL_URL}`,
    `Email: ${customer.email}`,
    `Password: ${password}`,
    '',
    'You can change your password after signing in.',
  ].join('\n')
}

function CopyBtn({ text, label }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text) } catch { /* clipboard blocked */ }
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }}
      className="btn-primary py-2.5"
    >
      {done ? <Check size={16} /> : <Copy size={16} />} {done ? 'Copied' : label}
    </button>
  )
}

function CredentialsCard({ customer, password, onClose }) {
  return (
    <div className="rounded-2xl border-2 border-brand-300 bg-brand-50/60 p-5" role="status">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">Login details for {customer.name}</h3>
          <p className="mt-0.5 text-sm text-ink-600">Copy these now — the password won’t be shown again.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded p-1 text-ink-500 hover:text-ink-900" aria-label="Close"><X size={18} /></button>
      </div>
      <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 font-sans text-sm text-ink-800 ring-1 ring-ink-200">{credentialsText(customer, password)}</pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyBtn text={credentialsText(customer, password)} label="Copy message for customer" />
        <a href={`mailto:${customer.email}?subject=${encodeURIComponent('Your Bird Labs client portal login')}&body=${encodeURIComponent(credentialsText(customer, password))}`} className="btn-secondary py-2.5">Open in email</a>
      </div>
    </div>
  )
}

function CustomerForm({ initial, plans, onSave, onCancel, busy }) {
  const [f, setF] = useState(() => ({
    name: '', company: '', email: '', phone: '', plan: 'growth', support_hours: plans.growth?.hours ?? 3, notes: '',
    ...initial,
  }))
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
  const onPlan = plan => setF(prev => ({ ...prev, plan, support_hours: plans[plan]?.hours ?? prev.support_hours }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-bold">{initial?.id ? `Edit ${initial.name}` : 'Add a customer'}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="cf-name">Name *</label><input id="cf-name" required className="input" value={f.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label className="label" htmlFor="cf-company">Business</label><input id="cf-company" className="input" value={f.company || ''} onChange={e => set('company', e.target.value)} /></div>
        <div><label className="label" htmlFor="cf-email">Login email *</label><input id="cf-email" type="email" required className="input" value={f.email} onChange={e => set('email', e.target.value)} /></div>
        <div><label className="label" htmlFor="cf-phone">Phone</label><input id="cf-phone" className="input" value={f.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
        <div>
          <label className="label" htmlFor="cf-plan">Plan</label>
          <select id="cf-plan" className="input" value={f.plan} onChange={e => onPlan(e.target.value)}>
            {Object.entries(plans).map(([k, p]) => <option key={k} value={k}>{p.label}{k !== 'custom' ? ` (${p.hours} h support)` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="cf-hours">Support hours per month</label>
          <input id="cf-hours" type="number" min={0} max={200} step={0.5} className="input" value={f.support_hours} onChange={e => set('support_hours', e.target.value)} />
        </div>
      </div>
      <div><label className="label" htmlFor="cf-notes">Private notes</label><textarea id="cf-notes" rows={2} className="input" value={f.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Only you can see these" /></div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-2.5">Cancel</button>
        <button type="submit" disabled={busy} className="btn-primary py-2.5">{initial?.id ? 'Save changes' : <><Plus size={16} /> Create login</>}</button>
      </div>
    </form>
  )
}

export default function Customers() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | customer
  const [creds, setCreds] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => api('/api/admin/customers').then(setData).catch(e => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  const save = async form => {
    setBusy(true)
    setError('')
    try {
      if (editing === 'new') {
        const r = await api('/api/admin/customers', { method: 'POST', body: JSON.stringify(form) })
        setCreds({ customer: r.customer, password: r.password })
      } else {
        await api(`/api/admin/customers/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) })
      }
      setEditing(null)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async c => {
    if (!window.confirm(`Create a new password for ${c.name}? Their current password will stop working.`)) return
    try {
      const r = await api(`/api/admin/customers/${c.id}/reset-password`, { method: 'POST' })
      setCreds({ customer: c, password: r.password })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e.message)
    }
  }

  const toggleActive = async c => {
    if (c.active && !window.confirm(`Turn off portal access for ${c.name}? They’ll be signed out immediately.`)) return
    try {
      await api(`/api/admin/customers/${c.id}`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) })
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-600">Clients sign in at <a href="/portal" target="_blank" rel="noopener" className="font-medium text-brand-700">{PORTAL_URL.replace(/^https?:\/\//, '')}</a></p>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="rounded-lg p-2 text-ink-500 hover:bg-white hover:text-ink-900" aria-label="Refresh"><RefreshCw size={16} /></button>
          {editing !== 'new' && <button type="button" onClick={() => { setEditing('new'); setCreds(null) }} className="btn-primary py-2.5"><Plus size={16} /> Add customer</button>}
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {creds && <CredentialsCard customer={creds.customer} password={creds.password} onClose={() => setCreds(null)} />}
      {editing && data && (
        <CustomerForm initial={editing === 'new' ? null : editing} plans={data.plans} busy={busy} onSave={save} onCancel={() => setEditing(null)} />
      )}

      {!data && !error && <p className="py-20 text-center text-ink-400">Loading…</p>}

      {data && (data.customers.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.customers.map(c => (
            <li key={c.id} className={`rounded-2xl border bg-white p-5 ${c.active ? 'border-ink-200' : 'border-dashed border-ink-300 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-900">{c.company || c.name}</p>
                  <p className="truncate text-sm text-ink-500">{c.company ? `${c.name} · ` : ''}{c.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">{PLAN_LABEL[c.plan] || c.plan}</span>
              </div>
              <div className="mt-4"><UsageBar usage={c.usage} compact /></div>
              <p className="mt-3 text-xs text-ink-500">
                {c.openTickets ? <span className="font-medium text-brand-700">{c.openTickets} open request{c.openTickets === 1 ? '' : 's'}</span> : 'No open requests'}
                {' · '}{c.last_login_at ? `last signed in ${timeAgo(c.last_login_at)}` : 'hasn’t signed in yet'}
                {!c.active && ' · access off'}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ink-100 pt-3">
                <button type="button" onClick={() => { setEditing(c); setCreds(null) }} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50"><Pencil size={14} /> Edit</button>
                <button type="button" onClick={() => resetPassword(c)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50"><KeyRound size={14} /> New password</button>
                <button type="button" onClick={() => toggleActive(c)} className={`ml-auto rounded-lg px-2.5 py-1.5 text-sm font-medium ${c.active ? 'text-red-700 hover:bg-red-50' : 'text-green-700 hover:bg-green-50'}`}>{c.active ? 'Turn off access' : 'Turn on access'}</button>
              </div>
            </li>
          ))}
        </ul>
      ) : !editing && (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <p className="font-medium text-ink-700">No customers yet</p>
          <p className="mt-1 text-sm text-ink-500">Add a customer to create their portal login.</p>
          <button type="button" onClick={() => setEditing('new')} className="btn-primary mt-5"><Plus size={16} /> Add customer</button>
        </div>
      ))}
    </div>
  )
}
