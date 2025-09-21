// Tipos globales para la aplicación de finanzas personales

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  timestamp: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  expenseRatio: number;
  transactionCount: number;
  avgTransaction: number;
}

export interface Filters {
  type: 'all' | 'income' | 'expense';
  category: string;
  search: string;
}

export interface Alert {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface FinanceState {
  transactions: Transaction[];
  currency: string;
  filters: Filters;
  alert: Alert;
  loading: boolean;
}

export interface FinanceContextType extends FinanceState {
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'timestamp'>) => boolean;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  setCurrency: (currency: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  showAlert: (message: string, type?: Alert['type']) => void;
  importTransactions: (transactions: Transaction[]) => void;
  filteredTransactions: Transaction[];
  financialSummary: FinancialSummary;
  uniqueCategories: string[];
  categoryAnalysis: CategoryAnalysis[];
  monthlyTrends: MonthlyTrend[];
}

export interface CurrencyConfig {
  symbol: string;
  name: string;
  locale: string;
}

export interface Category {
  key: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface TransactionFormData {
  description: string;
  amount: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Tipos para las props de componentes
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
}

export interface InputProps extends ComponentProps {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
}

export interface SelectProps extends ComponentProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
}

// Tipos para utilidades
export type Period = 'week' | 'month' | 'year';

export interface PeriodStats {
  income: number;
  expense: number;
  balance: number;
  count: number;
  period: Period;
}

export interface CategoryAnalysis {
  category: string;
  income: number;
  expense: number;
  total: number;
  count: number;
  avgAmount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface FinancialInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  message: string;
  value?: number;
  category?: string;
  timestamp: number;
}

// Tipos para el contexto de finanzas
export type FinanceAction = 
  | { type: 'LOAD_DATA'; payload: { transactions: Transaction[]; currency: string } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'CLEAR_ALL_TRANSACTIONS' }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SHOW_ALERT'; payload: { message: string; type: Alert['type'] } }
  | { type: 'HIDE_ALERT' }
  | { type: 'IMPORT_TRANSACTIONS'; payload: Transaction[] };
