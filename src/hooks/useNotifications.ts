import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useFinance } from '../context/FinanceContext';

interface NotificationSettings {
  budgetAlerts: boolean;
  goalReminders: boolean;
  transactionReminders: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  lowBalanceAlerts: boolean;
  budgetExceededAlerts: boolean;
}

interface NotificationSchedule {
  dailyReminder: string; // HH:MM format
  weeklyReport: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  monthlyReport: number; // Day of month (1-31)
}

const DEFAULT_SETTINGS: NotificationSettings = {
  budgetAlerts: true,
  goalReminders: true,
  transactionReminders: true,
  weeklyReports: true,
  monthlyReports: true,
  lowBalanceAlerts: true,
  budgetExceededAlerts: true
};

const DEFAULT_SCHEDULE: NotificationSchedule = {
  dailyReminder: '09:00',
  weeklyReport: 'monday',
  monthlyReport: 1
};

export const useNotifications = () => {
  const { filteredTransactions, currency } = useFinance();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [schedule, setSchedule] = useState<NotificationSchedule>(DEFAULT_SCHEDULE);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if notifications are supported
  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('planificfinan-notification-settings');
    const savedSchedule = localStorage.getItem('planificfinan-notification-schedule');
    
    if (savedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
    }
    if (savedSchedule) {
      setSchedule({ ...DEFAULT_SCHEDULE, ...JSON.parse(savedSchedule) });
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('planificfinan-notification-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('planificfinan-notification-schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Las notificaciones no están soportadas en este navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notificaciones habilitadas');
        return true;
      } else {
        toast.error('Permisos de notificación denegados');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Error al solicitar permisos');
      return false;
    }
  }, [isSupported]);

  // Show notification
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && isSupported) {
      try {
        const notification = new Notification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options
        });

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback to toast
        toast(title, {
          duration: 5000,
          icon: options?.icon || '🔔'
        });
      }
    } else {
      // Fallback to toast notification
      toast(title, {
        duration: 5000,
        icon: options?.icon || '🔔'
      });
    }
  }, [permission, isSupported]);

  // Budget exceeded alert
  const checkBudgetAlerts = useCallback(() => {
    if (!settings.budgetExceededAlerts) return;

    const budgets = JSON.parse(localStorage.getItem('planificfinan-budgets') || '[]');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    budgets.forEach((budget: any) => {
      const spent = filteredTransactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.amount) * 100;

      if (percentage > 100) {
        showNotification(
          'Presupuesto Excedido',
          {
            body: `Has excedido el presupuesto de ${budget.category} en ${(percentage - 100).toFixed(1)}%`,
            icon: '⚠️'
          }
        );
      } else if (percentage > 80) {
        showNotification(
          'Presupuesto Cerca del Límite',
          {
            body: `Te quedan ${((budget.amount - spent) / budget.amount * 100).toFixed(1)}% del presupuesto de ${budget.category}`,
            icon: '⚠️'
          }
        );
      }
    });
  }, [filteredTransactions, settings.budgetExceededAlerts, showNotification]);

  // Low balance alert
  const checkLowBalance = useCallback(() => {
    if (!settings.lowBalanceAlerts) return;

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;

    // Alert if balance is negative or very low
    if (balance < 0) {
      showNotification(
        'Balance Negativo',
        {
          body: `Tu balance actual es negativo: ${balance.toFixed(2)} ${currency}`,
          icon: '💸'
        }
      );
    } else if (balance < 100) {
      showNotification(
        'Balance Bajo',
        {
          body: `Tu balance actual es muy bajo: ${balance.toFixed(2)} ${currency}`,
          icon: '💰'
        }
      );
    }
  }, [filteredTransactions, currency, settings.lowBalanceAlerts, showNotification]);

  // Goal reminders
  const checkGoalReminders = useCallback(() => {
    if (!settings.goalReminders) return;

    const goals = JSON.parse(localStorage.getItem('planificfinan-goals') || '[]');
    const today = new Date();
    
    goals.forEach((goal: any) => {
      const deadline = new Date(goal.deadline);
      const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const progress = (goal.currentAmount / goal.targetAmount) * 100;

      // Remind if deadline is approaching and goal is not complete
      if (daysRemaining <= 7 && daysRemaining > 0 && progress < 100) {
        showNotification(
          'Meta de Ahorro',
          {
            body: `${goal.name}: Te quedan ${daysRemaining} días. Progreso: ${progress.toFixed(1)}%`,
            icon: '🎯'
          }
        );
      }
    });
  }, [settings.goalReminders, showNotification]);

  // Daily reminder
  const sendDailyReminder = useCallback(() => {
    if (!settings.transactionReminders) return;

    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = filteredTransactions.filter(t => t.date === today);

    if (todayTransactions.length === 0) {
      showNotification(
        'Recordatorio Diario',
        {
          body: 'No has registrado ninguna transacción hoy. ¿Quieres agregar alguna?',
          icon: '📝'
        }
      );
    }
  }, [filteredTransactions, settings.transactionReminders, showNotification]);

  // Weekly report
  const sendWeeklyReport = useCallback(() => {
    if (!settings.weeklyReports) return;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekTransactions = filteredTransactions.filter(t => 
      new Date(t.date) >= weekAgo
    );

    const weekIncome = weekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const weekExpense = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    showNotification(
      'Reporte Semanal',
      {
        body: `Esta semana: Ingresos ${weekIncome.toFixed(2)} ${currency}, Gastos ${weekExpense.toFixed(2)} ${currency}`,
        icon: '📊'
      }
    );
  }, [filteredTransactions, currency, settings.weeklyReports, showNotification]);

  // Monthly report
  const sendMonthlyReport = useCallback(() => {
    if (!settings.monthlyReports) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    showNotification(
      'Reporte Mensual',
      {
        body: `Este mes: Ingresos ${monthIncome.toFixed(2)} ${currency}, Gastos ${monthExpense.toFixed(2)} ${currency}`,
        icon: '📈'
      }
    );
  }, [filteredTransactions, currency, settings.monthlyReports, showNotification]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Update schedule
  const updateSchedule = useCallback((newSchedule: Partial<NotificationSchedule>) => {
    setSchedule(prev => ({ ...prev, ...newSchedule }));
  }, []);

  // Manual notification triggers
  const triggerBudgetCheck = useCallback(() => {
    checkBudgetAlerts();
  }, [checkBudgetAlerts]);

  const triggerBalanceCheck = useCallback(() => {
    checkLowBalance();
  }, [checkLowBalance]);

  const triggerGoalCheck = useCallback(() => {
    checkGoalReminders();
  }, [checkGoalReminders]);

  return {
    // State
    settings,
    schedule,
    isSupported,
    permission,
    
    // Actions
    requestPermission,
    showNotification,
    updateSettings,
    updateSchedule,
    
    // Checks
    checkBudgetAlerts,
    checkLowBalance,
    checkGoalReminders,
    sendDailyReminder,
    sendWeeklyReport,
    sendMonthlyReport,
    
    // Manual triggers
    triggerBudgetCheck,
    triggerBalanceCheck,
    triggerGoalCheck
  };
};
