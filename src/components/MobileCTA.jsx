import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { CALENDLY_URL, WHATSAPP_URL } from '../lib/site'
import { WhatsAppIcon } from './Icons'

// Sticky booking bar on phones, shown once the visitor scrolls past the hero.
export default function MobileCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-300 sm:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      aria-hidden={!show}
    >
      <div className="flex gap-2 pr-16">
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1} className="btn-primary flex-1 py-3">
          <Calendar size={18} /> Book a free call
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" tabIndex={show ? 0 : -1} className="btn-whatsapp px-4 py-3" aria-label="WhatsApp us">
          <WhatsAppIcon size={20} />
        </a>
      </div>
    </div>
  )
}
