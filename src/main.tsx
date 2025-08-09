import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PerformanceMonitor } from './utils/performance'

if (typeof window !== 'undefined') {
  (window as typeof window & { React?: typeof React }).React = React;
}

PerformanceMonitor.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
