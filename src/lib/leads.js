import { track } from './track'

export async function submitLead(payload) {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  track(payload.source === 'review' ? 'review_submit' : 'form_submit')
  return data
}
