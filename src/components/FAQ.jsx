import { ChevronDown, MessageCircle } from 'lucide-react'
import Reveal from './Reveal'
import { openChat } from '../lib/chat'

const faqs = [
  { q: 'How much does it cost?', a: 'There are three monthly plans (+ tax): Starter at $99 for your website, Growth at $199 to add an AI chatbot, and Pro at $299 to add automatic follow-up and CRM integrations. Not sure which fits? A free 15-minute call will tell you.' },
  { q: 'Why a monthly plan instead of a one-off price?', a: 'Most agencies charge thousands of dollars upfront to build a website, then extra for hosting, changes and anything AI. We spread it into one affordable monthly subscription that already includes hosting, support and updates — so you can get started without a big bill, and cancel with 30 days’ notice if it isn’t working for you.' },
  { q: 'How long does it take?', a: 'Most projects are live within 1–3 weeks, depending on how much we’re building.' },
  { q: 'Do I need to be technical?', a: 'Not at all. We handle the design, setup and launch, then show you how everything works. If anything needs changing, just ask us.' },
  { q: 'Is there a contract?', a: 'To get started we take the first and last month’s payment. After that you can cancel any time with 30 days’ notice.' },
  { q: 'What does the AI chatbot actually do?', a: 'It answers your customers’ questions using information about your business, collects their contact details, books appointments, and sends you every lead straight away. Want to see one? The assistant in the corner of this page is one we built.' },
  { q: 'I already have a website. Can you still help?', a: 'Yes. We can redesign it, or keep it and add a chatbot and automatic follow-up to what you already have.' },
  { q: 'Is support included?', a: 'Yes. Every plan includes support hours each month — 2 hours on Starter, 3 on Growth and 4 on Pro — for changes, updates and help. You get your own client portal to send us requests, follow progress and see how many hours you’ve used.' },
  { q: 'Where are you based?', a: 'We’re based in Niagara Falls, Ontario, and work with businesses anywhere. Our hours are Monday–Friday, 9am–5pm Eastern.' },
]

export default function FAQ() {
  return (
    <section id="faq" className="section bg-ink-50/70" aria-labelledby="faq-title">
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="section-title">Questions? Answered.</h2>
          <p className="section-lead">Can’t find what you’re looking for? Our AI assistant can answer instantly, or you can reach a real person on WhatsApp.</p>
          <button type="button" onClick={() => openChat()} className="btn-secondary mt-6">
            <MessageCircle size={18} /> Ask a question
          </button>
        </Reveal>

        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-semibold text-ink-900">
                {q}
                <ChevronDown size={20} className="shrink-0 text-ink-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="-mt-1 px-6 pb-6 leading-relaxed text-ink-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
