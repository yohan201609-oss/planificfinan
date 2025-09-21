import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';

interface OfflineQueue {
  id: string;
  action: 'add' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueue[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToOfflineQueue = useCallback((action: OfflineQueue['action'], data: any) => {
    if (!isOnline) {
      const queueItem: OfflineQueue = {
        id: Date.now().toString(),
        action,
        data,
        timestamp: Date.now()
      };

      setOfflineQueue(prev => [...prev, queueItem]);
      
      // Store in localStorage as backup
      const storedQueue = JSON.parse(localStorage.getItem('planificfinan-offline-queue') || '[]');
      storedQueue.push(queueItem);
      localStorage.setItem('planificfinan-offline-queue', JSON.stringify(storedQueue));
    }
  }, [isOnline]);

  const processOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;

    const storedQueue = JSON.parse(localStorage.getItem('planificfinan-offline-queue') || '[]');
    
    for (const item of storedQueue) {
      try {
        // Here you would typically sync with your backend
        console.log('Processing offline action:', item);
        
        // For now, we'll just simulate successful processing
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Failed to process offline action:', error);
        // Keep the item in queue for retry
        continue;
      }
    }

    // Clear processed items
    setOfflineQueue([]);
    localStorage.removeItem('offline-queue');
  }, [isOnline, offlineQueue]);

  const saveTransactionOffline = useCallback((transaction: Transaction) => {
    if (!isOnline) {
      addToOfflineQueue('add', transaction);
      
      // Also save to localStorage for immediate UI update
      const offlineTransactions = JSON.parse(
        localStorage.getItem('planificfinan-offline-transactions') || '[]'
      );
      offlineTransactions.push(transaction);
      localStorage.setItem('planificfinan-offline-transactions', JSON.stringify(offlineTransactions));
    }
  }, [isOnline, addToOfflineQueue]);

  const deleteTransactionOffline = useCallback((transactionId: string) => {
    if (!isOnline) {
      addToOfflineQueue('delete', { id: transactionId });
      
      // Remove from localStorage for immediate UI update
      const offlineTransactions = JSON.parse(
        localStorage.getItem('planificfinan-offline-transactions') || '[]'
      );
      const updatedTransactions = offlineTransactions.filter(
        (t: Transaction) => t.id !== transactionId
      );
      localStorage.setItem('planificfinan-offline-transactions', JSON.stringify(updatedTransactions));
    }
  }, [isOnline, addToOfflineQueue]);

  const getOfflineTransactions = useCallback((): Transaction[] => {
    return JSON.parse(localStorage.getItem('planificfinan-offline-transactions') || '[]');
  }, []);

  const clearOfflineData = useCallback(() => {
    setOfflineQueue([]);
    localStorage.removeItem('planificfinan-offline-queue');
    localStorage.removeItem('planificfinan-offline-transactions');
  }, []);

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline) {
      processOfflineQueue();
    }
  }, [isOnline, processOfflineQueue]);

  // Load queue from localStorage on mount
  useEffect(() => {
    const storedQueue = JSON.parse(localStorage.getItem('planificfinan-offline-queue') || '[]');
    setOfflineQueue(storedQueue);
  }, []);

  return {
    isOnline,
    offlineQueue,
    saveTransactionOffline,
    deleteTransactionOffline,
    getOfflineTransactions,
    clearOfflineData,
    processOfflineQueue
  };
};
