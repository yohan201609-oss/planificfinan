import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { getCategoryName, getAllCategories } from '../utils/categories';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import './BudgetManager.css';

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  color: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: string;
  color: string;
}

const COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

const BudgetManager: React.FC = React.memo(() => {
  const { filteredTransactions, currency } = useFinance();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Cargar datos del localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('planificfinan-budgets');
    const savedGoals = localStorage.getItem('planificfinan-goals');
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem('planificfinan-budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('planificfinan-goals', JSON.stringify(goals));
  }, [goals]);

  // Calcular gastos actuales por categoría
  const currentSpending = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    
    const spending: { [key: string]: number } = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, {
          start: currentMonthStart,
          end: currentMonthEnd
        });
      })
      .forEach(t => {
        const category = getCategoryName(t.category);
        spending[category] = (spending[category] || 0) + t.amount;
      });
    
    return spending;
  }, [filteredTransactions]);

  // Calcular progreso de presupuestos
  const budgetProgress = useMemo(() => {
    return budgets.map(budget => {
      const spent = currentSpending[getCategoryName(budget.category)] || 0;
      const percentage = (spent / budget.amount) * 100;
      const remaining = budget.amount - spent;
      
      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        remaining,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });
  }, [budgets, currentSpending]);

  // Calcular progreso de metas
  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      const daysRemaining = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        ...goal,
        progress: Math.min(progress, 100),
        remaining,
        daysRemaining,
        status: progress >= 100 ? 'completed' : daysRemaining <= 0 ? 'overdue' : progress > 75 ? 'good' : 'needs-attention'
      };
    });
  }, [goals]);

  const handleAddBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString()
    };
    setBudgets(prev => [...prev, newBudget]);
    setShowBudgetModal(false);
  };

  const handleEditBudget = (budgetData: Budget) => {
    setBudgets(prev => prev.map(b => b.id === budgetData.id ? budgetData : b));
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleAddGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString()
    };
    setGoals(prev => [...prev, newGoal]);
    setShowGoalModal(false);
  };

  const handleEditGoal = (goalData: Goal) => {
    setGoals(prev => prev.map(g => g.id === goalData.id ? goalData : g));
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const openBudgetModal = (budget?: Budget) => {
    setEditingBudget(budget || null);
    setShowBudgetModal(true);
  };

  const openGoalModal = (goal?: Goal) => {
    setEditingGoal(goal || null);
    setShowGoalModal(true);
  };

  return (
    <motion.section 
      className="budget-manager"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="budget-header">
        <h2>
          <Target size={24} />
          Presupuestos y Metas
        </h2>
        
        <div className="budget-actions">
          <motion.button
            className="btn-add-budget"
            onClick={() => openBudgetModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} />
            Presupuesto
          </motion.button>
          
          <motion.button
            className="btn-add-goal"
            onClick={() => openGoalModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} />
            Meta
          </motion.button>
        </div>
      </div>

      {/* Resumen de Presupuestos */}
      <div className="budget-summary">
        <h3>Resumen de Presupuestos</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon good">
              <CheckCircle size={20} />
            </div>
            <div className="summary-content">
              <p className="summary-number">
                {budgetProgress.filter(b => b.status === 'good').length}
              </p>
              <p className="summary-label">En buen estado</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon warning">
              <AlertTriangle size={20} />
            </div>
            <div className="summary-content">
              <p className="summary-number">
                {budgetProgress.filter(b => b.status === 'warning').length}
              </p>
              <p className="summary-label">Cerca del límite</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon over">
              <TrendingUp size={20} />
            </div>
            <div className="summary-content">
              <p className="summary-number">
                {budgetProgress.filter(b => b.status === 'over').length}
              </p>
              <p className="summary-label">Excedidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Presupuestos */}
      <div className="budgets-section">
        <h3>Presupuestos Activos</h3>
        {budgetProgress.length === 0 ? (
          <div className="empty-state">
            <Target size={48} />
            <p>No tienes presupuestos configurados</p>
            <p>Crea tu primer presupuesto para empezar a controlar tus gastos</p>
          </div>
        ) : (
          <div className="budgets-list">
            {budgetProgress.map((budget, index) => (
              <motion.div
                key={budget.id}
                className={`budget-card ${budget.status}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="budget-header-card">
                  <div className="budget-info">
                    <h4>{getCategoryName(budget.category)}</h4>
                    <p className="budget-period">
                      {budget.period === 'monthly' ? 'Mensual' : 
                       budget.period === 'weekly' ? 'Semanal' : 'Anual'}
                    </p>
                  </div>
                  
                  <div className="budget-actions-card">
                    <button
                      onClick={() => openBudgetModal(budget)}
                      className="btn-edit"
                      title="Editar presupuesto"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="btn-delete"
                      title="Eliminar presupuesto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="budget-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Presupuesto:</span>
                    <span className="amount-value">{formatCurrency(budget.amount, currency)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Gastado:</span>
                    <span className="amount-value">{formatCurrency(budget.spent, currency)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Restante:</span>
                    <span className={`amount-value ${budget.remaining >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(budget.remaining, currency)}
                    </span>
                  </div>
                </div>
                
                <div className="budget-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${budget.percentage}%`,
                        backgroundColor: budget.status === 'over' ? '#dc2626' : 
                                       budget.status === 'warning' ? '#d97706' : '#10b981'
                      }}
                    />
                  </div>
                  <span className="progress-text">{budget.percentage.toFixed(1)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Metas */}
      <div className="goals-section">
        <h3>Metas de Ahorro</h3>
        {goalProgress.length === 0 ? (
          <div className="empty-state">
            <Target size={48} />
            <p>No tienes metas configuradas</p>
            <p>Establece metas de ahorro para alcanzar tus objetivos financieros</p>
          </div>
        ) : (
          <div className="goals-list">
            {goalProgress.map((goal, index) => (
              <motion.div
                key={goal.id}
                className={`goal-card ${goal.status}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="goal-header-card">
                  <div className="goal-info">
                    <h4>{goal.name}</h4>
                    <p className="goal-deadline">
                      <Calendar size={14} />
                      {format(new Date(goal.deadline), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  
                  <div className="goal-actions-card">
                    <button
                      onClick={() => openGoalModal(goal)}
                      className="btn-edit"
                      title="Editar meta"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="btn-delete"
                      title="Eliminar meta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="goal-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Meta:</span>
                    <span className="amount-value">{formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Actual:</span>
                    <span className="amount-value">{formatCurrency(goal.currentAmount, currency)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Restante:</span>
                    <span className="amount-value">{formatCurrency(goal.remaining, currency)}</span>
                  </div>
                </div>
                
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${goal.progress}%`,
                        backgroundColor: goal.status === 'completed' ? '#10b981' : 
                                       goal.status === 'overdue' ? '#dc2626' : 
                                       goal.status === 'good' ? '#059669' : '#d97706'
                      }}
                    />
                  </div>
                  <span className="progress-text">{goal.progress.toFixed(1)}%</span>
                </div>
                
                {goal.daysRemaining > 0 && (
                  <div className="goal-days">
                    <p>{goal.daysRemaining} días restantes</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {showBudgetModal && (
          <BudgetModal
            budget={editingBudget}
            onSave={editingBudget ? handleEditBudget : handleAddBudget}
            onClose={() => {
              setShowBudgetModal(false);
              setEditingBudget(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGoalModal && (
          <GoalModal
            goal={editingGoal}
            onSave={editingGoal ? handleEditGoal : handleAddGoal}
            onClose={() => {
              setShowGoalModal(false);
              setEditingGoal(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
});

BudgetManager.displayName = 'BudgetManager';

export default BudgetManager;
