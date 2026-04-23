import { motion } from 'framer-motion'
import { Bot, Workflow, TrendingUp, Puzzle, Brain, MessageSquare, Globe } from 'lucide-react'

const services = [
  {
    icon: Globe,
    title: 'Website Design & Development',
    description: 'Not on the web yet? We build your entire digital presence from scratch — fast-loading, mobile-first, and conversion-optimised. Already online? We redesign and upgrade.',
    tags: ['React', 'Next.js', 'Custom Design', 'SEO-Ready'],
    color: 'from-cyan-600 to-blue-700',
  },
  {
    icon: Bot,
    title: 'AI Chatbots',
    description: 'Intelligent conversational agents that handle customer queries, qualify leads, and provide 24/7 support — trained on your business data.',
    tags: ['GPT-4o', 'Custom Training', 'Multi-Platform'],
    color: 'from-purple-600 to-purple-800',
  },
  {
    icon: Workflow,
    title: 'Automation Agents',
    description: 'Autonomous AI agents that execute complex workflows, integrate with your tools, and make decisions — without human intervention.',
    tags: ['n8n', 'Make.com', 'Custom Pipelines'],
    color: 'from-blue-600 to-blue-800',
  },
  {
    icon: TrendingUp,
    title: 'Lead Generation Systems',
    description: 'AI-powered outreach and lead capture systems that identify prospects, personalize messaging, and fill your pipeline automatically.',
    tags: ['Automated Outreach', 'CRM Integration', 'Analytics'],
    color: 'from-violet-600 to-violet-800',
  },
  {
    icon: Brain,
    title: 'Custom AI Solutions',
    description: 'Bespoke AI models and integrations built around your specific business needs — from fine-tuned LLMs to computer vision pipelines.',
    tags: ['Fine-tuning', 'RAG', 'API Integration'],
    color: 'from-indigo-600 to-indigo-800',
  },
  {
    icon: MessageSquare,
    title: 'AI Customer Support',
    description: 'Deploy intelligent support systems that resolve tickets instantly, escalate complex cases, and learn from every interaction.',
    tags: ['Zendesk', 'Intercom', 'Freshdesk'],
    color: 'from-purple-700 to-blue-700',
  },
  {
    icon: Puzzle,
    title: 'AI Consulting & Strategy',
    description: 'Not sure where to start? We audit your operations, identify AI opportunities, and build a roadmap for transformation.',
    tags: ['Audit', 'Roadmap', 'Implementation'],
    color: 'from-blue-700 to-purple-700',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Services() {
  return (
    <section id="services" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-purple-400 text-xs sm:text-sm font-semibold tracking-widest uppercase">What We Build</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4">
            Web & AI Solutions That <span className="gradient-text">Actually Work</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            From your first website to production-grade AI — we build the complete digital stack that drives real, measurable growth.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {services.map(service => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                variants={item}
                className="card-glow rounded-2xl p-5 sm:p-6 bg-[#0d0d22]/80 backdrop-blur-sm group cursor-default"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 sm:mb-5">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-purple-900/30 text-purple-300 border border-purple-800/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
