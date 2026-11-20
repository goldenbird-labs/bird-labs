import { MoonStar, MonitorSmartphone, Hourglass, ArrowDown } from 'lucide-react'
import Reveal from './Reveal'

const problems = [
  {
    icon: MoonStar,
    problem: 'Customers message after hours — and nobody answers.',
    fix: 'An AI assistant on your website replies in seconds, day or night, answers their questions and takes their details.',
  },
  {
    icon: MonitorSmartphone,
    problem: "Your website is outdated, confusing — or you don't have one.",
    fix: 'We build a fast, mobile-friendly site that tells visitors exactly what you do and why to choose you.',
  },
  {
    icon: Hourglass,
    problem: 'Leads go cold because follow-up takes too long.',
    fix: 'Every new enquiry gets an instant reply, lands on your phone, and is followed up automatically.',
  },
]

export default function Problems() {
  return (
    <section className="section" aria-labelledby="problems-title">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Sound familiar?</p>
          <h2 id="problems-title" className="section-title">You're busy running your business. Your website should be bringing in work.</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {problems.map(({ icon: Icon, problem, fix }, i) => (
            <Reveal key={problem} delay={i * 80} className="card flex flex-col overflow-hidden">
              <div className="flex-1 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                  <Icon size={21} />
                </span>
                <p className="mt-4 text-lg font-semibold leading-snug text-ink-900">{problem}</p>
              </div>
              <div className="border-t border-brand-100 bg-brand-50/60 p-6">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-800">
                  <ArrowDown size={15} /> How we fix it
                </p>
                <p className="mt-2 leading-relaxed text-ink-700">{fix}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
