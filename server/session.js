// Cookie, signing and password helpers shared by the admin panel and the client portal.
import crypto from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(crypto.scrypt)

export function sign(secret, value) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

export function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export function setCookie(req, res, name, value, maxAgeSeconds) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAgeSeconds}`]
  if (req.secure) parts.push('Secure')
  res.append('Set-Cookie', parts.join('; '))
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url')
  const hash = await scrypt(password, salt, 64)
  return `scrypt$${salt}$${hash.toString('base64url')}`
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const actual = await scrypt(String(password), salt, 64)
  return safeEqual(actual.toString('base64url'), hash)
}

// Easy-to-read random password, e.g. "Kp7m-x4Rq-92tw"
export function generatePassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(12)
  const chars = [...bytes].map(b => alphabet[b % alphabet.length]).join('')
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`
}

const fallbackSecret = crypto.randomBytes(32).toString('hex')

// Secret for client-portal sessions. Set SESSION_SECRET in production so customers stay
// signed in across restarts.
export function portalSecret() {
  const base = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || fallbackSecret
  return crypto.createHash('sha256').update(`bird-labs-portal:${base}`).digest('hex')
}
