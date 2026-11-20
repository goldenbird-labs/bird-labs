import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { BirdMark } from './Logo'
import { track } from '../lib/track'

const GREETING_DELAY_MS = 15000

// Floating Birdie launcher. The chat itself lives at /chat.html (same app) inside an iframe,
// which keeps its styles separate from the site and preserves the conversation once opened.
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [src, setSrc] = useState(null)
  const [greeting, setGreeting] = useState(false)
  const iframeRef = useRef(null)
  const ready = useRef(false)
  const pending = useRef(null)

  const show = useCallback(question => {
    setGreeting(false)
    try { sessionStorage.setItem('bl_greeted', '1') } catch { /* ignore */ }
    setOpen(true)
    track('chat_open')
    if (question) {
      if (ready.current) iframeRef.current?.contentWindow?.postMessage({ type: 'birdie:ask', question }, window.location.origin)
      else pending.current = question
    }
    setSrc(s => s || '/chat.html?embed=1')
  }, [])

  useEffect(() => {
    const onOpen = e => show(e.detail?.question)
    const onMessage = e => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'birdie:close') setOpen(false)
      if (e.data?.type === 'birdie:ready') {
        ready.current = true
        if (pending.current) {
          iframeRef.current?.contentWindow?.postMessage({ type: 'birdie:ask', question: pending.current }, window.location.origin)
          pending.current = null
        }
      }
    }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('birdie:open', onOpen)
    window.addEventListener('message', onMessage)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('birdie:open', onOpen)
      window.removeEventListener('message', onMessage)
      window.removeEventListener('keydown', onKey)
    }
  }, [show])

  // A gentle, one-time greeting per visit.
  useEffect(() => {
    let greeted = false
    try { greeted = sessionStorage.getItem('bl_greeted') === '1' } catch { /* ignore */ }
    if (greeted) return
    const t = setTimeout(() => setGreeting(true), GREETING_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const dismissGreeting = () => {
    setGreeting(false)
    try { sessionStorage.setItem('bl_greeted', '1') } catch { /* ignore */ }
  }

  useEffect(() => {
    if (open) iframeRef.current?.focus()
  }, [open])

  return (
    <>
      {src && (
        <div
          className={`fixed z-50 overflow-hidden bg-white shadow-2xl transition duration-200 inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100vh-8rem))] sm:w-[400px] sm:rounded-2xl sm:border sm:border-ink-200 ${open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0'}`}
          role="dialog"
          aria-label="Chat with Birdie, the Bird Labs assistant"
          aria-hidden={!open}
        >
          <iframe ref={iframeRef} src={src} title="Birdie — Bird Labs assistant" className="h-full w-full border-0" />
        </div>
      )}

      {greeting && !open && (
        <div className="animate-pop-in fixed bottom-[5.5rem] right-4 z-40 w-[min(300px,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-white p-4 pr-9 shadow-lift sm:bottom-24 sm:right-6">
          <button type="button" onClick={dismissGreeting} className="absolute right-2 top-2 rounded-md p-1 text-ink-400 hover:text-ink-700" aria-label="Dismiss">
            <X size={16} />
          </button>
          <button type="button" onClick={() => show()} className="text-left">
            <p className="text-sm font-semibold text-ink-900">Hi, I'm Birdie 👋</p>
            <p className="mt-1 text-sm leading-snug text-ink-600">Want to know what a website or AI assistant could do for your business? Ask me anything.</p>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : show())}
        className={`fixed bottom-3 right-4 z-50 flex h-14 items-center gap-2 rounded-full bg-brand-700 pl-2 text-white shadow-lift transition hover:bg-brand-800 sm:bottom-6 sm:right-6 ${open ? 'w-14 justify-center pl-0 max-sm:hidden' : 'pr-2 sm:pr-5'}`}
        aria-label={open ? 'Close chat' : 'Chat with Birdie, our AI assistant'}
        aria-expanded={open}
      >
        {open ? (
          <X size={24} />
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <BirdMark size={30} />
            </span>
            <span className="hidden text-[15px] font-semibold sm:inline">Ask Birdie</span>
          </>
        )}
      </button>
    </>
  )
}
