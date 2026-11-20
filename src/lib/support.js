// Labels and styles for support requests, shared by the client portal and the admin panel.

export const STATUS = {
  open: { label: 'New', className: 'bg-blue-50 text-blue-800 ring-blue-200' },
  in_progress: { label: 'In progress', className: 'bg-brand-50 text-brand-800 ring-brand-200' },
  waiting: { label: 'Waiting on you', className: 'bg-amber-50 text-amber-900 ring-amber-200' },
  done: { label: 'Done', className: 'bg-green-50 text-green-800 ring-green-200' },
}

// The admin sees "waiting" from their own point of view.
export const ADMIN_STATUS_LABEL = { open: 'New', in_progress: 'In progress', waiting: 'Waiting on customer', done: 'Done' }

export const PLAN_LABEL = { starter: 'Starter', growth: 'Growth', pro: 'Pro', custom: 'Custom' }

export function formatMinutes(min) {
  const m = Math.max(0, Math.round(min))
  const h = Math.floor(m / 60)
  const r = m % 60
  if (!h) return `${r} min`
  return r ? `${h} h ${r} min` : `${h} h`
}
