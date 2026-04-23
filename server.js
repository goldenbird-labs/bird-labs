import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Google Sheets setup (optional)
let sheets = null
const SHEET_ID = process.env.GOOGLE_SHEET_ID
try {
  if (process.env.GOOGLE_CREDENTIALS_PATH) {
    const credentials = JSON.parse(readFileSync(process.env.GOOGLE_CREDENTIALS_PATH, 'utf8'))
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
    sheets = google.sheets({ version: 'v4', auth })
  }
} catch (e) {
  console.warn('Google Sheets not configured:', e.message)
}

async function appendToSheet(row) {
  if (!sheets || !SHEET_ID) return
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })
}

async function sendPushover(lead) {
  const message = `New Lead from Bird Labs!\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'N/A'}\nCompany: ${lead.company || 'N/A'}\nLocation: ${lead.city || ''}, ${lead.country || 'Unknown'}\nMessage: ${lead.message}`
  await axios.post('https://api.pushover.net/1/messages.json', {
    token: process.env.PUSHOVER_APP_TOKEN,
    user: process.env.PUSHOVER_USER_KEY,
    title: 'New Lead - Bird Labs',
    message,
    priority: 1,
  })
}

async function getLocationFromIP(ip) {
  try {
    // Skip for localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Local', region: 'Local' }
    }
    const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=country,city,regionName`, { timeout: 3000 })
    return { country: data.country || '', city: data.city || '', region: data.regionName || '' }
  } catch {
    return { country: '', city: '', region: '' }
  }
}

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' })
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || ''
    const { country, city, region } = await getLocationFromIP(ip.trim())

    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC'
    const row = [timestamp, name, email, phone || '', company || '', message, ip, country, city, region]

    const lead = { name, email, phone, company, message, country, city, region }

    await appendToSheet(row)
    await sendPushover(lead)

    res.json({ success: true })
  } catch (err) {
    console.error('Lead capture error:', err.message)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// Serve frontend in production
const distPath = path.join(__dirname, 'dist')
import { existsSync } from 'fs'
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('/{*path}', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => console.log(`Bird Labs server running at http://localhost:${PORT}`))
