// Small shared helpers: rate limiting, input cleaning, user-agent parsing.

// In-memory fixed-window rate limiter keyed by client IP.
export function rateLimit({ windowMs, max, message = 'Too many requests. Please try again in a few minutes.' }) {
  const hits = new Map()
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) if (entry.reset < now) hits.delete(key)
  }, windowMs).unref()

  return (req, res, next) => {
    const now = Date.now()
    const key = req.ip || 'unknown'
    let entry = hits.get(key)
    if (!entry || entry.reset < now) {
      entry = { count: 0, reset: now + windowMs }
      hits.set(key, entry)
    }
    entry.count++
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)))
      return res.status(429).json({ error: message })
    }
    next()
  }
}

// Trim a value to a string of at most `max` characters ('' for non-strings).
export function clean(value, max = 500) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|go-http|java\//i

export function isBot(ua = '') {
  return !ua || BOT_RE.test(ua)
}

export function parseDevice(ua = '') {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'Tablet'
  if (/mobi|iphone|android/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

export function parseBrowser(ua = '') {
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/samsungbrowser/i.test(ua)) return 'Samsung'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Other'
}
