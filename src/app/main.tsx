import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@styles/global.css';
import { App } from './App';
import { registerServiceWorker } from './registerServiceWorker';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root is missing from index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerServiceWorker();
