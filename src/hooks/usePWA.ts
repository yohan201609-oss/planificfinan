import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  installPrompt: any;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    updateAvailable: false,
    installPrompt: null
  });

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
      setPwaState(prev => ({
        ...prev,
        isInstalled: isStandalone || isInStandaloneMode
      }));
    };

    checkInstalled();

    // Handle online/offline status
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setPwaState(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installPrompt: null
      }));
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    setPwaState(prev => ({
      ...prev,
      updateAvailable: needRefresh
    }));
  }, [needRefresh]);

  const installApp = async () => {
    if (pwaState.installPrompt) {
      const result = await pwaState.installPrompt.prompt();
      console.log('Install prompt result:', result);
      setPwaState(prev => ({
        ...prev,
        installPrompt: null,
        canInstall: false
      }));
    }
  };

  const updateApp = () => {
    updateServiceWorker(true);
  };

  return {
    ...pwaState,
    installApp,
    updateApp,
    dismissUpdate: () => setNeedRefresh(false)
  };
};
