// Shared logic for customer accounts, support requests and monthly support hours.
import { store } from './store.js'

export const PLANS = {
  starter: { label: 'Starter', hours: 2 },
  growth: { label: 'Growth', hours: 3 },
  pro: { label: 'Pro', hours: 4 },
  custom: { label: 'Custom', hours: 2 },
}

export const STATUSES = {
  open: 'New',
  in_progress: 'In progress',
  waiting: 'Waiting on you',
  done: 'Done',
}

export const PRIORITIES = ['normal', 'urgent']

const tz = () => process.env.ANALYTICS_TZ || 'America/Toronto'

export function monthKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz(), year: 'numeric', month: '2-digit' }).formatToParts(new Date(date))
  return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}`
}

export function monthLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz(), month: 'long', year: 'numeric' }).format(new Date(date))
}

// Minutes of support logged for a customer in the current calendar month.
export async function minutesUsedThisMonth(customerId) {
  const since = new Date(Date.now() - 32 * 24 * 60 * 60 * 1000)
  const entries = await store.list('time_entries', { where: { customer_id: customerId }, since })
  const current = monthKey(new Date())
  return entries.filter(e => monthKey(e.created_at) === current).reduce((sum, e) => sum + (e.minutes || 0), 0)
}

export async function usageFor(customer) {
  const minutesUsed = await minutesUsedThisMonth(customer.id)
  return {
    month: monthLabel(),
    minutesUsed,
    minutesIncluded: Math.round((customer.support_hours ?? PLANS[customer.plan]?.hours ?? 0) * 60),
  }
}

// What a customer (or the admin list) is allowed to see about an account.
export function publicCustomer(c) {
  if (!c) return null
  const { password_hash: _ph, session_version: _sv, ...rest } = c
  return { ...rest, active: Boolean(c.active) }
}

export async function ticketThread(ticketId) {
  const messages = await store.list('ticket_messages', { where: { ticket_id: ticketId } })
  return messages.reverse()
}

export async function findCustomerByEmail(email) {
  const rows = await store.list('customers', { where: { email: String(email).trim().toLowerCase() }, limit: 1 })
  return rows[0] || null
}
