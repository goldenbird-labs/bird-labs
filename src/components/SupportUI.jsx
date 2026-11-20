import { STATUS, ADMIN_STATUS_LABEL, formatMinutes } from '../lib/support'

export function StatusBadge({ status, admin = false }) {
  const s = STATUS[status] || STATUS.open
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.className}`}>
      {admin ? ADMIN_STATUS_LABEL[status] || s.label : s.label}
    </span>
  )
}

export function UsageBar({ usage, compact = false }) {
  const { minutesUsed, minutesIncluded } = usage
  const pct = minutesIncluded ? Math.min(100, (minutesUsed / minutesIncluded) * 100) : 0
  const over = minutesUsed > minutesIncluded
  const left = minutesIncluded - minutesUsed
  return (
    <div>
      <div className={`flex items-baseline justify-between gap-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        <span className="text-ink-700">
          <span className="font-semibold text-ink-900">{formatMinutes(minutesUsed)}</span> of {formatMinutes(minutesIncluded)} used
        </span>
        <span className={over ? 'font-medium text-amber-800' : 'text-ink-500'}>
          {over ? `${formatMinutes(-left)} over` : `${formatMinutes(left)} left`}
        </span>
      </div>
      <div className={`mt-1.5 rounded-full bg-ink-100 ${compact ? 'h-1.5' : 'h-2.5'}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Support hours used this month">
        <div className={`rounded-full ${compact ? 'h-1.5' : 'h-2.5'} ${over ? 'bg-amber-500' : 'bg-brand-700'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
