import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PerformanceMonitor } from './utils/performance'

if (typeof window !== 'undefined') {
  (window as typeof window & { React?: typeof React }).React = React;
}

console.log('🔵 Starting app initialization...');
console.log('🔵 Environment:', import.meta.env.MODE);
console.log('🔵 DATABASE_URL available:', !!import.meta.env.VITE_DATABASE_URL);

PerformanceMonitor.init();

try {
  console.log('🔵 Creating React root...');
  const root = createRoot(document.getElementById('root')!);
  console.log('🔵 Rendering App component...');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Fatal error during app initialization:', error);
  console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
  console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
        <h2>Fatal Error</h2>
        <p>The application failed to initialize: ${error instanceof Error ? error.message : String(error)}</p>
        <p>Please check the browser console for more details.</p>
        <details>
          <summary>Technical Details</summary>
          <pre>${error instanceof Error ? error.stack : 'No stack trace available'}</pre>
        </details>
      </div>
    `;
  }
}
