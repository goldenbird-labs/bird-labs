import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, User, Mail, Phone, Building2, MessageSquare } from 'lucide-react'
import axios from 'axios'

const services = [
  'AI Chatbots',
  'Automation Agents',
  'Lead Generation Systems',
  'Website Creation',
  'Custom AI Solutions',
  'AI Customer Support',
  'AI Consulting & Strategy',
]

export default function LeadForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', service: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      await axios.post('/api/leads', form)
      setStatus('success')
      setForm({ name: '', email: '', phone: '', company: '', service: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.')
    }
  }

  const inputClass = `w-full bg-[#0d0d22] border border-purple-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200`

  return (
    <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[600px] h-72 sm:h-[600px] bg-purple-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-start">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">Get In Touch</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-5">
              Ready to Build <span className="gradient-text">Your AI?</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
              Tell us about your project. We'll get back to you within 24 hours with a custom plan — no commitment required.
            </p>

            <div className="space-y-4">
              {[
                'Free consultation call',
                'Custom AI strategy for your business',
                'Clear pricing, no hidden fees',
                'Fast turnaround — live in weeks, not months',
              ].map(text => (
                <div key={text} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle size={17} className="text-purple-400 shrink-0" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 space-y-3">
              <div className="p-4 sm:p-5 rounded-2xl glow-border bg-[#0d0d22]/60">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">Available for new projects</span>
                </div>
                <p className="text-gray-500 text-xs">We typically respond within 2–4 hours during business hours.</p>
              </div>

              <a
                href="https://wa.me/19053809763"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl bg-green-950/30 border border-green-800/30 hover:border-green-600/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold group-hover:text-green-400 transition-colors">Prefer WhatsApp?</p>
                  <p className="text-gray-400 text-xs">+1-905-380-9763 · Instant reply</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl glow-border bg-[#0d0d22] p-8 sm:p-10 text-center"
              >
                <CheckCircle size={52} className="text-purple-400 mx-auto mb-5" />
                <h3 className="font-display text-2xl font-bold text-white mb-3">Message Received!</h3>
                <p className="text-gray-400 mb-6">We'll review your details and get back to you within 24 hours.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl glow-border bg-[#0d0d22] p-6 sm:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-3.5 text-gray-600" />
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name *" required className={`${inputClass} pl-10`} />
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-3.5 text-gray-600" />
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address *" required className={`${inputClass} pl-10`} />
                  </div>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-3.5 text-gray-600" />
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className={`${inputClass} pl-10`} />
                  </div>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-3.5 text-gray-600" />
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Company (optional)" className={`${inputClass} pl-10`} />
                  </div>
                </div>

                <select name="service" value={form.service} onChange={handleChange} className={`${inputClass} text-gray-400`}>
                  <option value="">Select a service (optional)</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3.5 top-3.5 text-gray-600" />
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your project *" required rows={4} className={`${inputClass} pl-10 resize-none`} />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {status === 'loading' ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  ) : (
                    <><Send size={15} />Send Message</>
                  )}
                </button>

                <p className="text-gray-600 text-xs text-center">No spam, ever. We'll only contact you about your project.</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
