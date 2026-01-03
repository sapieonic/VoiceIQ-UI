import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTelemetry, FaroErrorBoundary } from './telemetry'
import './index.css'
import App from './App.tsx'

// Initialize Faro telemetry before rendering
initTelemetry()

// Error fallback component - receives { error } from FaroErrorBoundary
const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Something went wrong</h1>
    <p>{error.message}</p>
    <button onClick={() => window.location.reload()}>Reload</button>
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FaroErrorBoundary
      fallback={(error: Error) => <ErrorFallback error={error} />}
    >
      <App />
    </FaroErrorBoundary>
  </StrictMode>,
)
