import { Transaction, ValidationResult, Period, PeriodStats } from '../types';

// Helper utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const validateTransaction = (transaction: Partial<Transaction>): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!transaction.description?.trim()) {
    errors.description = 'La descripción es requerida';
  } else if (transaction.description.length > 100) {
    errors.description = 'La descripción no puede exceder 100 caracteres';
  }

  if (!transaction.amount || transaction.amount <= 0) {
    errors.amount = 'La cantidad debe ser mayor a 0';
  }

  if (!transaction.category) {
    errors.category = 'La categoría es requerida';
  }

  if (!transaction.type) {
    errors.type = 'El tipo es requerido';
  }

  if (!transaction.date) {
    errors.date = 'La fecha es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getStatsByPeriod = (transactions: Transaction[], period: Period = 'month'): PeriodStats => {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  const periodTransactions = transactions.filter(t => 
    new Date(t.date) >= startDate
  );

  const income = periodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    income,
    expense,
    balance: income - expense,
    count: periodTransactions.length,
    period
  };
};

export const searchTransactions = (transactions: Transaction[], query: string): Transaction[] => {
  if (!query.trim()) return transactions;
  
  const lowercaseQuery = query.toLowerCase();
  return transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(lowercaseQuery) ||
    transaction.category.toLowerCase().includes(lowercaseQuery)
  );
};



