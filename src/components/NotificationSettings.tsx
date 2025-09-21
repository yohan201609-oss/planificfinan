import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Settings, 
  AlertTriangle,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Clock,
  X,
  Check,
  Info
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import './NotificationSettings.css';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = React.memo(({ isOpen, onClose }) => {
  const {
    settings,
    schedule,
    isSupported,
    permission,
    requestPermission,
    updateSettings,
    updateSchedule,
    triggerBudgetCheck,
    triggerBalanceCheck,
    triggerGoalCheck
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'settings' | 'schedule' | 'test'>('settings');

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  const handleScheduleChange = (key: keyof typeof schedule, value: string) => {
    updateSchedule({ [key]: value });
  };

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const testNotifications = [
    {
      id: 'budget',
      title: 'Presupuesto Excedido',
      description: 'Has excedido el presupuesto de comida',
      action: triggerBudgetCheck,
      icon: AlertTriangle
    },
    {
      id: 'balance',
      title: 'Balance Bajo',
      description: 'Tu balance actual es muy bajo',
      action: triggerBalanceCheck,
      icon: DollarSign
    },
    {
      id: 'goal',
      title: 'Meta de Ahorro',
      description: 'Te quedan 3 días para tu meta de vacaciones',
      action: triggerGoalCheck,
      icon: Target
    }
  ];

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
            className="modal-content notification-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Bell size={24} />
                Configuración de Notificaciones
              </h2>
              <motion.button
                className="close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {!isSupported ? (
              <div className="unsupported-message">
                <BellOff size={48} />
                <h3>Notificaciones No Soportadas</h3>
                <p>Tu navegador no soporta notificaciones push. Por favor, usa un navegador moderno.</p>
              </div>
            ) : permission !== 'granted' ? (
              <div className="permission-message">
                <Bell size={48} />
                <h3>Permisos de Notificación</h3>
                <p>Para recibir notificaciones, necesitas permitir el acceso.</p>
                <motion.button
                  className="btn-permission"
                  onClick={handleRequestPermission}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell size={16} />
                  Habilitar Notificaciones
                </motion.button>
              </div>
            ) : (
              <div className="notification-content">
                {/* Tabs */}
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings size={16} />
                    Configuración
                  </button>
                  <button
                    className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                  >
                    <Clock size={16} />
                    Programación
                  </button>
                  <button
                    className={`tab ${activeTab === 'test' ? 'active' : ''}`}
                    onClick={() => setActiveTab('test')}
                  >
                    <Info size={16} />
                    Probar
                  </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {activeTab === 'settings' && (
                    <motion.div
                      className="settings-tab"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="settings-section">
                        <h3>Alertas de Presupuesto</h3>
                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Alertas de Presupuesto</h4>
                            <p>Recibe notificaciones cuando te acerques o excedas tus presupuestos</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.budgetAlerts}
                              onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Presupuesto Excedido</h4>
                            <p>Notificación inmediata cuando excedas un presupuesto</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.budgetExceededAlerts}
                              onChange={(e) => handleSettingChange('budgetExceededAlerts', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h3>Metas y Balance</h3>
                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Recordatorios de Metas</h4>
                            <p>Notificaciones sobre el progreso de tus metas de ahorro</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.goalReminders}
                              onChange={(e) => handleSettingChange('goalReminders', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Alertas de Balance Bajo</h4>
                            <p>Avisos cuando tu balance sea negativo o muy bajo</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.lowBalanceAlerts}
                              onChange={(e) => handleSettingChange('lowBalanceAlerts', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h3>Recordatorios</h3>
                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Recordatorios de Transacciones</h4>
                            <p>Notificaciones para recordarte registrar tus gastos</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.transactionReminders}
                              onChange={(e) => handleSettingChange('transactionReminders', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-section">
                        <h3>Reportes</h3>
                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Reportes Semanales</h4>
                            <p>Resumen semanal de tus finanzas</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.weeklyReports}
                              onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Reportes Mensuales</h4>
                            <p>Resumen mensual de tus finanzas</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.monthlyReports}
                              onChange={(e) => handleSettingChange('monthlyReports', e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'schedule' && (
                    <motion.div
                      className="schedule-tab"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="schedule-section">
                        <h3>Recordatorio Diario</h3>
                        <div className="schedule-item">
                          <label>Hora del recordatorio:</label>
                          <input
                            type="time"
                            value={schedule.dailyReminder}
                            onChange={(e) => handleScheduleChange('dailyReminder', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="schedule-section">
                        <h3>Reporte Semanal</h3>
                        <div className="schedule-item">
                          <label>Día de la semana:</label>
                          <select
                            value={schedule.weeklyReport}
                            onChange={(e) => handleScheduleChange('weeklyReport', e.target.value)}
                          >
                            <option value="monday">Lunes</option>
                            <option value="tuesday">Martes</option>
                            <option value="wednesday">Miércoles</option>
                            <option value="thursday">Jueves</option>
                            <option value="friday">Viernes</option>
                            <option value="saturday">Sábado</option>
                            <option value="sunday">Domingo</option>
                          </select>
                        </div>
                      </div>

                      <div className="schedule-section">
                        <h3>Reporte Mensual</h3>
                        <div className="schedule-item">
                          <label>Día del mes:</label>
                          <select
                            value={schedule.monthlyReport}
                            onChange={(e) => handleScheduleChange('monthlyReport', e.target.value)}
                          >
                            {Array.from({ length: 31 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'test' && (
                    <motion.div
                      className="test-tab"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="test-section">
                        <h3>Probar Notificaciones</h3>
                        <p>Prueba las diferentes notificaciones para asegurarte de que funcionan correctamente.</p>
                        
                        <div className="test-notifications">
                          {testNotifications.map((notification) => (
                            <motion.button
                              key={notification.id}
                              className="test-notification-btn"
                              onClick={notification.action}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <notification.icon size={20} />
                              <div className="test-notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.description}</p>
                              </div>
                              <Check size={16} />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <motion.button
                className="btn-close"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cerrar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

NotificationSettings.displayName = 'NotificationSettings';

export default NotificationSettings;
