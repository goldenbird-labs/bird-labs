import BirdIcon from './BirdIcon'

export default function TypingIndicator({ config }) {
  return (
    <div className="typing-wrapper">
      <div className="msg-avatar bot">
        {config?.botEmoji && config.botEmoji !== '✨'
          ? <span style={{fontSize:'16px'}}>{config.botEmoji}</span>
          : <BirdIcon size={18} />}
      </div>
      <div className="typing-bubble">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  )
}
