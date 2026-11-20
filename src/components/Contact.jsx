import { useRef, useState } from 'react'
import { Calendar, Mail, Phone, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Reveal from './Reveal'
import { CALENDLY_URL, WHATSAPP_URL, EMAIL, PHONE_DISPLAY, PHONE_TEL } from '../lib/site'
import { submitLead } from '../lib/leads'
import { track } from '../lib/track'
import { WhatsAppIcon } from './Icons'

const services = ['A new or better website', 'An AI chatbot', 'Automation & lead follow-up', 'Not sure yet — help me decide']

const empty = { name: '', email: '', phone: '', company: '', service: '', message: '', company_site: '' }

export default function Contact() {
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const started = useRef(false)

  const update = e => {
    if (!started.current) {
      started.current = true
      track('form_start')
    }
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const onSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await submitLead({ ...form, source: 'form' })
      setStatus('done')
      setForm(empty)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  const channels = [
    { icon: Calendar, label: 'Book a free 15-min call', detail: 'Pick a time that suits you', href: CALENDLY_URL, external: true, primary: true },
    { icon: WhatsAppIcon, label: 'WhatsApp us', detail: 'Chat with a real person', href: WHATSAPP_URL, external: true },
    { icon: Mail, label: EMAIL, detail: 'We reply within one business day', href: `mailto:${EMAIL}` },
    { icon: Phone, label: PHONE_DISPLAY, detail: 'Mon–Fri, 9am–5pm Eastern', href: `tel:${PHONE_TEL}` },
  ]

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">Get in touch</p>
          <h2 id="contact-title" className="section-title">Let's get you more customers</h2>
          <p className="section-lead">Tell us a little about your business and we'll come back with ideas and a clear price — free, with no obligation.</p>

          <ul className="mt-8 space-y-3">
            {channels.map(({ icon: Icon, label, detail, href, external, primary }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-card ${primary ? 'border-brand-200 bg-brand-50/60 hover:border-brand-300' : 'border-ink-200 bg-white hover:border-ink-300'}`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${primary ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-700'}`}>
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-900">{label}</span>
                    <span className="block text-sm text-ink-500">{detail}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={80}>
          {status === 'done' ? (
            <div className="card flex h-full flex-col items-center justify-center p-10 text-center" role="status">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600"><CheckCircle2 size={30} /></span>
              <h3 className="mt-5 text-2xl font-bold">Thanks — message received!</h3>
              <p className="mt-2 max-w-sm text-ink-600">We'll get back to you within one business day. Want to talk sooner?</p>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6"><Calendar size={18} /> Book a call now</a>
              <button type="button" onClick={() => setStatus('idle')} className="mt-4 text-sm font-medium text-ink-500 hover:text-ink-800">Send another message</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">Your name *</label>
                  <input id="c-name" name="name" required autoComplete="name" className="input" value={form.name} onChange={update} maxLength={200} />
                </div>
                <div>
                  <label className="label" htmlFor="c-email">Email *</label>
                  <input id="c-email" name="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={update} />
                </div>
                <div>
                  <label className="label" htmlFor="c-phone">Phone <span className="font-normal text-ink-400">(optional)</span></label>
                  <input id="c-phone" name="phone" type="tel" autoComplete="tel" className="input" value={form.phone} onChange={update} maxLength={64} />
                </div>
                <div>
                  <label className="label" htmlFor="c-company">Business name <span className="font-normal text-ink-400">(optional)</span></label>
                  <input id="c-company" name="company" autoComplete="organization" className="input" value={form.company} onChange={update} maxLength={200} />
                </div>
              </div>

              <fieldset>
                <legend className="label">What can we help with?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {services.map(s => (
                    <label key={s} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[15px] transition ${form.service === s ? 'border-brand-500 bg-brand-50 text-ink-900' : 'border-ink-200 text-ink-700 hover:border-ink-300'}`}>
                      <input type="radio" name="service" value={s} checked={form.service === s} onChange={update} className="h-4 w-4 accent-brand-700" />
                      {s}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="label" htmlFor="c-message">Tell us about your business *</label>
                <textarea id="c-message" name="message" required rows={4} className="input resize-y" placeholder="What do you do, and what would you like more of — calls, bookings, sales?" value={form.message} onChange={update} maxLength={5000} />
              </div>

              <input type="text" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={form.company_site} onChange={update} />

              {error && (
                <p className="flex items-center gap-2 text-sm text-red-600" role="alert"><AlertCircle size={16} /> {error}</p>
              )}

              <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-3.5 text-base">
                {status === 'loading' ? 'Sending…' : <><Send size={18} /> Send message</>}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-center text-sm text-ink-500">
                <Clock size={14} /> We reply within one business day. No spam, ever.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
