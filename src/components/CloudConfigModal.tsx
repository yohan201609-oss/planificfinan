import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Key, Server, User, Clock } from 'lucide-react';
import './CloudConfigModal.css';

interface CloudConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: CloudConfig) => void;
  initialConfig?: CloudConfig;
}

interface CloudConfig {
  apiEndpoint: string;
  apiKey: string;
  userId: string;
  autoSyncInterval: number;
}

const CloudConfigModal: React.FC<CloudConfigModalProps> = React.memo(({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<CloudConfig>(initialConfig || {
    apiEndpoint: '',
    apiKey: '',
    userId: '',
    autoSyncInterval: 30
  });

  const [errors, setErrors] = useState<Partial<CloudConfig>>({});

  const handleChange = (field: keyof CloudConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateConfig = (): boolean => {
    const newErrors: Partial<CloudConfig> = {};
    
    if (!config.apiEndpoint) {
      newErrors.apiEndpoint = 'Endpoint de API es requerido';
    } else if (!isValidUrl(config.apiEndpoint)) {
      newErrors.apiEndpoint = 'URL inválida';
    }
    
    if (!config.apiKey) {
      newErrors.apiKey = 'API Key es requerida';
    }
    
    if (!config.userId) {
      newErrors.userId = 'ID de usuario es requerido';
    }
    
    if (config.autoSyncInterval < 1 || config.autoSyncInterval > 1440) {
      newErrors.autoSyncInterval = 'Intervalo debe estar entre 1 y 1440 minutos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (validateConfig()) {
      onSave(config);
      onClose();
    }
  };

  const handleTestConnection = async () => {
    if (!validateConfig()) return;
    
    try {
      const response = await fetch(`${config.apiEndpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-User-ID': config.userId
        }
      });
      
      if (response.ok) {
        alert('Conexión exitosa!');
      } else {
        alert('Error de conexión: ' + response.statusText);
      }
    } catch (error) {
      alert('Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Configuración de Sincronización en la Nube</h2>
              <motion.button
                className="close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="modal-body">
              <div className="config-section">
                <h3>
                  <Server size={20} />
                  Configuración del Servidor
                </h3>
                
                <div className="form-group">
                  <label htmlFor="apiEndpoint">
                    <Server size={16} />
                    Endpoint de API
                  </label>
                  <input
                    type="url"
                    id="apiEndpoint"
                    value={config.apiEndpoint}
                    onChange={(e) => handleChange('apiEndpoint', e.target.value)}
                    placeholder="https://api.tuservidor.com"
                    className={errors.apiEndpoint ? 'error' : ''}
                  />
                  {errors.apiEndpoint && (
                    <span className="error-message">{errors.apiEndpoint}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="apiKey">
                    <Key size={16} />
                    API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={config.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    placeholder="Tu API key"
                    className={errors.apiKey ? 'error' : ''}
                  />
                  {errors.apiKey && (
                    <span className="error-message">{errors.apiKey}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="userId">
                    <User size={16} />
                    ID de Usuario
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={config.userId}
                    onChange={(e) => handleChange('userId', e.target.value)}
                    placeholder="Tu ID de usuario"
                    className={errors.userId ? 'error' : ''}
                  />
                  {errors.userId && (
                    <span className="error-message">{errors.userId}</span>
                  )}
                </div>
              </div>

              <div className="config-section">
                <h3>
                  <Clock size={20} />
                  Configuración de Sincronización
                </h3>
                
                <div className="form-group">
                  <label htmlFor="autoSyncInterval">
                    <Clock size={16} />
                    Intervalo de Auto-sincronización (minutos)
                  </label>
                  <input
                    type="number"
                    id="autoSyncInterval"
                    value={config.autoSyncInterval}
                    onChange={(e) => handleChange('autoSyncInterval', parseInt(e.target.value) || 0)}
                    min="1"
                    max="1440"
                    className={errors.autoSyncInterval ? 'error' : ''}
                  />
                  {errors.autoSyncInterval && (
                    <span className="error-message">{errors.autoSyncInterval}</span>
                  )}
                  <small>Mínimo: 1 minuto, Máximo: 1440 minutos (24 horas)</small>
                </div>
              </div>

              <div className="config-section">
                <h3>
                  <Cloud size={20} />
                  Información
                </h3>
                <div className="info-box">
                  <p>
                    La sincronización en la nube te permite:
                  </p>
                  <ul>
                    <li>Respaldar tus datos automáticamente</li>
                    <li>Sincronizar entre múltiples dispositivos</li>
                    <li>Acceder a tus datos desde cualquier lugar</li>
                    <li>Restaurar datos en caso de pérdida</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <motion.button
                className="btn-secondary"
                onClick={handleTestConnection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Probar Conexión
              </motion.button>
              
              <div className="footer-actions">
                <motion.button
                  className="btn-cancel"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  className="btn-save"
                  onClick={handleSave}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Guardar Configuración
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CloudConfigModal.displayName = 'CloudConfigModal';

export default CloudConfigModal;
