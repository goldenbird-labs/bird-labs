import { useCallback } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Calendar, TrendingUp, MessageSquare, Globe } from 'lucide-react'

export default function Hero() {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine)
  }, [])

  const particlesOptions = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: {
      events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
      modes: { repulse: { distance: 80, duration: 0.4 } },
    },
    particles: {
      color: { value: ['#7c3aed', '#3b82f6', '#a855f7'] },
      links: { color: '#7c3aed', distance: 140, enable: true, opacity: 0.15, width: 1 },
      move: { enable: true, speed: 0.6, random: true, outModes: { default: 'bounce' } },
      number: { density: { enable: true, area: 900 }, value: 60 },
      opacity: { value: { min: 0.2, max: 0.6 } },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="absolute inset-0 z-0" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-700/10 rounded-full blur-3xl glow-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-blue-700/10 rounded-full blur-3xl glow-pulse pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Floating stat cards — desktop only */}
      <div className="hidden lg:block absolute left-8 top-1/3 float-slow pointer-events-none z-10">
        <div className="rounded-2xl bg-[#0d0d22]/80 border border-purple-800/40 backdrop-blur-sm px-4 py-3 flex items-center gap-3 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
            <Globe size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">Website Live</p>
            <p className="text-green-400 text-xs">Launched in 12 days</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-8 top-1/4 float-slow-delay pointer-events-none z-10">
        <div className="rounded-2xl bg-[#0d0d22]/80 border border-purple-800/40 backdrop-blur-sm px-4 py-3 flex items-center gap-3 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">AI Chatbot</p>
            <p className="text-purple-400 text-xs">247 leads this week</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute left-8 bottom-1/3 float-slow pointer-events-none z-10" style={{ animationDelay: '1s' }}>
        <div className="rounded-2xl bg-[#0d0d22]/80 border border-purple-800/40 backdrop-blur-sm px-4 py-3 flex items-center gap-3 shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">Revenue</p>
            <p className="text-blue-400 text-xs">+3x in 60 days</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glow-border bg-purple-900/20 text-purple-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8"
        >
          <Zap size={13} className="text-purple-400" />
          Web Development · AI Products · Complete Business Growth
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-5 sm:mb-6"
        >
          We Build the Web & AI.
          <br />
          <span className="gradient-text">You Scale the Business.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
        >
          No website yet? We build it. Already online? We supercharge it with AI.
          From your first landing page to fully autonomous agents — we deliver the complete digital stack your business needs to compete and grow.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0"
        >
          <a
            href="#solution"
            className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm sm:text-base hover:opacity-90 transition-all duration-200 hover:scale-105"
          >
            See How It Works
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="https://calendly.com/goldenbirdconsulting/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-purple-700/40 text-gray-300 font-semibold text-sm sm:text-base hover:border-purple-500 hover:text-white transition-all duration-200"
          >
            <Calendar size={16} />
            Book a Free Call
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-6 max-w-sm sm:max-w-lg mx-auto"
        >
          {[
            { value: '50+', label: 'AI Projects' },
            { value: '98%', label: 'Satisfaction' },
            { value: '24/7', label: 'AI Uptime' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080818] to-transparent pointer-events-none" />
    </section>
  )
}
