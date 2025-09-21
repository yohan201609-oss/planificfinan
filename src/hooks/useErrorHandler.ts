import { useState, useCallback } from 'react';
import { Alert } from '../types';

interface ErrorHandlerState {
  errors: Record<string, string>;
  alert: Alert | null;
}

export const useErrorHandler = () => {
  const [state, setState] = useState<ErrorHandlerState>({
    errors: {},
    alert: null
  });

  const setError = useCallback((field: string, message: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: message
      }
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return {
        ...prev,
        errors: newErrors
      };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {}
    }));
  }, []);

  const showAlert = useCallback((message: string, type: Alert['type'] = 'error') => {
    setState(prev => ({
      ...prev,
      alert: {
        show: true,
        message,
        type
      }
    }));

    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        alert: null
      }));
    }, 5000);
  }, []);

  const hideAlert = useCallback(() => {
    setState(prev => ({
      ...prev,
      alert: null
    }));
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage: string = 'Ocurrió un error inesperado'
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      console.error('Async error:', error);
      showAlert(errorMessage);
      return null;
    }
  }, [showAlert]);

  const handleStorageError = useCallback((operation: string, error: Error) => {
    console.error(`Storage error during ${operation}:`, error);
    showAlert(`Error al ${operation}. Verifica que tu navegador soporte localStorage.`);
  }, [showAlert]);

  return {
    errors: state.errors,
    alert: state.alert,
    setError,
    clearError,
    clearAllErrors,
    showAlert,
    hideAlert,
    handleAsyncError,
    handleStorageError
  };
};
