import BirdIcon from './BirdIcon'

export default function WelcomeScreen({ config, onSuggestion }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-avatar">
        <BirdIcon size={40} />
      </div>
      <h1 className="welcome-title">{config.welcomeTitle}</h1>
      <p className="welcome-message">{config.welcomeMessage}</p>

      {config.suggestions?.length > 0 && (
        <>
          <p className="suggestions-label">Popular questions</p>
          <div className="suggestions-grid">
            {config.suggestions.map(text => (
              <button key={text} className="suggestion-chip" onClick={() => onSuggestion(text)}>
                {text}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
