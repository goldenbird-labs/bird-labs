import { useCallback, useEffect, useState } from 'react'
import { LogOut, LayoutDashboard, Users, ExternalLink, Lock, Inbox, Building2 } from 'lucide-react'
import { BirdMark } from '../components/Logo'
import { api } from './api'
import Dashboard from './Dashboard'
import Leads from './Leads'
import Requests from './Requests'
import Customers from './Customers'

function Login({ onSuccess, configured }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
        <div className="flex items-center gap-2">
          <BirdMark size={34} />
          <span className="font-display text-lg font-extrabold">Bird Labs Admin</span>
        </div>
        {!configured ? (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Admin isn't set up yet. Add an <code className="font-mono">ADMIN_PASSWORD</code> environment variable on the server, then reload this page.
          </p>
        ) : (
          <>
            <label htmlFor="pw" className="label mt-6">Password</label>
            <input id="pw" type="password" autoFocus autoComplete="current-password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
              <Lock size={16} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'requests', label: 'Requests', icon: Inbox },
  { key: 'customers', label: 'Customers', icon: Building2 },
]

const TITLES = { overview: 'Overview', leads: 'Leads', requests: 'Client requests', customers: 'Customers' }

function tabFromHash() {
  const h = window.location.hash.replace('#', '')
  return TABS.find(t => h === t.key || h.startsWith(t.key + '-'))?.key || 'overview'
}

export default function AdminApp() {
  const [auth, setAuth] = useState(null)
  const [tab, setTab] = useState(tabFromHash)
  const [needsReply, setNeedsReply] = useState(0)

  const check = () => api('/api/admin/me').then(setAuth).catch(() => setAuth({ authenticated: false, configured: true }))
  useEffect(() => { check() }, [])
  useEffect(() => {
    const h = window.location.hash.replace('#', '')
    if (!(h === tab || h.startsWith(tab + '-'))) window.history.replaceState(null, '', tab === 'overview' ? '#' : `#${tab}`)
  }, [tab])
  const loadBadge = useCallback(() => {
    api('/api/admin/tickets').then(d => setNeedsReply(d.tickets.filter(t => t.status === 'open' || (t.status !== 'done' && t.last_reply_by === 'customer')).length)).catch(() => {})
  }, [])
  useEffect(() => { if (auth?.authenticated) loadBadge() }, [auth, loadBadge])

  if (!auth) return <div className="min-h-dvh bg-ink-50" />
  if (!auth.authenticated) return <Login configured={auth.configured} onSuccess={check} />

  const logout = async () => {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setAuth({ authenticated: false, configured: true })
  }

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <BirdMark size={28} />
            <span className="hidden font-display font-extrabold sm:inline">Bird Labs</span>
          </div>
          <nav className="flex gap-1" aria-label="Admin sections">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-current={tab === key ? 'page' : undefined}
                aria-label={label}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === key ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:text-ink-900'}`}
              >
                <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
                {key === 'requests' && needsReply > 0 && <span className="rounded-full bg-brand-700 px-1.5 text-[11px] font-semibold leading-5 text-white">{needsReply}</span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener" className="hidden items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-ink-600 hover:text-ink-900 sm:inline-flex">
              View site <ExternalLink size={14} />
            </a>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-600 hover:text-ink-900">
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-6 text-2xl font-extrabold">{TITLES[tab]}</h1>
        {tab === 'overview' && <Dashboard onOpenLeads={() => setTab('leads')} />}
        {tab === 'leads' && <Leads />}
        {tab === 'requests' && <Requests onCountChange={setNeedsReply} />}
        {tab === 'customers' && <Customers />}
      </main>
    </div>
  )
}
