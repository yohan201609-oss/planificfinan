import { 
  generateId, 
  capitalizeFirst, 
  formatDate, 
  getTodayDate, 
  validateTransaction,
  getStatsByPeriod,
  searchTransactions
} from '../helpers';
import { Transaction } from '../../types';

describe('Helper Functions', () => {
  describe('generateId', () => {
    it('should generate a unique string', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize the first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('world')).toBe('World');
      expect(capitalizeFirst('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('getTodayDate', () => {
    it('should return today date in ISO format', () => {
      const today = getTodayDate();
      expect(today).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('validateTransaction', () => {
    it('should validate correct transaction', () => {
      const validTransaction = {
        description: 'Test transaction',
        amount: 100,
        category: 'comida',
        type: 'expense' as const,
        date: '2024-01-15'
      };

      const result = validateTransaction(validTransaction);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject transaction with missing description', () => {
      const invalidTransaction = {
        description: '',
        amount: 100,
        category: 'comida',
        type: 'expense' as const,
        date: '2024-01-15'
      };

      const result = validateTransaction(invalidTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('La descripción es requerida');
    });

    it('should reject transaction with invalid amount', () => {
      const invalidTransaction = {
        description: 'Test',
        amount: 0,
        category: 'comida',
        type: 'expense' as const,
        date: '2024-01-15'
      };

      const result = validateTransaction(invalidTransaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('La cantidad debe ser mayor a 0');
    });
  });

  describe('getStatsByPeriod', () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        description: 'Income',
        amount: 1000,
        category: 'salario',
        type: 'income',
        date: '2024-01-15',
        timestamp: Date.now()
      },
      {
        id: '2',
        description: 'Expense',
        amount: 200,
        category: 'comida',
        type: 'expense',
        date: '2024-01-16',
        timestamp: Date.now()
      }
    ];

    it('should calculate stats correctly', () => {
      const stats = getStatsByPeriod(mockTransactions, 'month');
      
      expect(stats.income).toBe(1000);
      expect(stats.expense).toBe(200);
      expect(stats.balance).toBe(800);
      expect(stats.count).toBe(2);
      expect(stats.period).toBe('month');
    });
  });

  describe('searchTransactions', () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        description: 'Grocery shopping',
        amount: 50,
        category: 'comida',
        type: 'expense',
        date: '2024-01-15',
        timestamp: Date.now()
      },
      {
        id: '2',
        description: 'Salary payment',
        amount: 2000,
        category: 'salario',
        type: 'income',
        date: '2024-01-16',
        timestamp: Date.now()
      }
    ];

    it('should return all transactions when query is empty', () => {
      const result = searchTransactions(mockTransactions, '');
      expect(result).toEqual(mockTransactions);
    });

    it('should filter by description', () => {
      const result = searchTransactions(mockTransactions, 'grocery');
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Grocery shopping');
    });

    it('should filter by category', () => {
      const result = searchTransactions(mockTransactions, 'comida');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('comida');
    });
  });
});
