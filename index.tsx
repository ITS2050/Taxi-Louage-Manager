import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Détection d'environnement sans erreur
const isProd = import.meta.env.PROD;

if ('serviceWorker' in navigator && isProd) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
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
