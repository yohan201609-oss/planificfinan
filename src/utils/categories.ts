import { Category } from '../types';

// Categories configuration with icons
export const CATEGORIES: Record<string, Omit<Category, 'key'>> = {
  // Income categories
  salario: { name: 'Salario', icon: 'Briefcase', type: 'income' },
  freelance: { name: 'Freelance', icon: 'Laptop', type: 'income' },
  inversion: { name: 'Inversión', icon: 'TrendingUp', type: 'income' },
  
  // Expense categories
  comida: { name: 'Comida', icon: 'UtensilsCrossed', type: 'expense' },
  transporte: { name: 'Transporte', icon: 'Car', type: 'expense' },
  entretenimiento: { name: 'Entretenimiento', icon: 'Gamepad2', type: 'expense' },
  servicios: { name: 'Servicios', icon: 'Settings', type: 'expense' },
  salud: { name: 'Salud', icon: 'Heart', type: 'expense' },
  compras: { name: 'Compras', icon: 'ShoppingBag', type: 'expense' },
  otros: { name: 'Otros', icon: 'MoreHorizontal', type: 'expense' }
};

export const getCategoryIcon = (category: string): string => {
  return CATEGORIES[category]?.icon || 'Circle';
};

export const getCategoryName = (category: string): string => {
  return CATEGORIES[category]?.name || category;
};

export const getIncomeCategories = (): Category[] => {
  return Object.entries(CATEGORIES)
    .filter(([, config]) => config.type === 'income')
    .map(([key, config]) => ({ key, ...config }));
};

export const getExpenseCategories = (): Category[] => {
  return Object.entries(CATEGORIES)
    .filter(([, config]) => config.type === 'expense')
    .map(([key, config]) => ({ key, ...config }));
};

export const getAllCategories = (): Category[] => {
  return Object.entries(CATEGORIES)
    .map(([key, config]) => ({ key, ...config }));
};



