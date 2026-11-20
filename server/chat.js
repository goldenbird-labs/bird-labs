// Birdie, the website chatbot. Streams answers from OpenAI using the knowledge base in
// chatbot/knowledge-base.md, and captures a lead when the visitor shares their details.
import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import OpenAI from 'openai'
import { Resend } from 'resend'
import { captureLead } from './leads.js'
import { rateLimit, clean, EMAIL_RE } from './util.js'

const CHATBOT_DIR = path.join(process.cwd(), 'chatbot')
const config = JSON.parse(fs.readFileSync(path.join(CHATBOT_DIR, 'bot-config.json'), 'utf8'))
const knowledgeBase = fs.readFileSync(path.join(CHATBOT_DIR, 'knowledge-base.md'), 'utf8')

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null
if (!openai) console.warn('OPENAI_API_KEY is not set — the chatbot will show as unavailable.')

const SYSTEM_PROMPT = [
  config.tone,
  '',
  `KNOWLEDGE BASE:\n${knowledgeBase}`,
  '',
  "IMPORTANT: Base your answers on the knowledge base above. If a question isn't covered, say you don't have that specific information and suggest booking a free call or messaging the team on WhatsApp. Never invent prices, services, clients or results.",
  '',
  'FORMAT: Keep replies short (2–5 sentences or a few bullets) — visitors read them in a small chat window. Use markdown bullets and bold sparingly. Put links in markdown form.',
  '',
  'LEAD CAPTURE: When a visitor shows interest, collect their details ONE question at a time in this order: (1) full name, (2) email address, (3) type of business, (4) biggest challenge, (5) phone number — say it is optional and they can skip it. Once you have name, email, business type and challenge (phone may be empty), append this on a new line at the very end of your message: LEAD_DATA:{"name":"...","email":"...","phone":"...","businessType":"...","challenge":"..."}. Only output LEAD_DATA once per conversation. Never mention or show LEAD_DATA to the visitor.',
].join('\n')

// Avoid saving the same chat lead twice if the model repeats LEAD_DATA.
const capturedSessions = new Map()

async function sendFollowUpEmail(lead) {
  if (!process.env.RESEND_API_KEY || !lead.email) return
  const firstName = (lead.name || '').split(' ')[0] || 'there'
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.EMAIL_FROM || 'Bird Labs <hello@birdlabs.net>',
    to: lead.email,
    subject: 'Thanks for reaching out to Bird Labs',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;line-height:1.6">
        <h2 style="margin:0 0 12px">Hi ${esc(firstName)},</h2>
        <p>Thanks for chatting with Birdie on our website. We've got your details and someone from the team will be in touch within one business day.</p>
        <p>If you'd like to talk sooner, grab a free 15-minute slot — we'll look at your business and show you exactly what we'd build.</p>
        <p style="margin:28px 0">
          <a href="https://calendly.com/goldenbirdconsulting/15min" style="background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Book your free call</a>
        </p>
        <p style="color:#475569">Or just reply to this email.</p>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px">Bird Labs · hello@birdlabs.net · +1 905-380-9763 · <a href="https://birdlabs.net" style="color:#6d28d9">birdlabs.net</a></p>
      </div>`,
  })
  if (error) throw new Error(error.message)
}

export const chatRouter = Router()

chatRouter.get('/api/chat/config', (req, res) => {
  res.json({ ...config, available: Boolean(openai) })
})

chatRouter.post('/api/chat', rateLimit({ windowMs: 10 * 60 * 1000, max: 40, message: "You've sent a lot of messages — please wait a few minutes, or message us on WhatsApp." }), async (req, res) => {
  if (!openai) return res.status(503).json({ error: 'Chat is unavailable right now. Please use the contact form or WhatsApp.' })

  // Only accept plain user/assistant turns from the browser — never a system message.
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : []
  const messages = raw
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-24)
    .map(m => ({ role: m.role, content: m.content.slice(0, 3000) }))
  const sessionId = clean(req.body?.sessionId, 64)

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'A message is required.' })
  }

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.GPT_MODEL || 'gpt-4o',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 700,
      temperature: 0.6,
    })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    // Stream only the visible reply: stop at LEAD_DATA, and hold back any tail that could be
    // the start of that marker, so the hidden lead line never reaches the browser.
    const MARKER = 'LEAD_DATA'
    let full = ''
    let sent = 0
    const visibleEnd = () => {
      const at = full.indexOf(MARKER)
      if (at !== -1) return at
      for (let k = Math.min(MARKER.length - 1, full.length); k > 0; k--) {
        if (MARKER.startsWith(full.slice(-k))) return full.length - k
      }
      return full.length
    }
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (!content) continue
      full += content
      const end = visibleEnd()
      if (end > sent) {
        res.write(`data: ${JSON.stringify({ content: full.slice(sent, end) })}\n\n`)
        sent = end
      }
    }
    if (!full.includes(MARKER) && sent < full.length) {
      res.write(`data: ${JSON.stringify({ content: full.slice(sent) })}\n\n`)
    }
    res.write('data: [DONE]\n\n')
    res.end()

    const match = full.match(/LEAD_DATA:\s*(\{.*?\})/s)
    if (!match) return
    let data
    try { data = JSON.parse(match[1]) } catch { return console.error('Chat lead: could not parse LEAD_DATA') }
    const email = clean(data.email, 254).toLowerCase()
    if (!EMAIL_RE.test(email)) return
    const dedupeKey = `${sessionId}|${email}`
    if (capturedSessions.has(dedupeKey)) return
    capturedSessions.set(dedupeKey, Date.now())
    if (capturedSessions.size > 5000) capturedSessions.clear()

    const transcript = [...messages, { role: 'assistant', content: full.replace(/LEAD_DATA:\s*\{.*?\}/s, '').trim() }]
      .map(m => `${m.role === 'user' ? 'Visitor' : 'Birdie'}: ${m.content}`)
      .join('\n\n')

    const lead = {
      source: 'chat',
      name: clean(data.name, 200),
      email,
      phone: clean(data.phone, 64),
      company: clean(data.businessType, 200),
      message: clean(data.challenge, 2000),
      transcript: transcript.slice(0, 60000),
      ip: req.ip,
    }
    captureLead(lead).catch(err => console.error('Chat lead failed:', err.message))
    sendFollowUpEmail(lead).catch(err => console.error('Follow-up email failed:', err.message))
  } catch (err) {
    console.error('Chat error:', err.message)
    if (!res.headersSent) return res.status(502).json({ error: 'Birdie is having trouble answering right now. Please try again, or message us on WhatsApp.' })
    res.write(`data: ${JSON.stringify({ error: 'The answer was interrupted. Please try again.' })}\n\n`)
    res.end()
  }
})
