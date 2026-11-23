import { Calendar, MessageCircle, Check, Bell, Lock, Star, TrendingUp, CalendarCheck } from 'lucide-react'
import { CALENDLY_URL } from '../lib/site'
import { BirdMark } from './Logo'
import { openChat } from '../lib/chat'

const promises = ['No big upfront cost', 'Plans from $99/month', 'Live in 1–3 weeks']

// The illustration inside the browser: an example client website, drawn entirely in SVG/CSS.
function ExampleSite() {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between px-5 py-3">
        <span className="flex items-center gap-1.5 font-display text-[13px] font-extrabold text-ink-900">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-400 to-sky-600 text-[10px] text-white">L</span>
          Lakeside Dental
        </span>
        <span className="hidden gap-3 text-[10px] font-medium text-ink-500 sm:flex"><span>Services</span><span>Team</span><span>Reviews</span></span>
        <span className="rounded-md bg-ink-900 px-2.5 py-1 text-[10px] font-semibold text-white">Book online</span>
      </div>
      <div className="relative mx-3 overflow-hidden rounded-xl">
        <svg viewBox="0 0 440 170" className="block w-full" role="presentation">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ccfbf1" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
            <linearGradient id="hillA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5eead4" />
              <stop offset="1" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="hillB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="440" height="170" fill="url(#sky)" />
          <circle cx="345" cy="52" r="26" fill="#fde68a" opacity="0.9" />
          <circle cx="345" cy="52" r="40" fill="#fde68a" opacity="0.25" />
          <path d="M0 118 C70 88 120 96 190 112 S320 86 440 104 V170 H0Z" fill="url(#hillA)" opacity="0.75" />
          <path d="M0 140 C90 116 170 128 250 140 S380 120 440 132 V170 H0Z" fill="url(#hillB)" opacity="0.85" />
          <g fill="#ffffff" opacity="0.85">
            <ellipse cx="80" cy="40" rx="26" ry="7" />
            <ellipse cx="98" cy="35" rx="15" ry="7" />
            <ellipse cx="230" cy="28" rx="20" ry="5" />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col justify-center p-5">
          <p className="max-w-[60%] font-display text-[19px] font-extrabold leading-tight text-ink-900 sm:text-[22px]">Gentle dental care, right by the lake.</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-md bg-ink-900 px-3 py-1.5 text-[10px] font-semibold text-white">Book a visit</span>
            <span className="flex items-center gap-0.5 rounded-md bg-white/80 px-2 py-1.5 text-[10px] font-semibold text-ink-800">
              <Star size={10} className="fill-amber-400 text-amber-400" /> 4.9 · 212 reviews
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 pb-24">
        {[['Check-ups', 'from-teal-100 to-teal-50'], ['Whitening', 'from-sky-100 to-sky-50'], ['Emergency', 'from-violet-100 to-violet-50']].map(([t, g]) => (
          <div key={t} className={`rounded-lg bg-gradient-to-br ${g} p-2.5`}>
            <div className="mb-2 h-5 w-5 rounded-md bg-white/80" />
            <p className="text-[10px] font-semibold text-ink-800">{t}</p>
            <div className="mt-1 h-1.5 w-4/5 rounded-full bg-ink-900/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:mr-0" aria-hidden="true">
      {/* Orbit rings */}
      <svg className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 opacity-60" viewBox="0 0 600 600">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#f0abfc" stopOpacity="0.1" />
            <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle cx="300" cy="300" r="200" fill="none" stroke="url(#ring)" strokeWidth="1" />
        <circle cx="300" cy="300" r="260" fill="none" stroke="url(#ring)" strokeWidth="1" strokeDasharray="2 8" />
        <circle cx="500" cy="300" r="4" fill="#c4b5fd" />
        <circle cx="116" cy="200" r="3" fill="#7dd3fc" />
      </svg>

      {/* Browser */}
      <div className="rise-in overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(124,58,237,0.55),0_0_0_1px_rgba(255,255,255,0.12)]">
        <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] text-ink-500 ring-1 ring-ink-200">
            <Lock size={10} /> lakesidedental.ca
          </div>
        </div>
        <ExampleSite />
      </div>

      {/* AI assistant conversation */}
      <div className="rise-in relative z-10 -mt-20 ml-auto w-[88%] max-w-[320px] rounded-2xl border border-white/60 p-4 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.45)] glass sm:absolute sm:-bottom-10 sm:-right-8 sm:mt-0 sm:w-[80%]" style={{ animationDelay: '0.35s' }}>
        <div className="mb-3 flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-fuchsia-100">
            <BirdMark size={24} />
            <span className="pulse-ring absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">AI assistant</p>
            <p className="text-[11px] text-ink-500">Replies instantly · 24/7</p>
          </div>
        </div>
        <div className="space-y-2 text-[12.5px] leading-snug">
          <p className="rise-in ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-brand-600 to-brand-800 px-3 py-2 text-white" style={{ animationDelay: '0.9s' }}>Hi! Any openings Saturday morning?</p>
          <p className="rise-in w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-ink-100 px-3 py-2 text-ink-800" style={{ animationDelay: '1.6s' }}>Yes — 10:00 or 11:30. Shall I book one for you?</p>
          <p className="rise-in ml-auto w-fit rounded-2xl rounded-br-md bg-gradient-to-br from-brand-600 to-brand-800 px-3 py-2 text-white" style={{ animationDelay: '2.3s' }}>10:00 please!</p>
          <div className="rise-in flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-[12px] font-medium text-green-800 ring-1 ring-green-200" style={{ animationDelay: '3s' }}>
            <CalendarCheck size={14} /> Booked · Sat 10:00 AM
          </div>
        </div>
      </div>

      {/* New lead notification */}
      <div className="rise-in absolute bottom-20 hidden sm:-left-10 sm:block lg:-left-6 xl:-left-10" style={{ animationDelay: '3.4s' }}>
        <div className="animate-float-slow flex items-center gap-3 rounded-2xl border border-white/60 px-3.5 py-2.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.45)] glass">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 text-white"><Bell size={16} /></span>
          <div>
            <p className="text-xs font-semibold text-ink-900">New lead → your phone</p>
            <p className="text-[11px] text-ink-500">Sarah M. · booked Saturday</p>
          </div>
        </div>
      </div>

      {/* Enquiries chart */}
      <div className="rise-in absolute -right-3 -top-14 hidden w-44 sm:block lg:-right-10" style={{ animationDelay: '0.6s' }}>
        <div className="animate-float-alt rounded-2xl border border-white/10 bg-gradient-to-br from-[#1d1340] to-[#0d0b20] p-3.5 text-white shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]">
          <p className="flex items-center gap-1 text-[11px] font-medium text-white/70"><TrendingUp size={12} /> Enquiries</p>
          <p className="mt-0.5 font-display text-xl font-extrabold">More every month</p>
          <svg viewBox="0 0 140 44" className="mt-2 w-full">
            <defs>
              <linearGradient id="spark" x1="0" x2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#7dd3fc" />
              </linearGradient>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#a78bfa" stopOpacity="0.35" />
                <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M2 38 L22 34 L42 36 L62 26 L82 28 L102 16 L122 12 L138 4 V44 H2Z" fill="url(#sparkFill)" />
            <path className="draw-line" d="M2 38 L22 34 L42 36 L62 26 L82 28 L102 16 L122 12 L138 4" fill="none" stroke="url(#spark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <div className="px-2 pt-2 sm:px-3">
      <section id="top" className="stage grain rounded-[1.75rem] pb-24 pt-14 sm:rounded-[2.25rem] sm:pb-32 sm:pt-20 lg:pt-24">
        <div className="aurora-blob -left-32 -top-40 h-[34rem] w-[34rem] bg-brand-600" />
        <div className="aurora-blob -right-40 top-10 h-[30rem] w-[30rem] bg-fuchsia-600" style={{ animationDelay: '-6s', opacity: 0.35 }} />
        <div className="aurora-blob bottom-[-18rem] left-1/3 h-[32rem] w-[40rem] bg-sky-500" style={{ animationDelay: '-12s', opacity: 0.3 }} />
        <div className="grid-lines" />

        <div className="container-site grid items-center gap-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <p className="rise-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-3.5 text-sm font-medium text-white/85 backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white"><BirdMark size={17} /></span>
              Websites + AI for small businesses
            </p>

            <h1 className="rise-in mt-6 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight sm:text-[3.4rem] lg:text-[4rem]" style={{ animationDelay: '0.08s' }}>
              Get more customers from your website — <span className="text-gradient">even while you sleep.</span>
            </h1>

            <p className="rise-in mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl lg:mx-0" style={{ animationDelay: '0.16s' }}>
              Bird Labs builds you a website that clearly sells what you do, adds an AI assistant that answers customers and books appointments 24/7, and follows up with every lead automatically.
            </p>

            <div className="rise-in mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: '0.24s' }}>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn bg-white px-6 py-3.5 text-base text-ink-900 shadow-[0_8px_30px_-6px_rgba(167,139,250,0.7)] hover:bg-brand-50">
                <Calendar size={18} /> Book a free 15-min call
              </a>
              <button type="button" onClick={() => openChat()} className="btn border border-white/20 bg-white/5 px-6 py-3.5 text-base text-white backdrop-blur hover:bg-white/10">
                <MessageCircle size={18} /> Ask our AI a question
              </button>
            </div>

            <ul className="rise-in mt-8 flex flex-col items-center gap-x-6 gap-y-2 text-[15px] text-white/70 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: '0.32s' }}>
              {promises.map(p => (
                <li key={p} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/25 text-brand-200"><Check size={13} strokeWidth={3} /></span> {p}
                </li>
              ))}
            </ul>
          </div>

          <HeroVisual />
        </div>
      </section>
    </div>
  )
}
