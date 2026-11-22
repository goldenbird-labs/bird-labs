import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import CareersPage from './CareersPage.jsx'
import { track, trackOutboundClicks } from '../lib/track'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CareersPage />
  </StrictMode>,
)

track('pageview')
trackOutboundClicks()
