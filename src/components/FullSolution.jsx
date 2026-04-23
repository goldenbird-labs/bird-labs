import { motion } from 'framer-motion'
import { Globe, Zap, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Globe,
    title: 'Get Online',
    subtitle: 'Your Digital Foundation',
    description:
      'No website? No problem. We design and build your entire online presence from the ground up — professional, fast, and built to convert visitors into paying customers.',
    bullets: [
      'Custom design matched to your brand',
      'Mobile-first & lightning fast',
      'SEO-optimised from day one',
      'Domain, hosting & launch handled for you',
    ],
    color: 'from-cyan-500 to-blue-600',
    glow: 'bg-cyan-600/10',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Automate & Scale',
    subtitle: 'Add AI to Your Business',
    description:
      'Once you have a digital presence, we layer in AI that works 24/7. Chatbots that answer queries, automation that handles tasks, and lead systems that fill your pipeline — all without extra headcount.',
    bullets: [
      'AI chatbot trained on your business',
      'Automated workflows & follow-ups',
      'Lead capture & CRM integration',
      'Instant customer support, always on',
    ],
    color: 'from-purple-500 to-violet-600',
    glow: 'bg-purple-600/10',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Grow & Dominate',
    subtitle: 'Compounding Results',
    description:
      'With your web presence and AI working together, you gain an unfair advantage. More leads, lower costs, faster responses — while competitors are still doing everything manually.',
    bullets: [
      'Real-time analytics & reporting',
      'Continuous AI improvement',
      'Ongoing support & optimisation',
      'Roadmap for next-level growth',
    ],
    color: 'from-blue-500 to-indigo-600',
    glow: 'bg-blue-600/10',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function FullSolution() {
  return (
    <section id="solution" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-800/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">The Complete Package</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            From Zero to <span className="gradient-text">AI-Powered Business</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Whether you have no web presence at all or an existing site that needs supercharging — we take you through the full journey. One partner. Everything covered.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {steps.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.step}
                variants={item}
                className="relative rounded-2xl bg-[#0d0d22]/80 border border-purple-900/25 p-6 sm:p-8 group hover:border-purple-700/40 transition-colors duration-300"
              >
                {/* Connector arrow between cards (desktop only) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 rounded-full bg-[#0d0d22] border border-purple-800/40">
                    <ArrowRight size={14} className="text-purple-500" />
                  </div>
                )}

                {/* Glow blob */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${s.glow} rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Step number */}
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-display font-bold text-white/5 select-none">{s.step}</span>
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>

                <p className="text-xs font-semibold tracking-widest uppercase text-purple-400 mb-1">{s.subtitle}</p>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{s.description}</p>

                <ul className="space-y-2">
                  {s.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 size={15} className="text-purple-400 mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 rounded-2xl glow-border bg-gradient-to-r from-purple-900/30 via-[#0d0d22] to-blue-900/30 border border-purple-800/30 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
        >
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-purple-400 mb-1">Ready to start?</p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              Get your complete digital presence — web + AI — in weeks.
            </h3>
            <p className="text-gray-400 text-sm mt-1">One team. One invoice. Zero overlap headaches.</p>
          </div>
          <a
            href="#contact"
            className="shrink-0 group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 hover:scale-105"
          >
            Let's Build It Together
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
