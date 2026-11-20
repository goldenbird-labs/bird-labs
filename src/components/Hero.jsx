import { Calendar, MessageCircle, Check, Bell, Globe } from 'lucide-react'
import { CALENDLY_URL } from '../lib/site'
import { BirdMark } from './Logo'
import { openChat } from '../lib/chat'

const promises = ['Free consultation', 'Live in 1–3 weeks', 'No tech skills needed']

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-100 via-white to-blue-50" />

      {/* Browser window: an example client website */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift">
        <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300" />
          <div className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-white px-3 py-1 text-xs text-ink-500 ring-1 ring-ink-200">
            <Globe size={12} /> yourbusiness.com
          </div>
        </div>
        <div className="space-y-4 p-6 pb-28">
          <div className="h-3 w-24 rounded-full bg-brand-200" />
          <div className="space-y-2">
            <div className="h-5 w-4/5 rounded-md bg-ink-800" />
            <div className="h-5 w-3/5 rounded-md bg-ink-800" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded-full bg-ink-200" />
            <div className="h-2.5 w-11/12 rounded-full bg-ink-200" />
            <div className="h-2.5 w-2/3 rounded-full bg-ink-200" />
          </div>
          <div className="flex gap-2 pt-1">
            <div className="h-9 w-32 rounded-lg bg-brand-700" />
            <div className="h-9 w-24 rounded-lg border border-ink-200" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-lg border border-ink-100 p-2.5">
                <div className="mb-2 h-6 w-6 rounded-md bg-brand-100" />
                <div className="h-2 w-full rounded-full bg-ink-200" />
                <div className="mt-1 h-2 w-2/3 rounded-full bg-ink-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat card: the AI assistant answering a customer */}
      <div className="absolute -bottom-8 right-2 w-[78%] max-w-[330px] rounded-2xl border border-ink-200 bg-white p-4 shadow-lift sm:-right-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50"><BirdMark size={22} /></span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Your AI assistant</p>
            <p className="flex items-center gap-1 text-xs text-ink-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Replies instantly, 24/7</p>
          </div>
        </div>
        <div className="space-y-2 text-[13px] leading-snug">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand-700 px-3 py-2 text-white">Do you have anything Saturday morning?</p>
          <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-ink-100 px-3 py-2 text-ink-800">Yes! 10:00 or 11:30. Want me to book one for you?</p>
        </div>
      </div>

      {/* New lead notification */}
      <div className="animate-float-slow absolute -left-2 top-16 flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-lift sm:-left-10">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600"><Bell size={16} /></span>
        <div>
          <p className="text-xs font-semibold text-ink-900">New lead — sent to your phone</p>
          <p className="text-[11px] text-ink-500">Sarah M. · booked for Saturday</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-10 sm:pb-28 sm:pt-16 lg:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-50/70 to-white" />
      <div className="container-site grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            Websites + AI for small businesses
          </p>

          <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.6rem]">
            Get more customers from your website — <span className="text-brand-700">even while you sleep.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-600 sm:text-xl lg:mx-0">
            Bird Labs builds you a website that clearly sells what you do, adds an AI assistant that answers customers and books appointments 24/7, and follows up with every lead automatically.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary px-6 py-3.5 text-base">
              <Calendar size={18} /> Book a free 15-min call
            </a>
            <button type="button" onClick={() => openChat()} className="btn-secondary px-6 py-3.5 text-base">
              <MessageCircle size={18} /> Ask our AI a question
            </button>
          </div>

          <ul className="mt-8 flex flex-col items-center gap-x-6 gap-y-2 text-[15px] text-ink-600 sm:flex-row sm:justify-center lg:justify-start">
            {promises.map(p => (
              <li key={p} className="flex items-center gap-2">
                <Check size={17} className="text-brand-700" strokeWidth={2.5} /> {p}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}
