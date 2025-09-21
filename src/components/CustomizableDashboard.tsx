import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Move, 
  Eye, 
  EyeOff, 
  Plus, 
  Grid3X3,
  Layout,
  Save,
  RotateCcw
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import BalanceCard from './BalanceCard';
import FinancialDashboard from './FinancialDashboard';
import AdvancedCharts from './AdvancedCharts';
import FinancialInsights from './FinancialInsights';
import BudgetManager from './BudgetManager';
import TransactionList from './TransactionList';
import './CustomizableDashboard.css';

interface DashboardWidget {
  id: string;
  component: string;
  title: string;
  visible: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
}

interface DashboardLayout {
  widgets: DashboardWidget[];
  layout: 'grid' | 'list';
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'balance', component: 'BalanceCard', title: 'Balance Total', visible: true, order: 1, size: 'medium' },
  { id: 'financial-dashboard', component: 'FinancialDashboard', title: 'Dashboard Financiero', visible: true, order: 2, size: 'large' },
  { id: 'insights', component: 'FinancialInsights', title: 'Insights Financieros', visible: true, order: 3, size: 'medium' },
  { id: 'advanced-charts', component: 'AdvancedCharts', title: 'Gráficos Avanzados', visible: true, order: 4, size: 'large' },
  { id: 'budget-manager', component: 'BudgetManager', title: 'Presupuestos y Metas', visible: true, order: 5, size: 'medium' },
  { id: 'transactions', component: 'TransactionList', title: 'Lista de Transacciones', visible: true, order: 6, size: 'large' }
];

const CustomizableDashboard: React.FC = React.memo(() => {
  const { showAlert } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>({
    widgets: DEFAULT_WIDGETS,
    layout: 'grid'
  });
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Cargar configuración guardada
  useEffect(() => {
    const savedLayout = localStorage.getItem('planificfinan-dashboard-layout');
    if (savedLayout) {
      try {
        setDashboardLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.error('Error loading dashboard layout:', error);
      }
    }
  }, []);

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('planificfinan-dashboard-layout', JSON.stringify(dashboardLayout));
  }, [dashboardLayout]);

  const toggleWidgetVisibility = (widgetId: string) => {
    setDashboardLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    }));
  };

  const changeWidgetSize = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    setDashboardLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, size } : widget
      )
    }));
  };

  const changeLayout = (layout: 'grid' | 'list') => {
    setDashboardLayout(prev => ({ ...prev, layout }));
  };

  const resetToDefault = () => {
    setDashboardLayout({
      widgets: DEFAULT_WIDGETS,
      layout: 'grid'
    });
    showAlert('Dashboard restaurado a configuración por defecto', 'success');
  };

  const saveLayout = () => {
    localStorage.setItem('planificfinan-dashboard-layout', JSON.stringify(dashboardLayout));
    showAlert('Configuración del dashboard guardada', 'success');
  };

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    
    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const draggedIndex = dashboardLayout.widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = dashboardLayout.widgets.findIndex(w => w.id === targetWidgetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newWidgets = [...dashboardLayout.widgets];
    const draggedWidgetData = newWidgets[draggedIndex];
    
    newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedWidgetData);

    // Actualizar el orden
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index + 1
    }));

    setDashboardLayout(prev => ({
      ...prev,
      widgets: updatedWidgets
    }));

    setDraggedWidget(null);
  };

  const renderWidget = (widget: DashboardWidget) => {
    const widgetProps = {
      key: widget.id,
      className: `dashboard-widget ${widget.size} ${isEditing ? 'editing' : ''}`,
      draggable: isEditing,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, widget.id),
      onDragOver: handleDragOver,
      onDrop: (e: React.DragEvent) => handleDrop(e, widget.id)
    };

    switch (widget.component) {
      case 'BalanceCard':
        return <div {...widgetProps}><BalanceCard /></div>;
      case 'FinancialDashboard':
        return <div {...widgetProps}><FinancialDashboard /></div>;
      case 'AdvancedCharts':
        return <div {...widgetProps}><AdvancedCharts /></div>;
      case 'FinancialInsights':
        return <div {...widgetProps}><FinancialInsights /></div>;
      case 'BudgetManager':
        return <div {...widgetProps}><BudgetManager /></div>;
      case 'TransactionList':
        return <div {...widgetProps}><TransactionList /></div>;
      default:
        return null;
    }
  };

  const visibleWidgets = dashboardLayout.widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="customizable-dashboard">
      {/* Dashboard Controls */}
      <div className="dashboard-controls">
        <div className="controls-left">
          <h1>Dashboard Personalizable</h1>
          <div className="layout-selector">
            <button
              className={`layout-btn ${dashboardLayout.layout === 'grid' ? 'active' : ''}`}
              onClick={() => changeLayout('grid')}
              title="Vista de cuadrícula"
            >
              <Grid3X3 size={20} />
            </button>
            <button
              className={`layout-btn ${dashboardLayout.layout === 'list' ? 'active' : ''}`}
              onClick={() => changeLayout('list')}
              title="Vista de lista"
            >
              <Layout size={20} />
            </button>
          </div>
        </div>

        <div className="controls-right">
          <button
            className={`edit-btn ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? 'Finalizar edición' : 'Editar dashboard'}
          >
            <Settings size={20} />
            {isEditing ? 'Finalizar' : 'Personalizar'}
          </button>

          <AnimatePresence>
            {isEditing && (
              <motion.div
                className="edit-actions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button
                  className="action-btn save"
                  onClick={saveLayout}
                  title="Guardar configuración"
                >
                  <Save size={16} />
                </button>
                <button
                  className="action-btn reset"
                  onClick={resetToDefault}
                  title="Restaurar por defecto"
                >
                  <RotateCcw size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Widget Settings Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="widget-settings-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3>Configuración de Widgets</h3>
            <div className="widget-settings-grid">
              {dashboardLayout.widgets.map(widget => (
                <div key={widget.id} className="widget-setting-item">
                  <div className="widget-info">
                    <h4>{widget.title}</h4>
                    <span className="widget-size">{widget.size}</span>
                  </div>
                  
                  <div className="widget-controls">
                    <button
                      className={`visibility-btn ${widget.visible ? 'visible' : 'hidden'}`}
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      title={widget.visible ? 'Ocultar widget' : 'Mostrar widget'}
                    >
                      {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    {widget.visible && (
                      <div className="size-selector">
                        <button
                          className={`size-btn ${widget.size === 'small' ? 'active' : ''}`}
                          onClick={() => changeWidgetSize(widget.id, 'small')}
                          title="Tamaño pequeño"
                        >
                          S
                        </button>
                        <button
                          className={`size-btn ${widget.size === 'medium' ? 'active' : ''}`}
                          onClick={() => changeWidgetSize(widget.id, 'medium')}
                          title="Tamaño mediano"
                        >
                          M
                        </button>
                        <button
                          className={`size-btn ${widget.size === 'large' ? 'active' : ''}`}
                          onClick={() => changeWidgetSize(widget.id, 'large')}
                          title="Tamaño grande"
                        >
                          L
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Content */}
      <div className={`dashboard-content ${dashboardLayout.layout} ${isEditing ? 'editing' : ''}`}>
        <AnimatePresence>
          {visibleWidgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {renderWidget(widget)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {visibleWidgets.length === 0 && (
        <div className="empty-dashboard">
          <div className="empty-icon">
            <Plus size={48} />
          </div>
          <h3>Dashboard vacío</h3>
          <p>Activa algunos widgets para personalizar tu dashboard</p>
        </div>
      )}
    </div>
  );
});

CustomizableDashboard.displayName = 'CustomizableDashboard';

export default CustomizableDashboard;
