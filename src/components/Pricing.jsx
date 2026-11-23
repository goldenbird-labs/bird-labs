import { Calendar, Check, MessageCircle } from 'lucide-react'
import Reveal from './Reveal'
import { CALENDLY_URL } from '../lib/site'
import { openChat } from '../lib/chat'

const plans = [
  {
    name: 'Starter',
    price: 99,
    tagline: 'A professional website that brings in enquiries.',
    features: ['Website design & development', 'Hosting & domain handled', 'Mobile-friendly and Google-ready', 'Contact form with instant lead alerts', '2 hours of support every month'],
  },
  {
    name: 'Growth',
    price: 199,
    tagline: 'Your website plus an AI assistant that works 24/7.',
    features: ['Everything in Starter', 'AI chatbot trained on your business', 'Lead capture & appointment booking', 'Every lead sent straight to your phone', '3 hours of support every month'],
    featured: true,
  },
  {
    name: 'Pro',
    price: 299,
    tagline: 'The full system — nothing slips through the cracks.',
    features: ['Everything in Growth', 'Automatic email & SMS follow-up', 'CRM setup & integrations', 'Monthly results review', '4 hours of support every month'],
  },
]

const allPlans = ['No big upfront build fee', 'Your own client portal for requests', 'Setup and launch done for you', 'Cancel any time with 30 days’ notice']

export default function Pricing() {
  return (
    <section id="pricing" className="section" aria-labelledby="pricing-title">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Pricing</p>
          <h2 id="pricing-title" className="section-title">No $1,000s upfront. <span className="text-gradient-brand">Just one simple monthly plan.</span></h2>
          <p className="section-lead">
            Agencies often charge thousands of dollars to build a website — and more again for a chatbot. We keep it cost-effective: one affordable monthly subscription covers design, hosting, AI and support. Start where you are and move up any time.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, i) => (
            <Reveal
              key={plan.name}
              delay={i * 80}
              className={`relative isolate flex flex-col overflow-hidden rounded-3xl p-7 sm:p-8 ${plan.featured ? 'stage text-white shadow-[0_30px_70px_-20px_rgba(124,58,237,0.65)] ring-1 ring-brand-400/40 lg:-my-3 lg:py-11' : 'card transition duration-300 hover:-translate-y-1 hover:shadow-lift'}`}
            >
              {plan.featured && <>
                <div aria-hidden="true" className="aurora-blob -right-20 -top-24 h-64 w-64 bg-brand-600" style={{ filter: 'blur(60px)', opacity: 0.6 }} />
                <div aria-hidden="true" className="aurora-blob -bottom-24 -left-16 h-56 w-56 bg-fuchsia-600" style={{ filter: 'blur(60px)', opacity: 0.35, animationDelay: '-8s' }} />
              </>}
              {plan.featured && (
                <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-lg sm:right-8 lg:top-10">Most popular</span>
              )}
              <h3 className={`text-lg font-bold ${plan.featured ? 'text-white' : ''}`}>{plan.name}</h3>
              <p className={`mt-1.5 text-[15px] leading-relaxed ${plan.featured ? 'text-ink-300' : 'text-ink-600'}`}>{plan.tagline}</p>
              <p className="mt-6 flex items-end gap-1.5">
                <span className={`font-display text-5xl font-extrabold leading-none ${plan.featured ? 'text-white' : 'text-ink-900'}`}>${plan.price}</span>
                <span className={`pb-1 text-[15px] ${plan.featured ? 'text-ink-300' : 'text-ink-500'}`}>/ month + tax</span>
              </p>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-start gap-3 text-[15px] ${plan.featured ? 'text-ink-100' : 'text-ink-700'}`}>
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.featured ? 'bg-brand-500/25 text-brand-200' : 'bg-brand-50 text-brand-700'}`}>
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn mt-8 w-full py-3.5 ${plan.featured ? 'bg-white text-ink-900 hover:bg-brand-50' : 'bg-brand-700 text-white hover:bg-brand-800'}`}
              >
                <Calendar size={18} /> Get started with {plan.name}
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex flex-col items-center gap-5 text-center">
          <ul className="flex flex-col gap-x-8 gap-y-2 text-[15px] text-ink-600 sm:flex-row">
            {allPlans.map(x => (
              <li key={x} className="flex items-center justify-center gap-2">
                <Check size={17} className="text-brand-700" strokeWidth={2.5} /> {x}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => openChat('Which plan would be right for my business?')} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-700 hover:text-brand-900">
            <MessageCircle size={17} /> Not sure which plan? Ask Birdie
          </button>
        </Reveal>
      </div>
    </section>
  )
}
