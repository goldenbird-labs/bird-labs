import { motion } from 'framer-motion'
import { ShieldCheck, Clock, Lightbulb, BarChart3, Headphones, Rocket } from 'lucide-react'

const reasons = [
  {
    icon: Rocket,
    title: 'Fast Deployment',
    description: 'From kickoff to live AI — most projects are deployed in 2–4 weeks, not months.',
  },
  {
    icon: ShieldCheck,
    title: 'Production-Grade Quality',
    description: 'Every system is built to scale, monitored, and hardened for real-world conditions.',
  },
  {
    icon: Lightbulb,
    title: 'Latest AI Models',
    description: 'We work with GPT-4o, Claude, Gemini, and open-source models — always the right tool for your use case.',
  },
  {
    icon: BarChart3,
    title: 'ROI-Focused',
    description: 'We measure success by your results — leads captured, costs reduced, time saved.',
  },
  {
    icon: Headphones,
    title: 'Ongoing Support',
    description: "We don't disappear after launch. We monitor, maintain, and improve your AI systems.",
  },
  {
    icon: Clock,
    title: '24/7 AI Availability',
    description: 'Your AI agents never sleep. They work around the clock while you focus on growth.',
  },
]

export default function WhyUs() {
  return (
    <section id="why" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">Why Bird Labs</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Built Different. <span className="gradient-text">Delivers More.</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            We're not a generic dev shop. We're AI specialists obsessed with making technology work for your business.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Reasons grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {reasons.map((r, i) => {
              const Icon = r.icon
              return (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl bg-[#0d0d22]/60 border border-purple-900/20 hover:border-purple-700/40 transition-colors"
                >
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center border border-purple-700/30">
                    <Icon size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-1">{r.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{r.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Quote card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl glow-border bg-gradient-to-br from-[#0d0d22] to-[#12103a] p-7 sm:p-10">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="text-4xl sm:text-5xl text-purple-500 font-display font-bold mb-3 opacity-60">"</div>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                  We don't just implement AI tools — we architect intelligent systems that become the competitive advantage your business can't live without.
                </p>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white font-display text-xs sm:text-sm shrink-0">BL</div>
                  <div>
                    <div className="text-white font-semibold text-sm">Bird Labs Team</div>
                    <div className="text-gray-500 text-xs">AI Engineers & Strategists</div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-purple-900/30 grid grid-cols-3 gap-4 text-center">
                  {[
                    { v: '50+', l: 'Projects' },
                    { v: '3x', l: 'Avg ROI' },
                    { v: '2wk', l: 'Avg Launch' },
                  ].map(s => (
                    <div key={s.l}>
                      <div className="gradient-text font-display font-bold text-lg sm:text-xl">{s.v}</div>
                      <div className="text-gray-500 text-xs mt-1">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
