import { useState, useRef, useEffect } from 'react'

export default function ChatInput({ onSend, isLoading, config }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus({ preventScroll: true })
  }, [isLoading])

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Save parent page scroll position before submitting (prevents iframe scroll jump)
      const parentScrollY = window.parent !== window
        ? (() => { try { return window.parent.scrollY } catch { return 0 } })()
        : 0
      submit()
      // Restore parent scroll after submit
      if (parentScrollY && window.parent !== window) {
        try { window.parent.scrollTo({ top: parentScrollY, behavior: 'instant' }) } catch { /* cross-origin parent */ }
      }
    }
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    // Auto-grow textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`
  }

  return (
    <div className="chat-input-area">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={config.placeholder || 'Type your message…'}
          className="chat-textarea"
          rows={1}
          disabled={isLoading}
        />
        <button
          className="send-btn"
          onClick={submit}
          disabled={!value.trim() || isLoading}
          aria-label="Send message"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p className="input-hint">
        {config.inputHint || 'Press Enter to send · Shift+Enter for new line'}
      </p>
    </div>
  )
}
