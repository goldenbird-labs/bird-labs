import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ChatApp from './ChatApp.jsx'
import './chat.css'
import { trackOutboundClicks } from '../lib/track'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChatApp />
  </StrictMode>,
)

trackOutboundClicks()
