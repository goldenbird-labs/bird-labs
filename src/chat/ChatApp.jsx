import { useState, useEffect, useRef, useCallback } from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import WelcomeScreen from './components/WelcomeScreen'
import TypingIndicator from './components/TypingIndicator'
import { CALENDLY_URL, WHATSAPP_URL } from '../lib/site'
import { track } from '../lib/track'

const embedded = new URLSearchParams(window.location.search).has('embed') && window.parent !== window
const sessionId = (() => {
  try { return crypto.randomUUID() } catch { return String(Math.random()).slice(2) }
})()

const stripLeadData = text => text.replace(/\n?LEAD_DATA:\s*\{.*?\}/s, '').replace(/\n?LEAD_DATA:?\s*\{?[^}]*$/s, '').trim()

function postToParent(message) {
  if (embedded) window.parent.postMessage(message, window.location.origin)
}

export default function ChatApp() {
  const [messages, setMessages] = useState([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)
  const [lastUserMessage, setLastUserMessage] = useState('')
  const messagesEndRef = useRef(null)
  const chatBodyRef = useRef(null)

  useEffect(() => {
    fetch('/api/chat/config')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error())))
      .then(setConfig)
      .catch(() => setError('Birdie could not load. Please check your connection and try again.'))
  }, [])

  useEffect(() => {
    const el = chatBodyRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 300
    if (nearBottom || streamingContent) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, streamingContent])

  const sendMessage = useCallback(async (content, history = messages) => {
    if (!content.trim() || isLoading) return

    setLastUserMessage(content)
    const updated = [...history, { role: 'user', content, timestamp: Date.now() }]
    setMessages(updated)
    setIsLoading(true)
    setStreamingContent('')
    track('chat_message')

    let full = ''
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages: updated.map(({ role, content }) => ({ role, content })) }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let done = false
      while (!done) {
        const chunk = await reader.read()
        if (chunk.done) break
        buffer += decoder.decode(chunk.value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') { done = true; break }
          let parsed
          try { parsed = JSON.parse(payload) } catch { continue }
          if (parsed.error) throw new Error(parsed.error)
          full += parsed.content || ''
          setStreamingContent(stripLeadData(full))
        }
      }

      setStreamingContent('')
      setMessages(prev => [...prev, { role: 'assistant', content: stripLeadData(full), timestamp: Date.now() }])
    } catch (err) {
      setStreamingContent('')
      setMessages(prev => [...prev, { role: 'assistant', content: err.message || 'Sorry, something went wrong.', timestamp: Date.now(), isError: true }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  // Questions sent from buttons on the main site ("Ask how this works for you").
  const sendRef = useRef(sendMessage)
  useEffect(() => { sendRef.current = sendMessage }, [sendMessage])
  useEffect(() => {
    if (!config) return
    const onMessage = e => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'birdie:ask' && e.data.question) sendRef.current(e.data.question)
    }
    window.addEventListener('message', onMessage)
    postToParent({ type: 'birdie:ready' })
    return () => window.removeEventListener('message', onMessage)
  }, [config])

  // Drop the failed user message + error reply, then send the same question again.
  const handleRetry = useCallback(() => {
    sendMessage(lastUserMessage, messages.slice(0, -2))
  }, [lastUserMessage, messages, sendMessage])

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <h2>Unable to connect</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  if (!config) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>
  }

  const onClose = embedded ? () => postToParent({ type: 'birdie:close' }) : undefined

  if (!config.available) {
    return (
      <div className="chat-container">
        <ChatHeader config={config} onClose={onClose} />
        <div className="unavailable">
          <h2 className="welcome-title">Birdie is taking a short break</h2>
          <p className="welcome-message">You can still reach the team straight away:</p>
          <a className="primary" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Book a free 15-min call</a>
          <a className="secondary" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <ChatHeader config={config} onReset={() => { setMessages([]); setStreamingContent('') }} hasMessages={messages.length > 0} onClose={onClose} />

      <div className="chat-body" ref={chatBodyRef}>
        {messages.length === 0 && !streamingContent ? (
          <WelcomeScreen config={config} onSuggestion={q => sendMessage(q)} />
        ) : (
          <div className="messages-list">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} config={config} onRetry={msg.isError ? handleRetry : undefined} />
            ))}
            {streamingContent && (
              <ChatMessage message={{ role: 'assistant', content: streamingContent, timestamp: Date.now() }} config={config} isStreaming />
            )}
            {isLoading && !streamingContent && <TypingIndicator config={config} />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {messages.length >= 2 && (
        <div className="cta-strip">
          <a className="cta-chip" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">📅 Book a free call</a>
          <a className="cta-chip" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">💬 Talk to a person</a>
        </div>
      )}
      <ChatInput onSend={sendMessage} isLoading={isLoading} config={config} />
    </div>
  )
}
