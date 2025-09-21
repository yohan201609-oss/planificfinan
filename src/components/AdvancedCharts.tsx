import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { getCategoryName } from '../utils/categories';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import './AdvancedCharts.css';

const COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

interface AdvancedChartsProps {
  className?: string;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = React.memo(({ className }) => {
  const { filteredTransactions, categoryAnalysis, monthlyTrends, currency } = useFinance();
  const [selectedChart, setSelectedChart] = useState<'scatter' | 'radar' | 'composed' | 'heatmap'>('scatter');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Datos para gráfico de dispersión (Ingresos vs Gastos)
  const scatterData = useMemo(() => {
    const dailyData: { [key: string]: { income: number; expense: number; date: string; balance: number } } = {};

    filteredTransactions.forEach(transaction => {
      if (!dailyData[transaction.date]) {
        dailyData[transaction.date] = { income: 0, expense: 0, date: transaction.date, balance: 0 };
      }
      
      if (transaction.type === 'income') {
        dailyData[transaction.date].income += transaction.amount;
      } else {
        dailyData[transaction.date].expense += Math.abs(transaction.amount);
      }
    });

    return Object.values(dailyData).map(day => ({
      ...day,
      balance: day.income - day.expense,
      dateFormatted: format(new Date(day.date), 'MMM dd', { locale: es })
    }));
  }, [filteredTransactions]);

  // Datos para gráfico radar (Análisis de categorías)
  const radarData = useMemo(() => {
    const maxAmount = Math.max(...categoryAnalysis.map(c => c.total));
    
    return categoryAnalysis.map(category => ({
      category: getCategoryName(category.category),
      amount: category.total,
      percentage: maxAmount > 0 ? (category.total / maxAmount) * 100 : 0,
      income: category.income,
      expense: category.expense,
      count: category.count
    }));
  }, [categoryAnalysis]);

  // Datos para gráfico compuesto (Tendencias mensuales)
  const composedData = useMemo(() => {
    return monthlyTrends.map(trend => ({
      month: format(new Date(trend.month + '-01'), 'MMM yyyy', { locale: es }),
      income: trend.income,
      expense: trend.expense,
      balance: trend.balance,
      savingsRate: trend.income > 0 ? ((trend.income - trend.expense) / trend.income) * 100 : 0
    }));
  }, [monthlyTrends]);

  // Datos para heatmap (Actividad por día)
  const heatmapData = useMemo(() => {
    const now = new Date();
    const startDate = subMonths(now, 3);
    const days = eachDayOfInterval({ start: startDate, end: now });
    
    const activityMap: { [key: string]: number } = {};
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.date;
      if (!activityMap[date]) {
        activityMap[date] = 0;
      }
      activityMap[date]++;
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const activity = activityMap[dateStr] || 0;
      
      return {
        date: dateStr,
        day: format(day, 'dd'),
        month: format(day, 'MMM', { locale: es }),
        activity,
        intensity: Math.min(activity / 5, 1) // Normalizar a 0-1
      };
    });
  }, [filteredTransactions]);

  const renderTooltip = (active: boolean, payload: any[], label: string) => {
    if (active && payload && payload.length) {
      return (
        <div className="advanced-chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderScatterChart = () => (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chart-header">
        <h3>
          <Target size={20} />
          Correlación Ingresos vs Gastos
        </h3>
        <p>Análisis de dispersión por día</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={scatterData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="income" 
            name="Ingresos"
            tickFormatter={(value) => formatCurrency(value, currency)}
          />
          <YAxis 
            type="number" 
            dataKey="expense" 
            name="Gastos"
            tickFormatter={(value) => formatCurrency(value, currency)}
          />
          <Tooltip content={renderTooltip} />
          <Scatter 
            dataKey="expense" 
            fill="#dc2626"
            fillOpacity={0.6}
            stroke="#dc2626"
            strokeWidth={2}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const renderRadarChart = () => (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chart-header">
        <h3>
          <Activity size={20} />
          Análisis por Categorías
        </h3>
        <p>Distribución de gastos e ingresos</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis 
            tickFormatter={(value) => formatCurrency(value, currency)}
            angle={90}
            domain={[0, 'dataMax']}
          />
          <Radar
            name="Total"
            dataKey="amount"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            formatter={(value, name) => [formatCurrency(value as number, currency), name]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const renderComposedChart = () => (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chart-header">
        <h3>
          <TrendingUp size={20} />
          Tendencias Mensuales
        </h3>
        <p>Ingresos, gastos y balance por mes</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={composedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis 
            yAxisId="left"
            tickFormatter={(value) => formatCurrency(value, currency)}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip content={renderTooltip} />
          <Bar yAxisId="left" dataKey="income" fill="#059669" name="Ingresos" />
          <Bar yAxisId="left" dataKey="expense" fill="#dc2626" name="Gastos" />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="savingsRate" 
            stroke="#2563eb" 
            strokeWidth={3}
            name="% Ahorro"
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const renderHeatmap = () => (
    <motion.div 
      className="chart-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chart-header">
        <h3>
          <Activity size={20} />
          Actividad de Transacciones
        </h3>
        <p>Frecuencia de transacciones por día (últimos 3 meses)</p>
      </div>
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {heatmapData.map((day, index) => (
            <div
              key={day.date}
              className="heatmap-day"
              style={{
                backgroundColor: `rgba(37, 99, 235, ${day.intensity})`,
                opacity: day.activity > 0 ? 1 : 0.3
              }}
              title={`${day.day} ${day.month}: ${day.activity} transacciones`}
            />
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Menos actividad</span>
          <div className="legend-gradient" />
          <span>Más actividad</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.section 
      className={`advanced-charts ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="charts-header">
        <h2>
          <Zap size={24} />
          Gráficos Avanzados
        </h2>
        
        <div className="chart-controls">
          <div className="chart-type-selector">
            <button
              className={`chart-type-btn ${selectedChart === 'scatter' ? 'active' : ''}`}
              onClick={() => setSelectedChart('scatter')}
            >
              <Target size={16} />
              Dispersión
            </button>
            <button
              className={`chart-type-btn ${selectedChart === 'radar' ? 'active' : ''}`}
              onClick={() => setSelectedChart('radar')}
            >
              <Activity size={16} />
              Radar
            </button>
            <button
              className={`chart-type-btn ${selectedChart === 'composed' ? 'active' : ''}`}
              onClick={() => setSelectedChart('composed')}
            >
              <TrendingUp size={16} />
              Tendencias
            </button>
            <button
              className={`chart-type-btn ${selectedChart === 'heatmap' ? 'active' : ''}`}
              onClick={() => setSelectedChart('heatmap')}
            >
              <BarChart3 size={16} />
              Heatmap
            </button>
          </div>
        </div>
      </div>

      <div className="charts-content">
        {selectedChart === 'scatter' && renderScatterChart()}
        {selectedChart === 'radar' && renderRadarChart()}
        {selectedChart === 'composed' && renderComposedChart()}
        {selectedChart === 'heatmap' && renderHeatmap()}
      </div>

      {/* Métricas adicionales */}
      <div className="advanced-metrics">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <TrendingUp size={20} />
            </div>
            <div className="metric-content">
              <h4>Días más activos</h4>
              <p className="metric-value">
                {Math.max(...scatterData.map(d => d.income + d.expense)).toFixed(0)}
              </p>
              <p className="metric-subtitle">Mayor actividad</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Target size={20} />
            </div>
            <div className="metric-content">
              <h4>Categoría principal</h4>
              <p className="metric-value">
                {radarData.length > 0 ? radarData[0].category : 'N/A'}
              </p>
              <p className="metric-subtitle">
                {radarData.length > 0 ? formatCurrency(radarData[0].amount, currency) : '0'}
              </p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Activity size={20} />
            </div>
            <div className="metric-content">
              <h4>Promedio diario</h4>
              <p className="metric-value">
                {scatterData.length > 0 ? (scatterData.reduce((sum, d) => sum + d.income + d.expense, 0) / scatterData.length).toFixed(0) : '0'}
              </p>
              <p className="metric-subtitle">Actividad promedio</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

AdvancedCharts.displayName = 'AdvancedCharts';

export default AdvancedCharts;
