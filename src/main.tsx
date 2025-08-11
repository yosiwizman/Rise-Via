import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PerformanceMonitor } from './utils/performance'

if (typeof window !== 'undefined') {
  (window as typeof window & { React?: typeof React }).React = React;
}

PerformanceMonitor.init();

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('❌ Fatal error during app initialization:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
        <h2>Fatal Error</h2>
        <p>The application failed to initialize: ${error instanceof Error ? error.message : String(error)}</p>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
  }
}
