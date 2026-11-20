import { useEffect, useState } from 'react'
import { Menu, X, Calendar } from 'lucide-react'
import Logo from './Logo'
import { CALENDLY_URL } from '../lib/site'

const links = [
  { label: 'Services', href: '#services' },
  { label: 'How it works', href: '#process' },
  { label: 'Our work', href: '#work' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-200 ${scrolled || open ? 'border-b border-ink-200/80 bg-white/90 backdrop-blur-md' : 'bg-transparent'}`}>
      <nav className="container-site flex h-16 items-center justify-between sm:h-[72px]" aria-label="Main">
        <a href="#top" aria-label="Bird Labs — home" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-ink-600 transition hover:text-ink-900">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a href="#contact" className="hidden text-[15px] font-medium text-ink-700 hover:text-ink-900 md:inline-block lg:mr-3">
            Contact
          </a>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary hidden py-2.5 sm:inline-flex">
            <Calendar size={16} /> Book a free call
          </a>
          <button
            type="button"
            className="-mr-2 rounded-lg p-2 text-ink-800 lg:hidden"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-ink-100 bg-white lg:hidden">
          <div className="container-site flex flex-col gap-1 py-6">
            {[...links, { label: 'Contact', href: '#contact' }].map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-lg font-semibold text-ink-900 hover:bg-ink-50">
                {l.label}
              </a>
            ))}
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 py-3.5" onClick={() => setOpen(false)}>
              <Calendar size={18} /> Book a free 15-min call
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
