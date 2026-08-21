import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const clients = [
  {
    name: 'Pocket Full of Help',
    initials: 'PH',
    industry: 'Virtual Assistant Services',
    tagline: 'Running out of time? We\'ve got you.',
    url: 'https://www.pocketfullofhelp.com/',
    gradient: 'from-purple-600 to-violet-700',
  },
  {
    name: 'G & V Group',
    initials: 'GV',
    industry: 'Real Estate · California & Florida',
    tagline: 'REO, Short Sales & HUD Homes specialists.',
    url: 'https://gandvgroup.com/',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    name: 'Bellissimo International',
    initials: 'BI',
    industry: 'Modeling & Talent Agency',
    tagline: 'International modeling and talent representation.',
    url: 'https://bellissimo-international-production.up.railway.app/',
    gradient: 'from-cyan-600 to-blue-700',
  },
]

export default function Clients() {
  return (
    <section id="clients" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">Who We Work With</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Our <span className="gradient-text">Clients</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Businesses across industries trust Bird Labs to build their web presence and power their growth with AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {clients.map((client, i) => (
            <motion.a
              key={client.name}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group card-glow rounded-2xl p-6 bg-[#0d0d22]/80 backdrop-blur-sm border border-purple-900/20 hover:border-purple-700/40 transition-all duration-300 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${client.gradient} flex items-center justify-center font-display font-bold text-white text-sm shrink-0`}>
                  {client.initials}
                </div>
                <ExternalLink size={15} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
              </div>

              <div>
                <h3 className="font-display font-semibold text-white text-base mb-1">{client.name}</h3>
                <p className="text-purple-400 text-xs font-medium mb-2">{client.industry}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{client.tagline}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
