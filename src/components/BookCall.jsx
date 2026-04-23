import { motion } from 'framer-motion'
import { Calendar, Clock, Video, ArrowRight } from 'lucide-react'

const perks = [
  { icon: Clock, text: '15-minute focused call' },
  { icon: Video, text: 'Google Meet or Zoom' },
  { icon: Calendar, text: 'Pick a time that works for you' },
]

export default function BookCall() {
  return (
    <section id="book" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl sm:rounded-3xl glow-border bg-gradient-to-br from-[#0d0d22] to-[#12103a] p-8 sm:p-12 text-center relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-5 sm:mb-6">
              <Calendar size={26} className="text-white" />
            </div>

            <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">Free Consultation</span>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
              Talk to Us About <span className="gradient-text">Your Vision</span>
            </h2>

            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Book a free 15-minute call with our team. Tell us about your business, your goals, and we'll map out exactly how AI can transform your operations.
            </p>

            {/* Perks */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-10">
              {perks.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
                  <Icon size={16} className="text-purple-400 shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="https://calendly.com/goldenbirdconsulting/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 sm:px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-base hover:opacity-90 transition-all duration-200 hover:scale-105"
            >
              Book Your Free Call
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <p className="text-gray-600 text-xs mt-4">No commitment. No sales pressure. Just a real conversation.</p>

            <div className="mt-5 pt-5 border-t border-purple-900/30 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-gray-600 text-xs">Prefer to message?</span>
              <a
                href="https://wa.me/19053809763"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp +1-905-380-9763
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
