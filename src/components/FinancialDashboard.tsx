import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { getCategoryName } from '../utils/categories';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import './FinancialDashboard.css';

const COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

const FinancialDashboard: React.FC = React.memo(() => {
  const { filteredTransactions, currency } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'income' | 'expense' | 'balance'>('balance');

  // Calcular datos para gráficos
  const chartData = useMemo(() => {
    const categoryData: { [key: string]: { income: number; expense: number } } = {};

    filteredTransactions.forEach(transaction => {
      const category = getCategoryName(transaction.category);
      if (!categoryData[category]) {
        categoryData[category] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        categoryData[category].income += transaction.amount;
      } else {
        categoryData[category].expense += transaction.amount;
      }
    });

    return Object.entries(categoryData).map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense,
      total: data.income + data.expense
    }));
  }, [filteredTransactions]);

  // Datos para gráfico de pastel
  const pieData = useMemo(() => {
    const expenseData = chartData
      .filter(item => item.expense > 0)
      .map((item, index) => ({
        name: item.name,
        value: item.expense,
        color: COLORS[index % COLORS.length]
      }));

    const incomeData = chartData
      .filter(item => item.income > 0)
      .map((item, index) => ({
        name: item.name,
        value: item.income,
        color: COLORS[index % COLORS.length]
      }));

    return { expenseData, incomeData };
  }, [chartData]);

  // Datos de series temporales
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = startOfMonth(now);
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTransactions = filteredTransactions.filter(t => t.date === dateStr);
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(date, 'MMM dd', { locale: es }),
        fullDate: dateStr,
        income,
        expense,
        balance: income - expense
      };
    });
  }, [filteredTransactions, selectedPeriod]);

  // Métricas principales
  const metrics = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    const transactionCount = filteredTransactions.length;

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount,
      avgTransaction: transactionCount > 0 ? (totalIncome + totalExpense) / transactionCount : 0
    };
  }, [filteredTransactions]);

  // Top categorías
  const topCategories = useMemo(() => {
    return chartData
      .sort((a, b) => b.expense - a.expense)
      .slice(0, 5);
  }, [chartData]);

  const renderTooltip = (active: boolean, payload: any[], label: string) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
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

  return (
    <motion.section 
      className="financial-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <h2>
          <Activity size={24} />
          Dashboard Financiero
        </h2>
        
        <div className="dashboard-controls">
          <div className="period-selector">
            {(['week', 'month', 'year'] as const).map(period => (
              <button
                key={period}
                className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="metrics-grid">
        <motion.div 
          className="metric-card income"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Ingresos</h3>
            <p className="metric-value">{formatCurrency(metrics.totalIncome, currency)}</p>
            <p className="metric-subtitle">Total de ingresos</p>
          </div>
        </motion.div>

        <motion.div 
          className="metric-card expense"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="metric-icon">
            <TrendingDown size={24} />
          </div>
          <div className="metric-content">
            <h3>Gastos</h3>
            <p className="metric-value">{formatCurrency(metrics.totalExpense, currency)}</p>
            <p className="metric-subtitle">Total de gastos</p>
          </div>
        </motion.div>

        <motion.div 
          className="metric-card balance"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>Balance</h3>
            <p className={`metric-value ${metrics.balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(metrics.balance, currency)}
            </p>
            <p className="metric-subtitle">Ingresos - Gastos</p>
          </div>
        </motion.div>

        <motion.div 
          className="metric-card transactions"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="metric-icon">
            <Target size={24} />
          </div>
          <div className="metric-content">
            <h3>Transacciones</h3>
            <p className="metric-value">{metrics.transactionCount}</p>
            <p className="metric-subtitle">
              Promedio: {formatCurrency(metrics.avgTransaction, currency)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Gráfico de líneas - Tendencias */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="chart-header">
            <h3>
              <Activity size={20} />
              Tendencias Temporales
            </h3>
            <div className="chart-type-selector">
              {(['income', 'expense', 'balance'] as const).map(type => (
                <button
                  key={type}
                  className={`chart-type-btn ${selectedChart === type ? 'active' : ''}`}
                  onClick={() => setSelectedChart(type)}
                >
                  {type === 'income' ? 'Ingresos' : type === 'expense' ? 'Gastos' : 'Balance'}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value, currency)} />
                <Tooltip content={renderTooltip} />
                <Area
                  type="monotone"
                  dataKey={selectedChart}
                  stroke="#2563eb"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de barras - Categorías */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="chart-header">
            <h3>
              <BarChart3 size={20} />
              Gastos por Categoría
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value, currency)} />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de pastel - Distribución */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="chart-header">
            <h3>
              <PieChartIcon size={20} />
              Distribución de Gastos
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData.expenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Categorías */}
      <motion.div 
        className="top-categories"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Top Categorías de Gastos</h3>
        <div className="categories-list">
          {topCategories.map((category, index) => (
            <motion.div 
              key={category.name}
              className="category-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="category-rank">#{index + 1}</div>
              <div className="category-info">
                <h4>{category.name}</h4>
                <p>{formatCurrency(category.expense, currency)}</p>
              </div>
              <div className="category-bar">
                <div 
                  className="category-fill"
                  style={{ 
                    width: `${(category.expense / topCategories[0]?.expense) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length]
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
});

FinancialDashboard.displayName = 'FinancialDashboard';

export default FinancialDashboard;
