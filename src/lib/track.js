// Cookie-free analytics beacon. A random visitor id lives in localStorage and a session id
// in sessionStorage; nothing personal is collected.

function randomId() {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  } catch {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  }
}

function storedId(storage, key) {
  try {
    let id = storage.getItem(key)
    if (!id) {
      id = randomId()
      storage.setItem(key, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}

const utm = (() => {
  try {
    const p = new URLSearchParams(window.location.search)
    return { source: p.get('utm_source'), medium: p.get('utm_medium'), campaign: p.get('utm_campaign') }
  } catch {
    return {}
  }
})()

export function track(type) {
  let tz = ''
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { /* ignore */ }
  const body = JSON.stringify({
    type,
    path: window.location.pathname,
    referrer: document.referrer,
    vid: storedId(localStorage, 'bl_vid'),
    sid: storedId(sessionStorage, 'bl_sid'),
    tz,
    utm,
  })
  try {
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return
  } catch { /* fall through */ }
  fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
}

// Records clicks on booking, WhatsApp, email and phone links anywhere on the page.
export function trackOutboundClicks(root = document) {
  root.addEventListener('click', e => {
    const a = e.target.closest?.('a[href]')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.includes('calendly.com')) track('calendly_click')
    else if (href.includes('wa.me') || href.includes('whatsapp')) track('whatsapp_click')
    else if (href.startsWith('mailto:')) track('email_click')
    else if (href.startsWith('tel:')) track('phone_click')
  }, { capture: true })
}
