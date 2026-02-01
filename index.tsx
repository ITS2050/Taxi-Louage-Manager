import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Détection sécurisée de l'environnement pour éviter l'erreur 'undefined'
const isProd = (() => {
  try {
    // @ts-ignore - Vite injecte import.meta.env
    return !!(import.meta.env?.PROD || process.env?.NODE_ENV === 'production');
  } catch (e) {
    return false;
  }
})();

// Enregistrement du Service Worker uniquement en production
if ('serviceWorker' in navigator && isProd) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered');
    }).catch(err => {
      console.log('SW failed', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
