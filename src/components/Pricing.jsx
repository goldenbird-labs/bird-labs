import { Calendar, Check, MessageCircle } from 'lucide-react'
import Reveal from './Reveal'
import { CALENDLY_URL } from '../lib/site'
import { openChat } from '../lib/chat'

const included = [
  'Free consultation and demo',
  'Design, setup and launch done for you',
  'Ongoing support and updates included',
  'Cancel any time with 30 days’ notice',
]

export default function Pricing() {
  return (
    <section id="pricing" className="section" aria-labelledby="pricing-title">
      <div className="container-site">
        <Reveal className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold text-brand-300">Pricing</p>
              <h2 id="pricing-title" className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Simple monthly plans. No surprises.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-300">
                Every business is different, so we quote after a free call — and we only recommend what will actually bring you customers.
              </p>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-sm text-ink-300">From</span>
                <span className="font-display text-5xl font-extrabold leading-none text-white">$69</span>
                <span className="pb-1 text-ink-300">/ month + tax</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
              <p className="font-semibold text-white">Every plan includes</p>
              <ul className="mt-4 space-y-3">
                {included.map(x => (
                  <li key={x} className="flex items-start gap-3 text-ink-200">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn flex-1 bg-white text-ink-900 hover:bg-brand-50">
                  <Calendar size={18} /> Get my quote
                </a>
                <button type="button" onClick={() => openChat('How much would it cost for my business?')} className="btn flex-1 border border-white/20 text-white hover:bg-white/10">
                  <MessageCircle size={18} /> Ask about pricing
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
