import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Lightbulb,
  Target,
  Zap,
  DollarSign,
  Calendar,
  PieChart
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { getCategoryName } from '../utils/categories';
import { FinancialInsight } from '../types';
import './FinancialInsights.css';

const FinancialInsights: React.FC = React.memo(() => {
  const { 
    filteredTransactions, 
    financialSummary, 
    categoryAnalysis, 
    monthlyTrends,
    currency 
  } = useFinance();

  // Generar insights automáticamente
  const insights = useMemo(() => {
    const generatedInsights: FinancialInsight[] = [];
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 7);

    // 1. Análisis de tasa de ahorro
    if (financialSummary.savingsRate > 20) {
      generatedInsights.push({
        id: 'savings-rate-high',
        type: 'positive',
        title: '¡Excelente tasa de ahorro!',
        message: `Estás ahorrando el ${financialSummary.savingsRate.toFixed(1)}% de tus ingresos. Esto está por encima del objetivo recomendado del 20%.`,
        value: financialSummary.savingsRate,
        timestamp: Date.now()
      });
    } else if (financialSummary.savingsRate < 10 && financialSummary.savingsRate > 0) {
      generatedInsights.push({
        id: 'savings-rate-low',
        type: 'warning',
        title: 'Tasa de ahorro baja',
        message: `Tu tasa de ahorro actual es del ${financialSummary.savingsRate.toFixed(1)}%. Considera reducir gastos o aumentar ingresos.`,
        value: financialSummary.savingsRate,
        timestamp: Date.now()
      });
    }

    // 2. Análisis de gastos por categoría
    const topExpenseCategory = categoryAnalysis
      .filter(c => c.expense > 0)
      .sort((a, b) => b.expense - a.expense)[0];

    if (topExpenseCategory && topExpenseCategory.expense > financialSummary.totalIncome * 0.4) {
      generatedInsights.push({
        id: 'high-category-spending',
        type: 'warning',
        title: 'Gasto alto en categoría',
        message: `Estás gastando ${formatCurrency(topExpenseCategory.expense, currency)} en ${getCategoryName(topExpenseCategory.category)}, que representa más del 40% de tus ingresos.`,
        value: topExpenseCategory.expense,
        category: topExpenseCategory.category,
        timestamp: Date.now()
      });
    }

    // 3. Análisis de tendencias mensuales
    if (monthlyTrends.length >= 2) {
      const currentMonthData = monthlyTrends.find(t => t.month === currentMonth);
      const lastMonthData = monthlyTrends.find(t => t.month === lastMonth);

      if (currentMonthData && lastMonthData) {
        const expenseChange = ((currentMonthData.expense - lastMonthData.expense) / lastMonthData.expense) * 100;
        
        if (expenseChange > 20) {
          generatedInsights.push({
            id: 'expense-increase',
            type: 'warning',
            title: 'Aumento significativo en gastos',
            message: `Tus gastos aumentaron ${expenseChange.toFixed(1)}% comparado con el mes pasado. Revisa tus gastos para mantener el control.`,
            value: expenseChange,
            timestamp: Date.now()
          });
        } else if (expenseChange < -15) {
          generatedInsights.push({
            id: 'expense-decrease',
            type: 'positive',
            title: '¡Reducción de gastos!',
            message: `Excelente trabajo reduciendo gastos en ${Math.abs(expenseChange).toFixed(1)}% comparado con el mes pasado.`,
            value: expenseChange,
            timestamp: Date.now()
          });
        }
      }
    }

    // 4. Análisis de frecuencia de transacciones
    const avgDailyTransactions = filteredTransactions.length / 30;
    if (avgDailyTransactions > 3) {
      generatedInsights.push({
        id: 'high-transaction-frequency',
        type: 'info',
        title: 'Frecuencia alta de transacciones',
        message: `Tienes un promedio de ${avgDailyTransactions.toFixed(1)} transacciones por día. Considera consolidar algunos gastos.`,
        value: avgDailyTransactions,
        timestamp: Date.now()
      });
    }

    // 5. Análisis de balance
    if (financialSummary.balance > 0) {
      const monthsToSave = financialSummary.balance > 0 ? 
        Math.ceil(financialSummary.totalExpense / (financialSummary.totalIncome - financialSummary.totalExpense)) : 0;
      
      if (monthsToSave <= 3 && monthsToSave > 0) {
        generatedInsights.push({
          id: 'low-emergency-fund',
          type: 'warning',
          title: 'Fondo de emergencia bajo',
          message: `Con tu tasa de ahorro actual, solo tienes ${monthsToSave} meses de gastos cubiertos. Se recomienda tener 3-6 meses.`,
          value: monthsToSave,
          timestamp: Date.now()
        });
      }
    }

    // 6. Análisis de categorías con pocas transacciones
    const categoriesWithFewTransactions = categoryAnalysis
      .filter(c => c.count < 3 && c.expense > 0);
    
    if (categoriesWithFewTransactions.length > 0) {
      const category = categoriesWithFewTransactions[0];
      generatedInsights.push({
        id: 'infrequent-category',
        type: 'info',
        title: 'Categoría con pocas transacciones',
        message: `La categoría "${getCategoryName(category.category)}" tiene solo ${category.count} transacciones. ¿Podrías consolidar estos gastos?`,
        value: category.count,
        category: category.category,
        timestamp: Date.now()
      });
    }

    // 7. Análisis de ingresos vs gastos
    if (financialSummary.totalExpense > financialSummary.totalIncome) {
      generatedInsights.push({
        id: 'spending-more-than-income',
        type: 'warning',
        title: 'Gastando más de lo que ganas',
        message: `Estás gastando ${formatCurrency(financialSummary.totalExpense - financialSummary.totalIncome, currency)} más de lo que ingresas. Es importante ajustar tu presupuesto.`,
        value: financialSummary.totalExpense - financialSummary.totalIncome,
        timestamp: Date.now()
      });
    }

    // 8. Insight positivo por consistencia
    if (monthlyTrends.length >= 3) {
      const recentMonths = monthlyTrends.slice(-3);
      const isConsistent = recentMonths.every(month => 
        month.balance > 0 && Math.abs(month.balance - recentMonths[0].balance) < recentMonths[0].balance * 0.2
      );
      
      if (isConsistent) {
        generatedInsights.push({
          id: 'consistent-savings',
          type: 'positive',
          title: 'Ahorros consistentes',
          message: `Has mantenido un balance positivo y consistente durante los últimos ${recentMonths.length} meses. ¡Sigue así!`,
          timestamp: Date.now()
        });
      }
    }

    return generatedInsights.sort((a, b) => {
      // Priorizar warnings, luego positivos, luego info
      const priority = { warning: 0, positive: 1, info: 2 };
      return priority[a.type] - priority[b.type];
    });
  }, [filteredTransactions, financialSummary, categoryAnalysis, monthlyTrends, currency]);

  const getInsightIcon = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Lightbulb size={20} />;
    }
  };

  const getInsightColor = (type: FinancialInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'var(--success-color)';
      case 'warning':
        return 'var(--warning-color)';
      case 'info':
        return 'var(--info-color)';
      default:
        return 'var(--primary-blue)';
    }
  };

  if (insights.length === 0) {
    return (
      <motion.section 
        className="financial-insights"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="insights-header">
          <h2>
            <Lightbulb size={24} />
            Insights Financieros
          </h2>
        </div>
        
        <div className="empty-insights">
          <div className="empty-icon">
            <Target size={48} />
          </div>
          <h3>No hay insights disponibles</h3>
          <p>Agrega más transacciones para recibir análisis automáticos y recomendaciones personalizadas.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      className="financial-insights"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="insights-header">
        <h2>
          <Lightbulb size={24} />
          Insights Financieros
        </h2>
        <p className="insights-subtitle">
          Análisis automático de tus finanzas personales
        </p>
      </div>

      <div className="insights-grid">
        <AnimatePresence>
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              className={`insight-card ${insight.type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="insight-header">
                <div 
                  className="insight-icon"
                  style={{ color: getInsightColor(insight.type) }}
                >
                  {getInsightIcon(insight.type)}
                </div>
                <div className="insight-content">
                  <h3 className="insight-title">{insight.title}</h3>
                  <p className="insight-message">{insight.message}</p>
                </div>
              </div>

              {insight.value !== undefined && (
                <div className="insight-value">
                  <span className="value-number">
                    {insight.value > 100 ? 
                      formatCurrency(insight.value, currency) : 
                      `${insight.value.toFixed(1)}%`
                    }
                  </span>
                  {insight.category && (
                    <span className="value-category">
                      {getCategoryName(insight.category)}
                    </span>
                  )}
                </div>
              )}

              <div className="insight-timestamp">
                <Calendar size={12} />
                <span>
                  {new Date(insight.timestamp).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Resumen de insights */}
      <div className="insights-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-icon positive">
              <CheckCircle size={16} />
            </div>
            <span>{insights.filter(i => i.type === 'positive').length} positivos</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon warning">
              <AlertTriangle size={16} />
            </div>
            <span>{insights.filter(i => i.type === 'warning').length} advertencias</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon info">
              <Info size={16} />
            </div>
            <span>{insights.filter(i => i.type === 'info').length} informativos</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
});

FinancialInsights.displayName = 'FinancialInsights';

export default FinancialInsights;
