import { Calendar, MessageCircle } from 'lucide-react'
import Reveal from './Reveal'
import { BirdMark } from './Logo'
import { CALENDLY_URL } from '../lib/site'
import { openChat } from '../lib/chat'

export default function FinalCTA() {
  return (
    <section className="px-2 py-10 sm:px-3 sm:py-14" aria-labelledby="cta-title">
      <Reveal className="stage grain mx-auto max-w-[78rem] rounded-[1.75rem] px-6 py-16 text-center sm:rounded-[2.25rem] sm:py-24">
        <div aria-hidden="true" className="aurora-blob -left-24 -top-32 h-96 w-96 bg-brand-600" />
        <div aria-hidden="true" className="aurora-blob -bottom-40 -right-16 h-[26rem] w-[26rem] bg-fuchsia-600" style={{ opacity: 0.4, animationDelay: '-9s' }} />
        <div aria-hidden="true" className="aurora-blob -bottom-48 left-1/3 h-80 w-[30rem] bg-sky-500" style={{ opacity: 0.25, animationDelay: '-4s' }} />
        <div className="grid-lines" />
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_0_60px_-5px_rgba(167,139,250,0.9)]">
          <BirdMark size={42} />
        </span>
        <h2 id="cta-title" className="mx-auto mt-8 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Your next customer is looking for you <span className="text-gradient">right now.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
          Let’s make sure they find you, trust you and book with you. A free 15-minute call is all it takes to get started.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn bg-white px-7 py-4 text-base text-ink-900 shadow-[0_8px_30px_-6px_rgba(167,139,250,0.8)] hover:bg-brand-50">
            <Calendar size={18} /> Book a free call
          </a>
          <button type="button" onClick={() => openChat()} className="btn border border-white/20 bg-white/5 px-7 py-4 text-base text-white backdrop-blur hover:bg-white/10">
            <MessageCircle size={18} /> Chat with Birdie
          </button>
        </div>
        <p className="mt-6 text-sm text-white/50">Plans from $99/month · No big upfront cost · Cancel with 30 days’ notice</p>
      </Reveal>
    </section>
  )
}
