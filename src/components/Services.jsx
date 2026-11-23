import { LayoutTemplate, Bot, Workflow, Check, ArrowRight, Compass, Headphones, Sparkles } from 'lucide-react'
import Reveal from './Reveal'
import { openChat } from '../lib/chat'
import { WebsiteArt, ChatArt, AutomationArt } from './Art'

const services = [
  {
    icon: LayoutTemplate,
    name: 'Websites',
    art: WebsiteArt,
    title: 'A website that wins you customers',
    body: "Whether you're starting from scratch or your current site isn't working, we design and build a site that makes it obvious what you do and easy to get in touch.",
    gets: ['Custom design for your brand', 'Fast and mobile-friendly', 'Set up to be found on Google', 'Contact forms & online booking', 'Domain, hosting & launch handled'],
    ask: 'What would a new website for my business include?',
  },
  {
    icon: Bot,
    name: 'AI chatbots',
    art: ChatArt,
    title: 'An assistant that never misses a customer',
    body: 'A chatbot trained on your services, prices and FAQs that answers in your voice 24/7 — and turns curious visitors into booked appointments.',
    gets: ['Answers questions instantly', 'Collects name, email & phone', 'Books calls and appointments', 'Sends every lead to your phone', 'Hands off to you when needed'],
    ask: 'How would an AI chatbot work for my business?',
    featured: true,
  },
  {
    icon: Workflow,
    name: 'Automation',
    art: AutomationArt,
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
    <section id="services" className="section relative isolate overflow-hidden bg-ink-50/70" aria-labelledby="services-title">
      <div className="aurora-blob left-1/2 top-1/3 h-[28rem] w-[46rem] -translate-x-1/2 bg-brand-200" style={{ opacity: 0.35, animation: 'none' }} />
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">What we do</p>
          <h2 id="services-title" className="section-title">Three things that bring you more business</h2>
          <p className="section-lead">Pick one, or let us combine them. Everything is set up and looked after by us — you just get the customers.</p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {services.map(({ icon: Icon, art: Art, name, title, body, gets, ask, featured }, i) => {
            const card = (
              <div className="group relative flex h-full flex-col rounded-[1.15rem] bg-white p-3">
                <Art />
                <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-fuchsia-600 text-white shadow-sm">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wide text-brand-800">{name}</span>
                    {featured && <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">Try it live</span>}
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{title}</h3>
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
                    Ask how this works for you <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            )
            return (
              <Reveal key={name} delay={i * 80} className={featured ? 'glow-border lg:-translate-y-3' : 'rounded-[1.25rem] border border-ink-200/80 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift'}>
                {card}
              </Reveal>
            )
          })}
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
