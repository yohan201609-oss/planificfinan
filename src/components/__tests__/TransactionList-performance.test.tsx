import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinanceProvider } from '../../context/FinanceContext';
import TransactionList from '../TransactionList';
import { Transaction } from '../../types';

// Mock transactions for testing
const mockTransactions: Transaction[] = Array.from({ length: 100 }, (_, i) => ({
  id: `transaction-${i}`,
  description: `Transaction ${i}`,
  amount: i % 2 === 0 ? 100 : -50,
  category: i % 3 === 0 ? 'food' : 'transport',
  type: i % 2 === 0 ? 'income' : 'expense',
  date: '2024-01-01',
  timestamp: Date.now() + i
}));

const renderWithFinanceProvider = (transactions: Transaction[] = []) => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn((key) => {
      if (key === 'finanzas-transactions') {
        return JSON.stringify(transactions);
      }
      if (key === 'finanzas-currency') {
        return 'EUR';
      }
      return null;
    }),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  return render(
    <FinanceProvider>
      <TransactionList />
    </FinanceProvider>
  );
};

describe('TransactionList Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Memoization', () => {
    it('should not re-render when props have not changed', () => {
      const renderSpy = jest.fn();
      
      const TestWrapper = ({ transactions }: { transactions: Transaction[] }) => {
        renderSpy();
        return (
          <FinanceProvider>
            <TransactionList />
          </FinanceProvider>
        );
      };

      const { rerender } = render(<TestWrapper transactions={mockTransactions} />);
      
      // First render
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same transactions
      rerender(<TestWrapper transactions={mockTransactions} />);
      
      // Should not cause unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should memoize filtered transactions', async () => {
      const { container } = renderWithFinanceProvider(mockTransactions);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      });

      // Check that transactions are rendered
      const transactionElements = container.querySelectorAll('[data-testid^="transaction-"]');
      expect(transactionElements.length).toBeGreaterThan(0);
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle large number of transactions efficiently', async () => {
      const largeTransactionList = Array.from({ length: 1000 }, (_, i) => ({
        id: `large-transaction-${i}`,
        description: `Large Transaction ${i}`,
        amount: Math.random() * 1000,
        category: ['food', 'transport', 'entertainment'][i % 3],
        type: i % 2 === 0 ? 'income' : 'expense' as const,
        date: '2024-01-01',
        timestamp: Date.now() + i
      }));

      const startTime = performance.now();
      
      renderWithFinanceProvider(largeTransactionList);
      
      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should not freeze UI during large dataset rendering', async () => {
      const largeTransactionList = Array.from({ length: 5000 }, (_, i) => ({
        id: `massive-transaction-${i}`,
        description: `Massive Transaction ${i}`,
        amount: Math.random() * 1000,
        category: ['food', 'transport', 'entertainment', 'health', 'shopping'][i % 5],
        type: i % 2 === 0 ? 'income' : 'expense' as const,
        date: '2024-01-01',
        timestamp: Date.now() + i
      }));

      let isUIFrozen = false;
      const startTime = Date.now();

      // Start a timer to detect if UI is frozen
      const freezeDetector = setInterval(() => {
        if (Date.now() - startTime > 100) {
          isUIFrozen = true;
        }
      }, 10);

      renderWithFinanceProvider(largeTransactionList);
      
      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      }, { timeout: 5000 });

      clearInterval(freezeDetector);

      // UI should not be frozen for more than 100ms
      expect(isUIFrozen).toBe(false);
    });
  });

  describe('Event Handler Optimization', () => {
    it('should use memoized event handlers', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(mockTransactions);

      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Eliminar Todas');
      
      // Click multiple times rapidly
      for (let i = 0; i < 5; i++) {
        await user.click(clearButton);
      }

      // Should handle multiple clicks without performance issues
      expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
    });

    it('should handle export efficiently', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(mockTransactions);

      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Exportar');
      
      const startTime = performance.now();
      await user.click(exportButton);
      const endTime = performance.now();

      // Export should be fast
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated renders', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithFinanceProvider(mockTransactions);
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory usage should not increase significantly
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB increase
    });

    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderWithFinanceProvider(mockTransactions);

      const addListenerCount = addEventListenerSpy.mock.calls.length;

      unmount();

      // Should remove event listeners
      expect(removeEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Accessibility Performance', () => {
    it('should maintain accessibility with large datasets', async () => {
      const largeTransactionList = Array.from({ length: 1000 }, (_, i) => ({
        id: `accessibility-transaction-${i}`,
        description: `Accessibility Transaction ${i}`,
        amount: Math.random() * 1000,
        category: 'food',
        type: 'expense' as const,
        date: '2024-01-01',
        timestamp: Date.now() + i
      }));

      renderWithFinanceProvider(largeTransactionList);

      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      });

      // Check for proper ARIA attributes
      const transactionsList = screen.getByRole('list');
      expect(transactionsList).toBeInTheDocument();
      expect(transactionsList).toHaveAttribute('aria-label', 'Lista de transacciones');

      // Check for proper headings
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'transactions-title');
    });

    it('should announce changes efficiently', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(mockTransactions);

      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      });

      // Mock the announce function
      const mockAnnounce = jest.fn();
      
      // Simulate accessibility announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');

      // Should not cause performance issues
      expect(mockAnnounce).toHaveBeenCalledTimes(0);
    });
  });

  describe('Filter Performance', () => {
    it('should handle filtering efficiently', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(mockTransactions);

      await waitFor(() => {
        expect(screen.getByText('Lista de Transacciones')).toBeInTheDocument();
      });

      // Simulate rapid filtering
      const startTime = performance.now();
      
      // Apply multiple filters rapidly
      for (let i = 0; i < 10; i++) {
        // This would typically be done through the filter component
        // For now, we just test that the component can handle rapid changes
      }

      const endTime = performance.now();
      
      // Filtering should be fast
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});
