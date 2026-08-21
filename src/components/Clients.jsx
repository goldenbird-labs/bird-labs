import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const clients = [
  {
    name: 'Pocket Full of Help',
    industry: 'Virtual Assistant Services',
    tagline: 'Running out of time? We\'ve got you.',
    url: 'https://www.pocketfullofhelp.com/',
    logo: 'https://www.pocketfullofhelp.com/pocket%20full%20logo.png',
    logoBg: 'bg-white',
  },
  {
    name: 'G & V Group',
    industry: 'Real Estate · California & Florida',
    tagline: 'REO, Short Sales & HUD Homes specialists.',
    url: 'https://gandvgroup.com/',
    logo: 'https://gandvgroup.com/favicon.png',
    logoBg: 'bg-white',
  },
  {
    name: 'Bellissimo International',
    industry: 'Modeling & Talent Agency',
    tagline: 'International modeling and talent representation.',
    url: 'https://bellissimo-international-production.up.railway.app/',
    logo: null,
    initials: 'B',
    logoBg: 'bg-[#0B0B0C]',
    initialsColor: '#B8975A',
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
              className="group card-glow rounded-2xl p-6 bg-[#0d0d22]/80 backdrop-blur-sm border border-purple-900/20 hover:border-purple-700/40 transition-all duration-300 flex flex-col gap-5"
            >
              {/* Logo area */}
              <div className={`w-full h-20 rounded-xl ${client.logoBg} flex items-center justify-center overflow-hidden`}>
                {client.logo ? (
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    className="max-h-16 max-w-full object-contain p-2"
                  />
                ) : (
                  <span
                    className="font-serif text-4xl font-bold"
                    style={{ color: client.initialsColor }}
                  >
                    {client.initials}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-white text-base leading-tight">{client.name}</h3>
                  <ExternalLink size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-purple-400 text-xs font-medium">{client.industry}</p>
                <p className="text-gray-500 text-sm leading-relaxed mt-1">{client.tagline}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
