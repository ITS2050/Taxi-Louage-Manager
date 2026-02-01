import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Gestionnaire d'erreurs global pour le débogage visuel si nécessaire
window.addEventListener('error', (e) => {
  console.error('Global Error:', e.error);
});

// Enregistrement du Service Worker uniquement si supporté et pas en mode dev local strict
// On utilise un try/catch silencieux pour ne jamais bloquer l'app
const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('SW registered', reg);
    } catch (e) {
      console.log('SW registration failed (expected in some previews)', e);
    }
  }
};

registerSW();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
