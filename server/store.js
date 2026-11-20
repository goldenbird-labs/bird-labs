// Persistent storage for leads and analytics events.
// Production (Hostinger): MySQL, configured with DB_HOST / DB_USER / DB_PASSWORD / DB_NAME.
// Local development: JSON-lines files in DATA_DIR (default ./data) when no database is configured.
import fs from 'fs'
import path from 'path'

const LEAD_FIELDS = ['source', 'name', 'email', 'phone', 'company', 'website', 'service', 'message', 'transcript', 'ip', 'country', 'city', 'region']
const EVENT_FIELDS = ['type', 'path', 'referrer', 'visitor_id', 'session_id', 'location', 'device', 'browser', 'utm_source', 'utm_medium', 'utm_campaign']

let backend = null

export async function initStore() {
  if (process.env.DB_HOST && process.env.DB_NAME) {
    backend = await mysqlBackend()
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.warn('WARNING: No database configured (DB_HOST/DB_NAME). Leads and analytics are stored in local files, which may be wiped on redeploy.')
    }
    backend = fileBackend()
  }
  console.log(`Storage: ${backend.name}`)
}

export const store = {
  insertLead: lead => backend.insertLead(pick(lead, LEAD_FIELDS)),
  listLeads: () => backend.listLeads(),
  deleteLead: id => backend.deleteLead(Number(id)),
  insertEvent: event => backend.insertEvent(pick(event, EVENT_FIELDS)),
  eventsSince: date => backend.eventsSince(date),
  leadsSince: date => backend.leadsSince(date),
}

function pick(obj, fields) {
  const out = {}
  for (const f of fields) out[f] = obj[f] == null || obj[f] === '' ? null : String(obj[f])
  return out
}

// ── MySQL ────────────────────────────────────────────────────────────────────
async function mysqlBackend() {
  const mysql = await import('mysql2/promise')
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    timezone: 'Z',
    charset: 'utf8mb4',
  })

  await pool.query(`CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(3) NOT NULL,
    source VARCHAR(16), name VARCHAR(200), email VARCHAR(254), phone VARCHAR(64),
    company VARCHAR(200), website VARCHAR(300), service VARCHAR(100), message TEXT, transcript MEDIUMTEXT,
    ip VARCHAR(64), country VARCHAR(100), city VARCHAR(100), region VARCHAR(100),
    INDEX idx_leads_created (created_at)
  ) CHARACTER SET utf8mb4`)

  await pool.query(`CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME(3) NOT NULL,
    type VARCHAR(32) NOT NULL, path VARCHAR(300), referrer VARCHAR(300),
    visitor_id VARCHAR(32), session_id VARCHAR(32), location VARCHAR(100),
    device VARCHAR(16), browser VARCHAR(32),
    utm_source VARCHAR(100), utm_medium VARCHAR(100), utm_campaign VARCHAR(100),
    INDEX idx_events_created (created_at)
  ) CHARACTER SET utf8mb4`)

  const insert = async (table, row) => {
    const cols = ['created_at', ...Object.keys(row)]
    const vals = [new Date(), ...Object.values(row)]
    const [res] = await pool.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, vals)
    return res.insertId
  }

  return {
    name: `MySQL (${process.env.DB_NAME})`,
    insertLead: row => insert('leads', row),
    insertEvent: row => insert('events', row),
    async listLeads() {
      const [rows] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 5000')
      return rows
    },
    async deleteLead(id) {
      const [res] = await pool.query('DELETE FROM leads WHERE id = ?', [id])
      return res.affectedRows > 0
    },
    async eventsSince(date) {
      const [rows] = await pool.query(
        'SELECT created_at, type, path, referrer, visitor_id, session_id, location, device, utm_source, utm_campaign FROM events WHERE created_at >= ?',
        [date],
      )
      return rows
    },
    async leadsSince(date) {
      const [rows] = await pool.query('SELECT id, created_at, source, name, email, service FROM leads WHERE created_at >= ? ORDER BY created_at DESC', [date])
      return rows
    },
  }
}

// ── JSON-lines files (local development) ─────────────────────────────────────
function fileBackend() {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data')
  fs.mkdirSync(dir, { recursive: true })
  const leadsFile = path.join(dir, 'leads.jsonl')
  const eventsFile = path.join(dir, 'events.jsonl')

  const load = file => {
    if (!fs.existsSync(file)) return []
    return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).flatMap(line => {
      try {
        const r = JSON.parse(line)
        r.created_at = new Date(r.created_at)
        return [r]
      } catch {
        return []
      }
    })
  }

  const leads = load(leadsFile)
  const events = load(eventsFile)
  let nextLeadId = leads.reduce((m, l) => Math.max(m, l.id || 0), 0) + 1

  return {
    name: `local files (${dir})`,
    async insertLead(row) {
      const rec = { id: nextLeadId++, created_at: new Date(), ...row }
      leads.push(rec)
      fs.appendFileSync(leadsFile, JSON.stringify(rec) + '\n')
      return rec.id
    },
    async insertEvent(row) {
      const rec = { created_at: new Date(), ...row }
      events.push(rec)
      fs.appendFileSync(eventsFile, JSON.stringify(rec) + '\n')
    },
    async listLeads() {
      return [...leads].sort((a, b) => b.created_at - a.created_at)
    },
    async deleteLead(id) {
      const i = leads.findIndex(l => l.id === id)
      if (i === -1) return false
      leads.splice(i, 1)
      fs.writeFileSync(leadsFile, leads.map(l => JSON.stringify(l)).join('\n') + (leads.length ? '\n' : ''))
      return true
    },
    async eventsSince(date) {
      return events.filter(e => e.created_at >= date)
    },
    async leadsSince(date) {
      return leads.filter(l => l.created_at >= date).sort((a, b) => b.created_at - a.created_at)
    },
  }
}
