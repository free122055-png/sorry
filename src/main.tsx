import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle global chunk load errors (failed to fetch dynamically imported module)
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('Failed to fetch dynamically imported module') || 
    event.message.includes('Importing a discontinued module')
  )) {
    console.warn('Chunk load error detected, reloading for fresh bundle...', event.message);
    const lastReload = sessionStorage.getItem('vite_chunk_reload_time');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 3000) {
      sessionStorage.setItem('vite_chunk_reload_time', now.toString());
      window.location.reload();
    }
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
