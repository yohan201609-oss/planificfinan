import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';

interface CloudSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
  pendingChanges: number;
}

interface CloudConfig {
  apiEndpoint: string;
  apiKey: string;
  userId: string;
  autoSyncInterval: number; // in minutes
}

export const useCloudSync = (config: CloudConfig) => {
  const [syncState, setSyncState] = useState<CloudSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    syncError: null,
    pendingChanges: 0
  });

  // Check online status
  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (syncState.isOnline && syncState.pendingChanges > 0) {
      syncToCloud();
    }
  }, [syncState.isOnline, syncState.pendingChanges]);

  // Auto-sync interval
  useEffect(() => {
    if (config.autoSyncInterval > 0) {
      const interval = setInterval(() => {
        if (syncState.isOnline && syncState.pendingChanges > 0) {
          syncToCloud();
        }
      }, config.autoSyncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [config.autoSyncInterval, syncState.isOnline, syncState.pendingChanges]);

  const syncToCloud = useCallback(async (transactions?: Transaction[]) => {
    if (!syncState.isOnline || syncState.isSyncing) return;

    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const dataToSync = transactions || JSON.parse(
        localStorage.getItem('planificfinan-transactions') || '[]'
      );

      const response = await fetch(`${config.apiEndpoint}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'X-User-ID': config.userId
        },
        body: JSON.stringify({
          transactions: dataToSync,
          timestamp: new Date().toISOString(),
          deviceId: getDeviceId()
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSyncState(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingChanges: 0,
        syncError: null
      }));

      // Store sync metadata
      localStorage.setItem('planificfinan-sync-metadata', JSON.stringify({
        lastSync: new Date().toISOString(),
        syncId: result.syncId,
        version: result.version
      }));

      return result;
    } catch (error) {
      console.error('Cloud sync error:', error);
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Sync failed'
      }));
      throw error;
    } finally {
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [config, syncState.isOnline, syncState.isSyncing]);

  const syncFromCloud = useCallback(async () => {
    if (!syncState.isOnline || syncState.isSyncing) return;

    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const response = await fetch(`${config.apiEndpoint}/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-User-ID': config.userId
        }
      });

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSyncState(prev => ({
        ...prev,
        lastSync: new Date(),
        syncError: null
      }));

      return result.transactions;
    } catch (error) {
      console.error('Cloud fetch error:', error);
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Fetch failed'
      }));
      throw error;
    } finally {
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [config, syncState.isOnline, syncState.isSyncing]);

  const markAsChanged = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1
    }));
  }, []);

  const clearPendingChanges = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      pendingChanges: 0
    }));
  }, []);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('planificfinan-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('planificfinan-device-id', deviceId);
    }
    return deviceId;
  };

  const backupToCloud = useCallback(async () => {
    if (!syncState.isOnline) {
      throw new Error('Cannot backup while offline');
    }

    const transactions = JSON.parse(
      localStorage.getItem('planificfinan-transactions') || '[]'
    );

    const backupData = {
      transactions,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        deviceId: getDeviceId(),
        count: transactions.length
      }
    };

    const response = await fetch(`${config.apiEndpoint}/backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-User-ID': config.userId
      },
      body: JSON.stringify(backupData)
    });

    if (!response.ok) {
      throw new Error(`Backup failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Store backup metadata
    localStorage.setItem('planificfinan-backup-metadata', JSON.stringify({
      lastBackup: new Date().toISOString(),
      backupId: result.backupId,
      size: result.size
    }));

    return result;
  }, [config, syncState.isOnline]);

  const restoreFromBackup = useCallback(async (backupId?: string) => {
    if (!syncState.isOnline) {
      throw new Error('Cannot restore while offline');
    }

    const url = backupId 
      ? `${config.apiEndpoint}/backup/${backupId}`
      : `${config.apiEndpoint}/backup/latest`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-User-ID': config.userId
      }
    });

    if (!response.ok) {
      throw new Error(`Restore failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Restore transactions
    localStorage.setItem('planificfinan-transactions', JSON.stringify(result.transactions));
    
    setSyncState(prev => ({
      ...prev,
      lastSync: new Date(),
      pendingChanges: 0,
      syncError: null
    }));

    return result.transactions;
  }, [config, syncState.isOnline]);

  const getBackupList = useCallback(async () => {
    if (!syncState.isOnline) {
      throw new Error('Cannot fetch backups while offline');
    }

    const response = await fetch(`${config.apiEndpoint}/backups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-User-ID': config.userId
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch backups: ${response.statusText}`);
    }

    return response.json();
  }, [config, syncState.isOnline]);

  // Load sync metadata on mount
  useEffect(() => {
    const syncMetadata = localStorage.getItem('planificfinan-sync-metadata');
    if (syncMetadata) {
      try {
        const metadata = JSON.parse(syncMetadata);
        setSyncState(prev => ({
          ...prev,
          lastSync: new Date(metadata.lastSync)
        }));
      } catch (error) {
        console.error('Error parsing sync metadata:', error);
      }
    }
  }, []);

  return {
    ...syncState,
    syncToCloud,
    syncFromCloud,
    markAsChanged,
    clearPendingChanges,
    backupToCloud,
    restoreFromBackup,
    getBackupList
  };
};
