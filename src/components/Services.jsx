import { LayoutTemplate, Bot, Workflow, Check, ArrowRight, Compass, Headphones, Sparkles } from 'lucide-react'
import Reveal from './Reveal'
import { openChat } from '../lib/chat'

const services = [
  {
    icon: LayoutTemplate,
    name: 'Websites',
    title: 'A website that wins you customers',
    body: "Whether you're starting from scratch or your current site isn't working, we design and build a site that makes it obvious what you do and easy to get in touch.",
    gets: ['Custom design for your brand', 'Fast and mobile-friendly', 'Set up to be found on Google', 'Contact forms & online booking', 'Domain, hosting & launch handled'],
    ask: 'What would a new website for my business include?',
  },
  {
    icon: Bot,
    name: 'AI chatbots',
    title: 'An assistant that never misses a customer',
    body: 'A chatbot trained on your services, prices and FAQs that answers in your voice 24/7 — and turns curious visitors into booked appointments.',
    gets: ['Answers questions instantly', 'Collects name, email & phone', 'Books calls and appointments', 'Sends every lead to your phone', 'Hands off to you when needed'],
    ask: 'How would an AI chatbot work for my business?',
    featured: true,
  },
  {
    icon: Workflow,
    name: 'Automation',
    title: 'Follow-up that happens on its own',
    body: 'We connect your forms, email, calendar and CRM so every lead gets a fast reply and a follow-up — without you copying details around.',
    gets: ['Instant email & SMS replies', 'CRM setup (HubSpot, GoHighLevel…)', 'Calendar & payment connections', 'Automatic reminders', 'Hours of admin saved each week'],
    ask: 'What could you automate for my business?',
  },
]

const extras = [
  { icon: Compass, label: 'AI consulting & strategy' },
  { icon: Headphones, label: 'AI customer support' },
  { icon: Sparkles, label: 'Custom AI solutions' },
]

export default function Services() {
  return (
    <section id="services" className="section bg-ink-50/70" aria-labelledby="services-title">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">What we do</p>
          <h2 id="services-title" className="section-title">Three things that bring you more business</h2>
          <p className="section-lead">Pick one, or let us combine them. Everything is set up and looked after by us — you just get the customers.</p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {services.map(({ icon: Icon, name, title, body, gets, ask, featured }, i) => (
            <Reveal
              key={name}
              delay={i * 80}
              className={`card relative flex flex-col p-7 ${featured ? 'ring-2 ring-brand-600 lg:-translate-y-2' : ''}`}
            >
              {featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">Try it live on this page</span>
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white">
                  <Icon size={21} />
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-800">{name}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-2.5 leading-relaxed text-ink-600">{body}</p>
              <p className="mt-6 text-sm font-semibold text-ink-900">What you get</p>
              <ul className="mt-3 flex-1 space-y-2.5">
                {gets.map(g => (
                  <li key={g} className="flex items-start gap-2.5 text-[15px] text-ink-700">
                    <Check size={17} className="mt-0.5 shrink-0 text-brand-700" strokeWidth={2.5} /> {g}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => openChat(ask)} className="mt-7 inline-flex items-center gap-1.5 self-start text-[15px] font-semibold text-brand-700 hover:text-brand-900">
                Ask how this works for you <ArrowRight size={16} />
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
          <span className="text-sm font-medium text-ink-500">Also available:</span>
          {extras.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-700">
              <Icon size={17} className="text-brand-700" /> {label}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
