import React from 'react';
import { Download, Wifi, WifiOff, RefreshCw, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import './PWAStatus.css';

const PWAStatus: React.FC = React.memo(() => {
  const { 
    isOnline, 
    canInstall, 
    updateAvailable, 
    isInstalled,
    installApp, 
    updateApp, 
    dismissUpdate 
  } = usePWA();

  // Don't show anything if everything is normal
  if (isOnline && !canInstall && !updateAvailable && !isInstalled) {
    return null;
  }

  return (
    <div className="pwa-status">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="pwa-notification offline">
          <WifiOff size={20} />
          <span>Sin conexión a internet</span>
          <small>Algunas funciones pueden estar limitadas</small>
        </div>
      )}

      {/* Install prompt */}
      {canInstall && (
        <div className="pwa-notification install">
          <Download size={20} />
          <div className="notification-content">
            <span>Instalar aplicación</span>
            <small>Instala esta app para un mejor acceso</small>
          </div>
          <button 
            onClick={installApp}
            className="install-btn"
            aria-label="Instalar aplicación"
          >
            Instalar
          </button>
        </div>
      )}

      {/* Update available */}
      {updateAvailable && (
        <div className="pwa-notification update">
          <RefreshCw size={20} />
          <div className="notification-content">
            <span>Actualización disponible</span>
            <small>Hay una nueva versión disponible</small>
          </div>
          <div className="update-actions">
            <button 
              onClick={updateApp}
              className="update-btn"
              aria-label="Actualizar aplicación"
            >
              Actualizar
            </button>
            <button 
              onClick={dismissUpdate}
              className="dismiss-btn"
              aria-label="Descartar actualización"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Online indicator */}
      {isOnline && isInstalled && (
        <div className="pwa-notification online">
          <Wifi size={20} />
          <span>Conectado</span>
        </div>
      )}
    </div>
  );
});

PWAStatus.displayName = 'PWAStatus';

export default PWAStatus;
