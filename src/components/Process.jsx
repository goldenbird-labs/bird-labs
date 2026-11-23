import { Calendar } from 'lucide-react'
import Reveal from './Reveal'
import { CALENDLY_URL } from '../lib/site'

const steps = [
  { title: 'Free 15-minute call', body: 'Tell us about your business and where customers are slipping away. No pressure, no jargon.' },
  { title: 'A clear plan & quote', body: "We recommend only what you need and give you a clear monthly price before anything starts." },
  { title: 'We build it', body: 'We design, write, set up and test everything. Most projects go live in 1–3 weeks.' },
  { title: 'Launch & ongoing support', body: "We show you how it works, watch the results and keep improving it. Support is included." },
]

export default function Process() {
  return (
    <section id="process" className="section" aria-labelledby="process-title">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">How it works</p>
            <h2 id="process-title" className="section-title">From first call to live in <span className="text-gradient-brand">as little as a week</span></h2>
            <p className="section-lead">You don't need to be technical. We do the work and keep you in the loop in plain English.</p>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">
              <Calendar size={18} /> Start with a free call
            </a>
          </Reveal>

          <ol className="relative space-y-5">
            <span aria-hidden="true" className="absolute bottom-10 left-[2.75rem] top-10 w-0.5 rounded-full bg-gradient-to-b from-brand-500 via-fuchsia-500 to-sky-500 opacity-40" />
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 70} className="card relative flex gap-5 p-6 transition hover:shadow-lift">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-fuchsia-600 font-display text-lg font-extrabold text-white shadow-[0_6px_20px_-4px_rgba(124,58,237,0.6)] ring-4 ring-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-ink-600">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
