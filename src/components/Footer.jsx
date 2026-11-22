import Logo from './Logo'
import { CALENDLY_URL, WHATSAPP_URL, EMAIL, PHONE_DISPLAY, PHONE_TEL } from '../lib/site'

const columns = [
  {
    title: 'Services',
    links: [
      { label: 'Websites', href: '/#services' },
      { label: 'AI chatbots', href: '/#services' },
      { label: 'Automation', href: '/#services' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'How it works', href: '/#process' },
      { label: 'Our work', href: '/#work' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Contact', href: '/#contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Client login', href: '/portal' },
    ],
  },
  {
    title: 'Get in touch',
    links: [
      { label: 'Book a free call', href: CALENDLY_URL, external: true },
      { label: 'WhatsApp', href: WHATSAPP_URL, external: true },
      { label: EMAIL, href: `mailto:${EMAIL}` },
      { label: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-white pb-24 pt-14 sm:pb-12">
      <div className="container-site">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs leading-relaxed text-ink-600">
              Websites, AI chatbots and automation that help small businesses win more customers.
            </p>
            <p className="mt-4 text-sm text-ink-500">Niagara Falls, Ontario · Since 2022</p>
          </div>
          {columns.map(col => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink-900">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-[15px] text-ink-600 transition hover:text-brand-700"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-ink-100 pt-6 text-sm text-ink-500">
          © {new Date().getFullYear()} Bird Labs. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
