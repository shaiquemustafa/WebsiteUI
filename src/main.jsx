import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Meta: persist fbclid from ad landing so CAPI can send fbc on later steps (OTP, watchlist) after SPA navigation
try {
  const fbclid = new URLSearchParams(window.location.search).get('fbclid')
  if (fbclid) {
    localStorage.setItem('rito_fbclid', fbclid)
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
