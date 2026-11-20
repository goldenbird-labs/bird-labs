// Persistent storage.
// Production (Hostinger): MySQL, configured with DB_HOST / DB_USER / DB_PASSWORD / DB_NAME.
// Local development: JSON-lines files in DATA_DIR (default ./data) when no database is configured.
//
// Every table has an auto-increment `id` and a `created_at` timestamp, plus the columns below.
import fs from 'fs'
import path from 'path'

const SCHEMA = {
  leads: {
    columns: {
      source: 'VARCHAR(16)', name: 'VARCHAR(200)', email: 'VARCHAR(254)', phone: 'VARCHAR(64)',
      company: 'VARCHAR(200)', website: 'VARCHAR(300)', service: 'VARCHAR(100)', message: 'TEXT', transcript: 'MEDIUMTEXT',
      ip: 'VARCHAR(64)', country: 'VARCHAR(100)', city: 'VARCHAR(100)', region: 'VARCHAR(100)',
    },
    indexes: ['created_at'],
  },
  events: {
    columns: {
      type: 'VARCHAR(32)', path: 'VARCHAR(300)', referrer: 'VARCHAR(300)', visitor_id: 'VARCHAR(32)', session_id: 'VARCHAR(32)',
      location: 'VARCHAR(100)', device: 'VARCHAR(16)', browser: 'VARCHAR(32)',
      utm_source: 'VARCHAR(100)', utm_medium: 'VARCHAR(100)', utm_campaign: 'VARCHAR(100)',
    },
    indexes: ['created_at'],
  },
  customers: {
    columns: {
      name: 'VARCHAR(200)', company: 'VARCHAR(200)', email: 'VARCHAR(254)', phone: 'VARCHAR(64)', password_hash: 'VARCHAR(255)',
      plan: 'VARCHAR(32)', support_hours: 'DECIMAL(5,2)', active: 'TINYINT', session_version: 'INT',
      last_login_at: 'DATETIME(3)', notes: 'TEXT',
    },
    indexes: ['email'],
  },
  tickets: {
    columns: {
      customer_id: 'INT', title: 'VARCHAR(200)', body: 'TEXT', link: 'VARCHAR(500)', priority: 'VARCHAR(16)', status: 'VARCHAR(20)',
      updated_at: 'DATETIME(3)', last_reply_by: 'VARCHAR(16)',
    },
    indexes: ['customer_id', 'status'],
  },
  ticket_messages: {
    columns: { ticket_id: 'INT', author: 'VARCHAR(16)', body: 'TEXT' },
    indexes: ['ticket_id'],
  },
  time_entries: {
    columns: { ticket_id: 'INT', customer_id: 'INT', minutes: 'INT', note: 'VARCHAR(300)' },
    indexes: ['customer_id', 'ticket_id'],
  },
}

const NUMERIC = /^(INT|TINYINT|DECIMAL)/
const DATE = /^DATETIME/

function normalize(table, row, { partial = false } = {}) {
  const cols = SCHEMA[table].columns
  const out = {}
  for (const [col, type] of Object.entries(cols)) {
    if (partial && !(col in row)) continue
    let v = row[col]
    if (v === undefined || v === '') v = null
    else if (v !== null && NUMERIC.test(type)) v = typeof v === 'boolean' ? Number(v) : Number(v)
    else if (v !== null && DATE.test(type)) v = v instanceof Date ? v : new Date(v)
    else if (v !== null) v = String(v)
    out[col] = v
  }
  return out
}

// MySQL returns DECIMAL as strings and TINYINT as numbers; make both backends look the same.
function hydrate(table, row) {
  if (!row) return row
  const cols = SCHEMA[table].columns
  const out = { ...row, id: Number(row.id), created_at: new Date(row.created_at) }
  for (const [col, type] of Object.entries(cols)) {
    if (out[col] == null) continue
    if (NUMERIC.test(type)) out[col] = Number(out[col])
    else if (DATE.test(type)) out[col] = new Date(out[col])
  }
  return out
}

let backend = null

export async function initStore() {
  if (process.env.DB_HOST && process.env.DB_NAME) {
    backend = await mysqlBackend()
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.warn('WARNING: No database configured (DB_HOST/DB_NAME). Data is stored in local files, which may be wiped on redeploy.')
    }
    backend = fileBackend()
  }
  console.log(`Storage: ${backend.name}`)
}

export const store = {
  insert: (table, row) => backend.insert(table, normalize(table, row)),
  update: (table, id, patch) => backend.update(table, Number(id), normalize(table, patch, { partial: true })),
  remove: (table, id) => backend.remove(table, Number(id)),
  get: async (table, id) => hydrate(table, await backend.get(table, Number(id))),
  // where: { column: value } equality filters; since: only rows created on/after this date
  list: async (table, { where = {}, since = null, limit = 5000 } = {}) =>
    (await backend.list(table, where, since, limit)).map(r => hydrate(table, r)),

  // Convenience wrappers used across the app
  insertLead: lead => store.insert('leads', lead),
  listLeads: () => store.list('leads'),
  deleteLead: id => store.remove('leads', id),
  insertEvent: event => store.insert('events', event),
  eventsSince: date => store.list('events', { since: date, limit: 500000 }),
  leadsSince: date => store.list('leads', { since: date }),
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

  for (const [table, def] of Object.entries(SCHEMA)) {
    const cols = Object.entries(def.columns).map(([c, t]) => `\`${c}\` ${t}`).join(', ')
    const idx = def.indexes.map(c => `INDEX idx_${table}_${c} (\`${c}\`)`).join(', ')
    await pool.query(`CREATE TABLE IF NOT EXISTS \`${table}\` (id INT AUTO_INCREMENT PRIMARY KEY, created_at DATETIME(3) NOT NULL, ${cols}${idx ? ', ' + idx : ''}) CHARACTER SET utf8mb4`)
    // Add any columns introduced after the table was first created.
    const [existing] = await pool.query(`SHOW COLUMNS FROM \`${table}\``)
    const have = new Set(existing.map(c => c.Field))
    for (const [c, t] of Object.entries(def.columns)) {
      if (!have.has(c)) await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${c}\` ${t}`)
    }
  }

  const check = table => { if (!SCHEMA[table]) throw new Error(`Unknown table ${table}`) }

  return {
    name: `MySQL (${process.env.DB_NAME})`,
    async insert(table, row) {
      check(table)
      const cols = ['created_at', ...Object.keys(row)]
      const [res] = await pool.query(
        `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
        [new Date(), ...Object.values(row)],
      )
      return res.insertId
    },
    async update(table, id, patch) {
      check(table)
      const cols = Object.keys(patch)
      if (!cols.length) return true
      const [res] = await pool.query(`UPDATE \`${table}\` SET ${cols.map(c => `\`${c}\` = ?`).join(', ')} WHERE id = ?`, [...Object.values(patch), id])
      return res.affectedRows > 0
    },
    async remove(table, id) {
      check(table)
      const [res] = await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id])
      return res.affectedRows > 0
    },
    async get(table, id) {
      check(table)
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [id])
      return rows[0] || null
    },
    async list(table, where, since, limit) {
      check(table)
      const conds = []
      const vals = []
      for (const [c, v] of Object.entries(where)) {
        if (!(c in SCHEMA[table].columns) && c !== 'id') throw new Error(`Unknown column ${c}`)
        conds.push(`\`${c}\` = ?`)
        vals.push(v)
      }
      if (since) { conds.push('created_at >= ?'); vals.push(since) }
      const [rows] = await pool.query(
        `SELECT * FROM \`${table}\`${conds.length ? ' WHERE ' + conds.join(' AND ') : ''} ORDER BY created_at DESC LIMIT ${Number(limit)}`,
        vals,
      )
      return rows
    },
  }
}

// ── JSON-lines files (local development) ─────────────────────────────────────
function fileBackend() {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data')
  fs.mkdirSync(dir, { recursive: true })
  const tables = {}
  const nextId = {}

  for (const table of Object.keys(SCHEMA)) {
    const file = path.join(dir, `${table}.jsonl`)
    const rows = []
    if (fs.existsSync(file)) {
      for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        if (!line) continue
        try { rows.push(JSON.parse(line)) } catch { /* skip bad line */ }
      }
    }
    rows.forEach((r, i) => { if (r.id == null) r.id = i + 1 })
    tables[table] = rows
    nextId[table] = rows.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1
  }

  const fileOf = table => path.join(dir, `${table}.jsonl`)
  const rewrite = table => fs.writeFileSync(fileOf(table), tables[table].map(r => JSON.stringify(r)).join('\n') + (tables[table].length ? '\n' : ''))
  const match = (row, where) => Object.entries(where).every(([c, v]) => String(row[c]) === String(v))

  return {
    name: `local files (${dir})`,
    async insert(table, row) {
      const rec = { id: nextId[table]++, created_at: new Date(), ...row }
      tables[table].push(rec)
      fs.appendFileSync(fileOf(table), JSON.stringify(rec) + '\n')
      return rec.id
    },
    async update(table, id, patch) {
      const row = tables[table].find(r => r.id === id)
      if (!row) return false
      Object.assign(row, patch)
      rewrite(table)
      return true
    },
    async remove(table, id) {
      const i = tables[table].findIndex(r => r.id === id)
      if (i === -1) return false
      tables[table].splice(i, 1)
      rewrite(table)
      return true
    },
    async get(table, id) {
      const row = tables[table].find(r => r.id === id)
      return row ? { ...row } : null
    },
    async list(table, where, since, limit) {
      const sinceMs = since ? new Date(since).getTime() : null
      return tables[table]
        .filter(r => match(r, where) && (sinceMs == null || new Date(r.created_at).getTime() >= sinceMs))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .map(r => ({ ...r }))
    },
  }
}
