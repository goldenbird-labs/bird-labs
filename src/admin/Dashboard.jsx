import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, RefreshCw, MessageCircle, Calendar, Mail, Phone, FileText, Search, MousePointerClick } from 'lucide-react'
import { api, SOURCE_LABELS, timeAgo } from './api'
import { AreaChart, BarChart, BarList } from './charts'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '12 months' },
]

function Delta({ now, before, percent }) {
  if (!before && !now) return <span className="text-ink-400">No data in previous period</span>
  if (!before) return <span className="text-ink-500">New this period</span>
  const change = percent ? (now - before) * 100 : ((now - before) / before) * 100
  const rounded = Math.round(change * 10) / 10
  if (Math.abs(rounded) < 0.5) return <span className="inline-flex items-center gap-1 text-ink-500"><Minus size={14} /> Same as before</span>
  const up = rounded > 0
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${up ? 'text-green-700' : 'text-red-700'}`}>
      {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
      {up ? '+' : ''}{rounded}{percent ? ' pts' : '%'} <span className="font-normal text-ink-500">vs previous</span>
    </span>
  )
}

function StatTile({ label, value, display, before, percent, hint }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-ink-900">{display ?? value.toLocaleString()}</p>
      <p className="mt-2 text-xs">
        <Delta now={value} before={before} percent={percent} />
      </p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}

function Panel({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-ink-200 bg-white p-5 ${className}`}>
      <h2 className="text-base font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

const ACTIONS = [
  { key: 'chat_open', label: 'Opened the chat', icon: MessageCircle },
  { key: 'chat_message', label: 'Chat messages sent', icon: MessageCircle },
  { key: 'calendly_click', label: 'Clicked “Book a call”', icon: Calendar },
  { key: 'whatsapp_click', label: 'Clicked WhatsApp', icon: MessageCircle },
  { key: 'email_click', label: 'Clicked email', icon: Mail },
  { key: 'phone_click', label: 'Clicked phone', icon: Phone },
  { key: 'form_start', label: 'Started the contact form', icon: FileText },
  { key: 'form_submit', label: 'Sent the contact form', icon: FileText },
  { key: 'review_submit', label: 'Requested a free review', icon: Search },
]

export default function Dashboard({ onOpenLeads }) {
  const [days, setDays] = useState(() => {
    try { return Number(localStorage.getItem('bl_admin_days')) || 30 } catch { return 30 }
  })
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setStats(await api(`/api/admin/stats?days=${days}`))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { load() }, [load])
  useEffect(() => { try { localStorage.setItem('bl_admin_days', String(days)) } catch { /* ignore */ } }, [days])

  const t = stats?.totals
  const p = stats?.previous

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1" role="group" aria-label="Date range">
          {RANGES.map(r => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              aria-pressed={days === r.days}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${days === r.days ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-white hover:text-ink-900">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {!stats && loading && <p className="py-20 text-center text-ink-400">Loading…</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile label="Visitors" value={t.visitors} before={p.visitors} hint="Unique people" />
            <StatTile label="Page views" value={t.pageviews} before={p.pageviews} />
            <StatTile label="Leads" value={t.leads} before={p.leads} hint="Form, chatbot & review requests" />
            <StatTile label="Visitor → lead" value={t.conversion} display={`${(t.conversion * 100).toFixed(1)}%`} before={p.conversion} percent />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Visitors per day" className="lg:col-span-2">
              <AreaChart data={stats.daily} valueKey="visitors" label="Visitors" />
            </Panel>
            <Panel title="Funnel" subtitle="Unique visitors at each step">
              <ol className="space-y-4">
                {stats.funnel.map((step, i) => {
                  const top = stats.funnel[0].value || 1
                  const prev = i ? stats.funnel[i - 1].value : null
                  return (
                    <li key={step.label}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="text-ink-700">{step.label}</span>
                        <span className="font-semibold tabular-nums text-ink-900">{step.value.toLocaleString()}</span>
                      </div>
                      <div className="mt-1.5 h-2.5 rounded-full bg-ink-100">
                        <div className="h-2.5 rounded-full bg-brand-700" style={{ width: `${Math.max(step.value ? 2 : 0, (step.value / top) * 100)}%` }} />
                      </div>
                      {prev != null && (
                        <p className="mt-1 text-xs text-ink-500">{prev ? `${Math.round((step.value / prev) * 100)}% of previous step` : '—'}</p>
                      )}
                    </li>
                  )
                })}
              </ol>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Leads per day" className="lg:col-span-2">
              <BarChart data={stats.daily} valueKey="leads" label="Leads" />
            </Panel>
            <Panel title="Where leads came from">
              <BarList items={Object.entries(stats.leadSources).filter(([, v]) => v > 0).map(([k, v]) => ({ label: SOURCE_LABELS[k] || k, value: v }))} emptyText="No leads in this period yet" />
            </Panel>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Panel title="Traffic sources" subtitle="Visits by referring website">
              <BarList items={stats.sources} />
            </Panel>
            <Panel title="Visitor locations" subtitle="From the visitor's time zone">
              <BarList items={stats.locations} />
            </Panel>
            <Panel title="Devices">
              <BarList items={stats.devices} />
            </Panel>
            <Panel title="What visitors did" subtitle="Clicks and actions on the site" className="md:col-span-2 lg:col-span-1">
              <ul className="divide-y divide-ink-100">
                {ACTIONS.map(({ key, label, icon: Icon }) => (
                  <li key={key} className="flex items-center justify-between py-2 text-sm">
                    <span className="flex items-center gap-2 text-ink-700"><Icon size={15} className="text-ink-400" /> {label}</span>
                    <span className="font-semibold tabular-nums text-ink-900">{(stats.actions[key] || 0).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Campaigns" subtitle="Visits from links tagged with utm_source">
              <BarList items={stats.campaigns} emptyText="No tagged links yet — add ?utm_source=instagram to links you share" />
            </Panel>
            <Panel title="Latest leads">
              {stats.recentLeads.length ? (
                <ul className="divide-y divide-ink-100">
                  {stats.recentLeads.map(l => (
                    <li key={l.id} className="py-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-medium text-ink-900">{l.name || l.email}</span>
                        <span className="shrink-0 text-xs text-ink-400">{timeAgo(l.created_at)}</span>
                      </div>
                      <p className="truncate text-xs text-ink-500">{SOURCE_LABELS[l.source] || l.source}{l.service ? ` · ${l.service}` : ''}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-ink-400">No leads in this period yet</p>
              )}
              <button type="button" onClick={onOpenLeads} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">
                <MousePointerClick size={15} /> See all leads
              </button>
            </Panel>
          </div>
          <p className="text-center text-xs text-ink-400">Days are counted in {stats.timeZone} time. Your own visits are not counted while you're signed in here.</p>
        </>
      )}
    </div>
  )
}
