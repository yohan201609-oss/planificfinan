import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Settings,
  RotateCcw,
  X,
  Check,
  Droplets
} from 'lucide-react';
import { useTheme, ThemeMode, ColorScheme } from '../hooks/useTheme';
import './ThemeSettings.css';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = React.memo(({ isOpen, onClose }) => {
  const {
    theme,
    isDark,
    systemPrefersDark,
    updateTheme,
    toggleDarkMode,
    setColorScheme,
    setCustomColors,
    resetTheme,
    getCurrentColors,
    THEME_COLORS,
    availableColorSchemes
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'mode' | 'colors' | 'custom'>('mode');
  const [customColors, setCustomColorsState] = useState({
    primary: '',
    secondary: '',
    accent: ''
  });

  const handleModeChange = (mode: ThemeMode) => {
    updateTheme({ mode });
  };

  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    setColorScheme(colorScheme);
  };

  const handleCustomColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    setCustomColorsState(prev => ({ ...prev, [colorType]: value }));
  };

  const applyCustomColors = () => {
    const colors: any = {};
    if (customColors.primary) colors.primary = customColors.primary;
    if (customColors.secondary) colors.secondary = customColors.secondary;
    if (customColors.accent) colors.accent = customColors.accent;
    
    if (Object.keys(colors).length > 0) {
      setCustomColors(colors);
    }
  };

  const clearCustomColors = () => {
    setCustomColors(undefined);
    setCustomColorsState({ primary: '', secondary: '', accent: '' });
  };

  const modeOptions = [
    {
      id: 'light' as ThemeMode,
      name: 'Claro',
      icon: Sun,
      description: 'Tema claro siempre'
    },
    {
      id: 'dark' as ThemeMode,
      name: 'Oscuro',
      icon: Moon,
      description: 'Tema oscuro siempre'
    },
    {
      id: 'auto' as ThemeMode,
      name: 'Automático',
      icon: Monitor,
      description: `Sigue la preferencia del sistema (${systemPrefersDark ? 'oscuro' : 'claro'})`
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
            className="modal-content theme-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Palette size={24} />
                Configuración de Temas
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

            <div className="theme-content">
              {/* Tabs */}
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'mode' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mode')}
                >
                  <Monitor size={16} />
                  Modo
                </button>
                <button
                  className={`tab ${activeTab === 'colors' ? 'active' : ''}`}
                  onClick={() => setActiveTab('colors')}
                >
                  <Palette size={16} />
                  Colores
                </button>
                <button
                  className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
                  onClick={() => setActiveTab('custom')}
                >
                  <Droplets size={16} />
                  Personalizar
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'mode' && (
                  <motion.div
                    className="mode-tab"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mode-section">
                      <h3>Modo de Tema</h3>
                      <p>Elige cómo quieres que se vea la aplicación</p>
                      
                      <div className="mode-options">
                        {modeOptions.map((option) => (
                          <motion.button
                            key={option.id}
                            className={`mode-option ${theme.mode === option.id ? 'selected' : ''}`}
                            onClick={() => handleModeChange(option.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="mode-icon">
                              <option.icon size={24} />
                            </div>
                            <div className="mode-info">
                              <h4>{option.name}</h4>
                              <p>{option.description}</p>
                            </div>
                            {theme.mode === option.id && (
                              <div className="mode-check">
                                <Check size={20} />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="preview-section">
                      <h3>Vista Previa</h3>
                      <div className={`theme-preview ${isDark ? 'dark' : 'light'}`}>
                        <div className="preview-header">
                          <div className="preview-title">PlanificFinan</div>
                          <div className="preview-subtitle">Dashboard Financiero</div>
                        </div>
                        <div className="preview-content">
                          <div className="preview-card">
                            <div className="preview-metric">
                              <span className="preview-label">Balance</span>
                              <span className="preview-value">$2,450.00</span>
                            </div>
                          </div>
                          <div className="preview-card">
                            <div className="preview-metric">
                              <span className="preview-label">Ingresos</span>
                              <span className="preview-value positive">$3,200.00</span>
                            </div>
                          </div>
                          <div className="preview-card">
                            <div className="preview-metric">
                              <span className="preview-label">Gastos</span>
                              <span className="preview-value negative">$750.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'colors' && (
                  <motion.div
                    className="colors-tab"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="colors-section">
                      <h3>Esquemas de Color</h3>
                      <p>Elige un esquema de colores que te guste</p>
                      
                      <div className="color-schemes">
                        {availableColorSchemes.map((scheme) => (
                          <motion.button
                            key={scheme}
                            className={`color-scheme ${theme.colorScheme === scheme ? 'selected' : ''}`}
                            onClick={() => handleColorSchemeChange(scheme)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="scheme-preview">
                              <div 
                                className="scheme-primary" 
                                style={{ backgroundColor: THEME_COLORS[scheme].primary }}
                              />
                              <div 
                                className="scheme-secondary" 
                                style={{ backgroundColor: THEME_COLORS[scheme].secondary }}
                              />
                              <div 
                                className="scheme-accent" 
                                style={{ backgroundColor: THEME_COLORS[scheme].accent }}
                              />
                            </div>
                            <div className="scheme-name">
                              {scheme === 'blue' ? 'Azul' :
                               scheme === 'green' ? 'Verde' :
                               scheme === 'purple' ? 'Púrpura' :
                               scheme === 'red' ? 'Rojo' :
                               scheme === 'orange' ? 'Naranja' :
                               scheme === 'pink' ? 'Rosa' : scheme}
                            </div>
                            {theme.colorScheme === scheme && (
                              <div className="scheme-check">
                                <Check size={16} />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'custom' && (
                  <motion.div
                    className="custom-tab"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="custom-section">
                      <h3>Colores Personalizados</h3>
                      <p>Define tus propios colores para personalizar completamente la aplicación</p>
                      
                      <div className="custom-colors">
                        <div className="color-input-group">
                          <label htmlFor="primary-color">Color Primario</label>
                          <div className="color-input">
                            <input
                              type="color"
                              id="primary-color"
                              value={customColors.primary || getCurrentColors().primary}
                              onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="#2563eb"
                              value={customColors.primary}
                              onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="color-input-group">
                          <label htmlFor="secondary-color">Color Secundario</label>
                          <div className="color-input">
                            <input
                              type="color"
                              id="secondary-color"
                              value={customColors.secondary || getCurrentColors().secondary}
                              onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="#3b82f6"
                              value={customColors.secondary}
                              onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="color-input-group">
                          <label htmlFor="accent-color">Color de Acento</label>
                          <div className="color-input">
                            <input
                              type="color"
                              id="accent-color"
                              value={customColors.accent || getCurrentColors().accent}
                              onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="#60a5fa"
                              value={customColors.accent}
                              onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="custom-actions">
                        <motion.button
                          className="btn-apply"
                          onClick={applyCustomColors}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Check size={16} />
                          Aplicar Colores
                        </motion.button>
                        
                        <motion.button
                          className="btn-clear"
                          onClick={clearCustomColors}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <RotateCcw size={16} />
                          Limpiar
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <motion.button
                className="btn-reset"
                onClick={resetTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={16} />
                Restaurar Predeterminado
              </motion.button>
              
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

ThemeSettings.displayName = 'ThemeSettings';

export default ThemeSettings;
