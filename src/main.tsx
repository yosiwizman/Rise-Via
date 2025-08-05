import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react"
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: "https://placeholder-dsn@sentry.io/placeholder-project-id",
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
  beforeSend(event) {
    if (import.meta.env.DEV && event.level === 'warning') {
      return null;
    }
    return event;
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
