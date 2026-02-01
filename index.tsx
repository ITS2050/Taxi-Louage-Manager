import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Détection d'environnement robuste pour éviter le crash en preview
// @ts-ignore - Vite injecte import.meta.env au moment du build
const isProd = !!(import.meta.env?.PROD);

// Service Worker avec chemin relatif - Ne s'active qu'en production réelle
if ('serviceWorker' in navigator && isProd) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW Registered', reg.scope))
      .catch(err => console.error('SW Registration Failed', err));
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
