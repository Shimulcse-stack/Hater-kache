import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './LanguageContext.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';

// Catch and suppress benign Vite WebSocket HMR errors in sandboxed preview mode
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason &&
      (reason === 'WebSocket closed without opened.' ||
        (typeof reason === 'string' && reason.includes('WebSocket')) ||
        (reason.message && reason.message.includes('WebSocket')))
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);


