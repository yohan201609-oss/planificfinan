import { Transaction } from '../types';

// Local storage utilities
const STORAGE_KEYS = {
  TRANSACTIONS: 'planificfinan-transactions',
  CURRENCY: 'planificfinan-currency',
  SETTINGS: 'planificfinan-settings'
} as const;

export const saveTransactions = (transactions: Transaction[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
    return false;
  }
};

export const loadTransactions = (): Transaction[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    return [];
  }
};

export const saveCurrency = (currency: string): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    return true;
  } catch (error) {
    console.error('Error saving currency to localStorage:', error);
    return false;
  }
};

export const loadCurrency = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'EUR';
  } catch (error) {
    console.error('Error loading currency from localStorage:', error);
    return 'EUR';
  }
};

export const exportData = (transactions: Transaction[]): boolean => {
  try {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finanzas-personales-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

export const importData = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          resolve(importedData);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(new Error('Error parsing file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};



