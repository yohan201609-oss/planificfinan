import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  saveTransactions, 
  loadTransactions, 
  saveCurrency, 
  loadCurrency 
} from '../utils/storage';
import { generateId, validateTransaction } from '../utils/helpers';
import { 
  FinanceState, 
  FinanceContextType, 
  Transaction, 
  FinanceAction,
  Alert
} from '../types';

// Action types
const ACTIONS = {
  LOAD_DATA: 'LOAD_DATA',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  CLEAR_ALL_TRANSACTIONS: 'CLEAR_ALL_TRANSACTIONS',
  SET_CURRENCY: 'SET_CURRENCY',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SHOW_ALERT: 'SHOW_ALERT',
  HIDE_ALERT: 'HIDE_ALERT',
  IMPORT_TRANSACTIONS: 'IMPORT_TRANSACTIONS'
} as const;

// Initial state
const initialState: FinanceState = {
  transactions: [],
  currency: 'EUR',
  filters: {
    type: 'all',
    category: 'all',
    search: ''
  },
  alert: {
    show: false,
    message: '',
    type: 'success'
  },
  loading: false
};

// Reducer function
const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case ACTIONS.LOAD_DATA:
      return {
        ...state,
        transactions: action.payload.transactions,
        currency: action.payload.currency,
        loading: false
      };

    case ACTIONS.ADD_TRANSACTION:
      const newTransactions = [action.payload, ...state.transactions];
      saveTransactions(newTransactions);
      return {
        ...state,
        transactions: newTransactions
      };

    case ACTIONS.DELETE_TRANSACTION:
      const filteredTransactions = state.transactions.filter(
        t => t.id !== action.payload
      );
      saveTransactions(filteredTransactions);
      return {
        ...state,
        transactions: filteredTransactions
      };

    case ACTIONS.CLEAR_ALL_TRANSACTIONS:
      saveTransactions([]);
      return {
        ...state,
        transactions: []
      };

    case ACTIONS.SET_CURRENCY:
      saveCurrency(action.payload);
      return {
        ...state,
        currency: action.payload
      };

    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          type: 'all',
          category: 'all',
          search: ''
        }
      };

    case ACTIONS.SHOW_ALERT:
      return {
        ...state,
        alert: {
          show: true,
          message: action.payload.message,
          type: action.payload.type
        }
      };

    case ACTIONS.HIDE_ALERT:
      return {
        ...state,
        alert: { ...state.alert, show: false }
      };

    case ACTIONS.IMPORT_TRANSACTIONS:
      saveTransactions(action.payload);
      return {
        ...state,
        transactions: action.payload
      };

    default:
      return state;
  }
};

// Create context
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Provider component
export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Load data on mount
  useEffect(() => {
    const transactions = loadTransactions();
    const currency = loadCurrency();
    dispatch({
      type: ACTIONS.LOAD_DATA,
      payload: { transactions, currency }
    });
  }, []);

  // Auto-hide alerts
  useEffect(() => {
    if (state.alert.show) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.HIDE_ALERT });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.alert.show]);

  // Action creators
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'timestamp'>): boolean => {
    const validation = validateTransaction(transactionData);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      showAlert(errorMessage, 'error');
      return false;
    }

    const transaction = {
      id: generateId(),
      ...transactionData,
      amount: transactionData.type === 'expense' 
        ? -Math.abs(transactionData.amount) 
        : Math.abs(transactionData.amount),
      timestamp: new Date().getTime()
    };

    dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: transaction });
    showAlert('Transacción agregada exitosamente', 'success');
    return true;
  };

  const deleteTransaction = (id: string): void => {
    dispatch({ type: ACTIONS.DELETE_TRANSACTION, payload: id });
    showAlert('Transacción eliminada', 'success');
  };

  const clearAllTransactions = (): void => {
    dispatch({ type: ACTIONS.CLEAR_ALL_TRANSACTIONS });
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
    showAlert('Todas las transacciones han sido eliminadas', 'success');
  };

  const setCurrency = (currency: string): void => {
    dispatch({ type: ACTIONS.SET_CURRENCY, payload: currency });
    showAlert(`Moneda cambiada a ${currency}`, 'success');
  };

  const setFilters = (filters: Partial<Filters>): void => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
  };

  const clearFilters = (): void => {
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
  };

  const showAlert = (message: string, type: Alert['type'] = 'success'): void => {
    dispatch({ 
      type: ACTIONS.SHOW_ALERT, 
      payload: { message, type } 
    });
  };

  const importTransactions = (transactions: Transaction[]): void => {
    dispatch({ type: ACTIONS.IMPORT_TRANSACTIONS, payload: transactions });
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
    showAlert('Datos importados exitosamente', 'success');
  };

  // Computed values
  const getFilteredTransactions = (): Transaction[] => {
    let filtered = [...state.transactions];

    // Apply type filter
    if (state.filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === state.filters.type);
    }

    // Apply category filter
    if (state.filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === state.filters.category);
    }

    // Apply search filter
    if (state.filters.search) {
      const query = state.filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getFinancialSummary = () => {
    const totalIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance
    };
  };

  const getUniqueCategories = (): string[] => {
    return [...new Set(state.transactions.map(t => t.category))];
  };

  const value = {
    // State
    ...state,
    
    // Actions
    addTransaction,
    deleteTransaction,
    clearAllTransactions,
    setCurrency,
    setFilters,
    clearFilters,
    showAlert,
    importTransactions,
    
    // Computed values
    filteredTransactions: getFilteredTransactions(),
    financialSummary: getFinancialSummary(),
    uniqueCategories: getUniqueCategories()
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// Custom hook to use the context
export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export default FinanceContext;



