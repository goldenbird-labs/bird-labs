import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || 'http://localhost:3001'
const WHATSAPP_URL = 'https://wa.me/19053809763'

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function BirdIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="36" rx="16" ry="12" fill="white" opacity="0.95" />
      <path d="M14 34 C6 26, 8 16, 18 20 C22 22, 26 28, 30 30" fill="white" opacity="0.85" />
      <circle cx="44" cy="26" r="9" fill="white" opacity="0.95" />
      <circle cx="47" cy="24" r="2" fill="#3b82f6" />
      <circle cx="47.7" cy="23.3" r="0.7" fill="white" />
      <path d="M52 26 L57 24 L52 28 Z" fill="#f59e0b" />
      <path d="M14 40 C8 44, 4 50, 10 48 C14 46, 18 42, 22 42" fill="white" opacity="0.8" />
      <line x1="30" y1="47" x2="28" y2="54" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="34" y1="47" x2="36" y2="54" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [showBadge, setShowBadge] = useState(false)

  // Show a notification badge after 5 seconds to catch attention
  useEffect(() => {
    const t = setTimeout(() => setShowBadge(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const handleOpen = () => {
    setOpen(true)
    setShowBadge(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-[370px] sm:w-[400px] rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: '580px', boxShadow: '0 8px 60px rgba(99,102,241,0.35), 0 2px 20px rgba(0,0,0,0.4)' }}
          >
            {/* Close button overlay */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X size={14} className="text-white" />
            </button>

            {/* iframe — the full chatbot app */}
            <iframe
              src={CHATBOT_URL}
              title="Birdie — Bird Labs Assistant"
              className="w-full h-full border-0"
              allow="microphone"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp button */}
      <motion.a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2.5 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.45)',
        }}
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon size={18} />
        <span>WhatsApp Us</span>
      </motion.a>

      {/* Floating trigger button */}
      <motion.button
        onClick={open ? () => setOpen(false) : handleOpen}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center gap-2.5 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-xl transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          boxShadow: '0 4px 24px rgba(124, 58, 237, 0.55)',
        }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-purple-500 opacity-20 pointer-events-none" />
        )}

        {/* Notification badge */}
        <AnimatePresence>
          {showBadge && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#080818] flex items-center justify-center"
            >
              <span className="text-[9px] font-bold text-white leading-none">1</span>
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <BirdIcon size={22} />
              <span>Chat with Birdie</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
