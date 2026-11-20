import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'

const clients = [
  {
    name: 'Pocket Full of Help',
    industry: 'Virtual assistant services',
    blurb: 'Website design and development for a virtual assistant business.',
    url: 'https://www.pocketfullofhelp.com/',
    logo: 'https://www.pocketfullofhelp.com/pocket%20full%20logo.png',
  },
  {
    name: 'G & V Group',
    industry: 'Real estate · California & Florida',
    blurb: 'A real estate platform with AI-powered property search.',
    url: 'https://gandvgroup.com/',
    logo: 'https://gandvgroup.com/favicon.png',
  },
  {
    name: 'Bellissimo International',
    industry: 'Modeling & talent agency',
    blurb: 'A website for an international modeling and talent agency.',
    url: 'https://bellissimo-international-production.up.railway.app/',
    logo: null,
  },
]

const industries = ['Local services', 'Coaches & consultants', 'Real estate', 'Health & wellness', 'E-commerce', 'Agencies']

function ClientLogo({ client }) {
  const [failed, setFailed] = useState(false)
  if (!client.logo || failed) {
    return <span className="font-display text-2xl font-extrabold text-ink-700">{client.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
  }
  return <img src={client.logo} alt="" loading="lazy" className="max-h-16 max-w-[70%] object-contain" onError={() => setFailed(true)} />
}

export default function Work() {
  return (
    <section id="work" className="section bg-ink-50/70" aria-labelledby="work-title">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our work</p>
          <h2 id="work-title" className="section-title">Businesses we've helped get online</h2>
          <p className="section-lead">Real clients, real websites — have a look.</p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {clients.map((c, i) => (
            <Reveal key={c.name} delay={i * 80}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex h-36 items-center justify-center border-b border-ink-100 bg-white">
                  <ClientLogo client={c} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-sm font-medium text-brand-800">{c.industry}</p>
                  <h3 className="mt-1 text-lg font-bold">{c.name}</h3>
                  <p className="mt-2 flex-1 leading-relaxed text-ink-600">{c.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[15px] font-semibold text-ink-900 group-hover:text-brand-700">
                    Visit site <ArrowUpRight size={16} />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <p className="text-sm font-semibold text-ink-500">We work with</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
            {industries.map(x => (
              <li key={x} className="rounded-full border border-ink-200 bg-white px-4 py-2 text-[15px] font-medium text-ink-700">{x}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
