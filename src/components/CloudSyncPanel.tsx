import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings
} from 'lucide-react';
import { useCloudSync } from '../hooks/useCloudSync';
import './CloudSyncPanel.css';

interface CloudSyncPanelProps {
  config: {
    apiEndpoint: string;
    apiKey: string;
    userId: string;
    autoSyncInterval: number;
  };
  onTransactionsUpdate?: (transactions: any[]) => void;
}

const CloudSyncPanel: React.FC<CloudSyncPanelProps> = React.memo(({
  config,
  onTransactionsUpdate
}) => {
  const {
    isOnline,
    isSyncing,
    lastSync,
    syncError,
    pendingChanges,
    syncToCloud,
    syncFromCloud,
    backupToCloud,
    restoreFromBackup,
    getBackupList
  } = useCloudSync(config);

  const [showSettings, setShowSettings] = useState(false);
  const [backupList, setBackupList] = useState<any[]>([]);
  const [showBackups, setShowBackups] = useState(false);

  const handleSyncToCloud = async () => {
    try {
      await syncToCloud();
    } catch (error) {
      console.error('Sync to cloud failed:', error);
    }
  };

  const handleSyncFromCloud = async () => {
    try {
      const transactions = await syncFromCloud();
      if (onTransactionsUpdate) {
        onTransactionsUpdate(transactions);
      }
    } catch (error) {
      console.error('Sync from cloud failed:', error);
    }
  };

  const handleBackup = async () => {
    try {
      await backupToCloud();
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleRestore = async (backupId?: string) => {
    try {
      const transactions = await restoreFromBackup(backupId);
      if (onTransactionsUpdate) {
        onTransactionsUpdate(transactions);
      }
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  const handleLoadBackups = async () => {
    try {
      const backups = await getBackupList();
      setBackupList(backups);
      setShowBackups(true);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`;
    return `Hace ${Math.floor(minutes / 1440)} días`;
  };

  return (
    <div className="cloud-sync-panel">
      <motion.div 
        className="sync-header"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="sync-status">
          <motion.div 
            className={`sync-icon ${isOnline ? 'online' : 'offline'}`}
            animate={{ 
              scale: isSyncing ? [1, 1.1, 1] : 1,
              rotate: isSyncing ? 360 : 0
            }}
            transition={{ 
              scale: { duration: 0.5, repeat: isSyncing ? Infinity : 0 },
              rotate: { duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }
            }}
          >
            {isOnline ? <Cloud size={20} /> : <CloudOff size={20} />}
          </motion.div>
          
          <div className="sync-info">
            <h3>Sincronización en la Nube</h3>
            <p className="sync-status-text">
              {isSyncing ? 'Sincronizando...' : 
               isOnline ? 'Conectado' : 'Sin conexión'}
            </p>
            <p className="sync-last">
              Última sincronización: {formatLastSync(lastSync)}
            </p>
          </div>
        </div>

        <motion.button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Settings size={18} />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="sync-settings"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sync-actions">
              <motion.button
                className="sync-btn primary"
                onClick={handleSyncToCloud}
                disabled={!isOnline || isSyncing || pendingChanges === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload size={16} />
                Sincronizar ({pendingChanges})
              </motion.button>

              <motion.button
                className="sync-btn secondary"
                onClick={handleSyncFromCloud}
                disabled={!isOnline || isSyncing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={16} />
                Descargar
              </motion.button>

              <motion.button
                className="sync-btn backup"
                onClick={handleBackup}
                disabled={!isOnline || isSyncing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Database size={16} />
                Backup
              </motion.button>

              <motion.button
                className="sync-btn restore"
                onClick={handleLoadBackups}
                disabled={!isOnline || isSyncing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={16} />
                Restaurar
              </motion.button>
            </div>

            <div className="sync-stats">
              <div className="stat-item">
                <Clock size={16} />
                <span>Auto-sync: {config.autoSyncInterval} min</span>
              </div>
              <div className="stat-item">
                <Database size={16} />
                <span>Cambios pendientes: {pendingChanges}</span>
              </div>
            </div>

            {syncError && (
              <motion.div
                className="sync-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle size={16} />
                <span>{syncError}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackups && (
          <motion.div
            className="backup-list"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h4>Backups Disponibles</h4>
            <div className="backup-items">
              {backupList.map((backup, index) => (
                <motion.div
                  key={backup.id}
                  className="backup-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="backup-info">
                    <p className="backup-date">
                      {new Date(backup.timestamp).toLocaleString('es-ES')}
                    </p>
                    <p className="backup-size">{backup.size} transacciones</p>
                  </div>
                  <motion.button
                    className="restore-btn"
                    onClick={() => handleRestore(backup.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Restaurar
                  </motion.button>
                </motion.div>
              ))}
            </div>
            <motion.button
              className="close-backups"
              onClick={() => setShowBackups(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cerrar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CloudSyncPanel.displayName = 'CloudSyncPanel';

export default CloudSyncPanel;
