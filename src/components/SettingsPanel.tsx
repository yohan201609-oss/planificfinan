import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Info,
  ChevronRight,
  X
} from 'lucide-react';
import NotificationSettings from './NotificationSettings';
import ThemeSettings from './ThemeSettings';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = React.memo(({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const settingsSections = [
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura alertas y recordatorios',
      icon: Bell,
      color: '#f59e0b'
    },
    {
      id: 'themes',
      title: 'Temas y Apariencia',
      description: 'Personaliza colores y modo oscuro',
      icon: Palette,
      color: '#7c3aed'
    },
    {
      id: 'privacy',
      title: 'Privacidad y Seguridad',
      description: 'Configuración de datos y privacidad',
      icon: Shield,
      color: '#10b981'
    },
    {
      id: 'data',
      title: 'Datos y Respaldo',
      description: 'Exportar, importar y respaldar datos',
      icon: Database,
      color: '#3b82f6'
    },
    {
      id: 'about',
      title: 'Acerca de',
      description: 'Información de la aplicación',
      icon: Info,
      color: '#64748b'
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleBack = () => {
    setActiveSection(null);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'notifications':
        return (
          <NotificationSettings 
            isOpen={true} 
            onClose={handleBack}
          />
        );
      case 'themes':
        return (
          <ThemeSettings 
            isOpen={true} 
            onClose={handleBack}
          />
        );
      case 'privacy':
        return (
          <div className="section-content">
            <div className="section-header">
              <button className="back-btn" onClick={handleBack}>
                <ChevronRight size={20} />
                Volver
              </button>
              <h2>
                <Shield size={24} />
                Privacidad y Seguridad
              </h2>
            </div>
            <div className="privacy-content">
              <div className="privacy-section">
                <h3>Datos Locales</h3>
                <p>Tus datos se almacenan localmente en tu dispositivo y no se comparten con terceros.</p>
                
                <div className="privacy-item">
                  <h4>LocalStorage</h4>
                  <p>Transacciones, presupuestos y configuraciones se guardan en tu navegador.</p>
                </div>
                
                <div className="privacy-item">
                  <h4>Sincronización en la Nube (Opcional)</h4>
                  <p>Puedes configurar sincronización con tus propios servidores para respaldo.</p>
                </div>
              </div>

              <div className="privacy-section">
                <h3>Permisos</h3>
                
                <div className="permission-item">
                  <h4>Notificaciones</h4>
                  <p>Se usan para alertas de presupuestos y recordatorios. Puedes desactivarlas en cualquier momento.</p>
                </div>
                
                <div className="permission-item">
                  <h4>PWA (Aplicación Web Progresiva)</h4>
                  <p>Permite instalar la aplicación en tu dispositivo para uso offline.</p>
                </div>
              </div>

              <div className="privacy-section">
                <h3>Seguridad</h3>
                <p>Toda la información financiera permanece en tu dispositivo. No recopilamos ni almacenamos datos personales.</p>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="section-content">
            <div className="section-header">
              <button className="back-btn" onClick={handleBack}>
                <ChevronRight size={20} />
                Volver
              </button>
              <h2>
                <Database size={24} />
                Datos y Respaldo
              </h2>
            </div>
            <div className="data-content">
              <div className="data-section">
                <h3>Exportar Datos</h3>
                <p>Descarga una copia de todos tus datos financieros en formato JSON.</p>
                <button className="btn-action">
                  <Database size={16} />
                  Exportar Todo
                </button>
              </div>

              <div className="data-section">
                <h3>Importar Datos</h3>
                <p>Restaura tus datos desde un archivo de respaldo anterior.</p>
                <button className="btn-action">
                  <Database size={16} />
                  Importar Archivo
                </button>
              </div>

              <div className="data-section">
                <h3>Limpiar Datos</h3>
                <p>Elimina todos los datos almacenados localmente.</p>
                <button className="btn-action btn-danger">
                  <Database size={16} />
                  Limpiar Todo
                </button>
              </div>

              <div className="data-section">
                <h3>Información de Almacenamiento</h3>
                <div className="storage-info">
                  <div className="storage-item">
                    <span>Transacciones:</span>
                    <span>0 registros</span>
                  </div>
                  <div className="storage-item">
                    <span>Presupuestos:</span>
                    <span>0 configurados</span>
                  </div>
                  <div className="storage-item">
                    <span>Metas:</span>
                    <span>0 establecidas</span>
                  </div>
                  <div className="storage-item">
                    <span>Espacio usado:</span>
                    <span>~0 KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="section-content">
            <div className="section-header">
              <button className="back-btn" onClick={handleBack}>
                <ChevronRight size={20} />
                Volver
              </button>
              <h2>
                <Info size={24} />
                Acerca de PlanificFinan
              </h2>
            </div>
            <div className="about-content">
              <div className="app-info">
                <div className="app-logo">
                  <div className="logo-placeholder">💰</div>
                </div>
                <h3>PlanificFinan</h3>
                <p className="app-version">Versión 1.0.0</p>
                <p className="app-description">
                  Aplicación moderna para planificación y gestión de finanzas personales.
                </p>
              </div>

              <div className="about-section">
                <h4>Características</h4>
                <ul>
                  <li>Gestión de transacciones</li>
                  <li>Presupuestos y metas</li>
                  <li>Visualizaciones de datos</li>
                  <li>PWA con soporte offline</li>
                  <li>Sincronización en la nube</li>
                  <li>Notificaciones inteligentes</li>
                  <li>Temas personalizables</li>
                </ul>
              </div>

              <div className="about-section">
                <h4>Tecnologías</h4>
                <ul>
                  <li>React 18 + TypeScript</li>
                  <li>Vite + PWA</li>
                  <li>Framer Motion</li>
                  <li>Recharts</li>
                  <li>Lucide React</li>
                </ul>
              </div>

              <div className="about-section">
                <h4>Desarrollado con ❤️</h4>
                <p>Una aplicación open source para ayudarte a manejar tus finanzas de manera inteligente.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="settings-panel"
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {activeSection ? (
          renderSectionContent()
        ) : (
          <>
            <div className="settings-header">
              <h2>
                <Settings size={24} />
                Configuración
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

            <div className="settings-content">
              {settingsSections.map((section) => (
                <motion.button
                  key={section.id}
                  className="settings-section"
                  onClick={() => handleSectionClick(section.id)}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="section-icon" style={{ backgroundColor: section.color }}>
                    <section.icon size={20} />
                  </div>
                  <div className="section-info">
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                  <ChevronRight size={20} className="section-arrow" />
                </motion.button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

export default SettingsPanel;
