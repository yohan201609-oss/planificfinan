import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Forzar actualización del Service Worker - VERSIÓN 2.0
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
  
  // Limpiar caché del navegador
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  // Forzar recarga después de 2 segundos
  setTimeout(() => {
    window.location.reload(true);
  }, 2000);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
