import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTelemetry } from './telemetry'
import './index.css'
import App from './App.tsx'

// Initialize OpenTelemetry before rendering
initTelemetry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
