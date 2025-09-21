import { useMemo, useCallback, useRef } from 'react';
import { Transaction, FinancialSummary } from '../types';

export const usePerformance = () => {
  const memoizedCalculations = useRef<Map<string, any>>(new Map());

  const memoizedFinancialSummary = useCallback((transactions: Transaction[]): FinancialSummary => {
    const cacheKey = `summary-${transactions.length}-${transactions.map(t => t.id).join(',')}`;
    
    if (memoizedCalculations.current.has(cacheKey)) {
      return memoizedCalculations.current.get(cacheKey);
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = totalIncome - totalExpense;

    const summary = {
      totalIncome,
      totalExpense,
      balance
    };

    memoizedCalculations.current.set(cacheKey, summary);
    return summary;
  }, []);

  const memoizedFilteredTransactions = useCallback((
    transactions: Transaction[],
    filters: { type: string; category: string; search: string }
  ): Transaction[] => {
    const cacheKey = `filtered-${transactions.length}-${JSON.stringify(filters)}`;
    
    if (memoizedCalculations.current.has(cacheKey)) {
      return memoizedCalculations.current.get(cacheKey);
    }

    let filtered = [...transactions];

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Apply search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    memoizedCalculations.current.set(cacheKey, filtered);
    return filtered;
  }, []);

  const memoizedUniqueCategories = useCallback((transactions: Transaction[]): string[] => {
    const cacheKey = `categories-${transactions.length}`;
    
    if (memoizedCalculations.current.has(cacheKey)) {
      return memoizedCalculations.current.get(cacheKey);
    }

    const categories = [...new Set(transactions.map(t => t.category))];
    memoizedCalculations.current.set(cacheKey, categories);
    return categories;
  }, []);

  const clearCache = useCallback(() => {
    memoizedCalculations.current.clear();
  }, []);

  return {
    memoizedFinancialSummary,
    memoizedFilteredTransactions,
    memoizedUniqueCategories,
    clearCache
  };
};
