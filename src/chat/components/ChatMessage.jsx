import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import BirdIcon from './BirdIcon'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMessage({ message, config, isStreaming, onRetry }) {
  const isUser = message.role === 'user'
  const [reaction, setReaction] = useState(null)

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'bot'}`}>
      <div className={`msg-avatar ${isUser ? 'user' : 'bot'}`}>
        {isUser ? '👤' : (config.botEmoji && config.botEmoji !== '✨' ? <span style={{fontSize:'16px'}}>{config.botEmoji}</span> : <BirdIcon size={18} />)}
      </div>

      <div className="msg-col">
        <div
          className={[
            'msg-bubble',
            isUser ? 'user' : 'bot',
            message.isError ? 'error' : '',
            isStreaming ? 'streaming' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isUser ? (
            message.content
          ) : (
            <div className="prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="msg-meta">
          <span className="msg-time">{formatTime(message.timestamp)}</span>

          {!isUser && !isStreaming && (
            <div className="msg-actions">
              {message.isError && onRetry && (
                <button className="retry-btn" onClick={onRetry} title="Retry">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-4.61" />
                  </svg>
                  Retry
                </button>
              )}
              {!message.isError && (
                <div className="reactions">
                  <button
                    className={`reaction-btn ${reaction === 'up' ? 'active' : ''}`}
                    onClick={() => setReaction(reaction === 'up' ? null : 'up')}
                    title="Helpful"
                  >👍</button>
                  <button
                    className={`reaction-btn ${reaction === 'down' ? 'active' : ''}`}
                    onClick={() => setReaction(reaction === 'down' ? null : 'down')}
                    title="Not helpful"
                  >👎</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
