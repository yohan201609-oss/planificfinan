import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FinanceProvider, useFinance } from '../FinanceContext';
import { Transaction } from '../../types';

// Test component to interact with the context
const TestComponent = () => {
  const { addTransaction, showAlert, transactions } = useFinance();
  
  const handleAddTransaction = () => {
    const transactionData = {
      description: '<script>alert("xss")</script>Test transaction',
      amount: 100,
      category: 'food',
      type: 'expense' as const,
      date: '2024-01-01'
    };
    addTransaction(transactionData);
  };

  return (
    <div>
      <button onClick={handleAddTransaction}>Add Transaction</button>
      <div data-testid="transaction-count">{transactions.length}</div>
      <div data-testid="transactions">
        {transactions.map(t => (
          <div key={t.id} data-testid={`transaction-${t.id}`}>
            {t.description}
          </div>
        ))}
      </div>
    </div>
  );
};

const renderWithFinanceProvider = (component: React.ReactElement) => {
  return render(
    <FinanceProvider>
      {component}
    </FinanceProvider>
  );
};

describe('FinanceContext Security Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('XSS Protection', () => {
    it('should sanitize XSS attempts in transaction description', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(<TestComponent />);

      const addButton = screen.getByText('Add Transaction');
      await user.click(addButton);

      await waitFor(() => {
        const transactions = screen.getByTestId('transactions');
        expect(transactions).toHaveTextContent('Test transaction');
        expect(transactions).not.toHaveTextContent('<script>');
        expect(transactions).not.toHaveTextContent('alert');
      });
    });

    it('should sanitize HTML tags in transaction data', async () => {
      const user = userEvent.setup();
      const TestComponentWithHTML = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const transactionData = {
            description: '<div>Test</div><img src="x" onerror="alert(1)">',
            amount: 100,
            category: 'food',
            type: 'expense' as const,
            date: '2024-01-01'
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add HTML Transaction</button>;
      };

      renderWithFinanceProvider(<TestComponentWithHTML />);

      const addButton = screen.getByText('Add HTML Transaction');
      await user.click(addButton);

      await waitFor(() => {
        const transactions = screen.getByTestId('transactions');
        expect(transactions).toHaveTextContent('Test');
        expect(transactions).not.toHaveTextContent('<div>');
        expect(transactions).not.toHaveTextContent('<img>');
      });
    });
  });

  describe('Input Validation', () => {
    it('should reject transactions with invalid amounts', async () => {
      const user = userEvent.setup();
      const TestComponentInvalidAmount = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const transactionData = {
            description: 'Test transaction',
            amount: -100, // Invalid negative amount
            category: 'food',
            type: 'expense' as const,
            date: '2024-01-01'
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add Invalid Amount</button>;
      };

      renderWithFinanceProvider(<TestComponentInvalidAmount />);

      const addButton = screen.getByText('Add Invalid Amount');
      await user.click(addButton);

      await waitFor(() => {
        const transactionCount = screen.getByTestId('transaction-count');
        expect(transactionCount).toHaveTextContent('0');
      });
    });

    it('should reject transactions with excessive amounts', async () => {
      const user = userEvent.setup();
      const TestComponentExcessiveAmount = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const transactionData = {
            description: 'Test transaction',
            amount: 2000000, // Exceeds limit
            category: 'food',
            type: 'expense' as const,
            date: '2024-01-01'
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add Excessive Amount</button>;
      };

      renderWithFinanceProvider(<TestComponentExcessiveAmount />);

      const addButton = screen.getByText('Add Excessive Amount');
      await user.click(addButton);

      await waitFor(() => {
        const transactionCount = screen.getByTestId('transaction-count');
        expect(transactionCount).toHaveTextContent('0');
      });
    });

    it('should reject transactions with future dates', async () => {
      const user = userEvent.setup();
      const TestComponentFutureDate = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const futureDate = new Date();
          futureDate.setFullYear(futureDate.getFullYear() + 1);
          
          const transactionData = {
            description: 'Test transaction',
            amount: 100,
            category: 'food',
            type: 'expense' as const,
            date: futureDate.toISOString().split('T')[0]
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add Future Date</button>;
      };

      renderWithFinanceProvider(<TestComponentFutureDate />);

      const addButton = screen.getByText('Add Future Date');
      await user.click(addButton);

      await waitFor(() => {
        const transactionCount = screen.getByTestId('transaction-count');
        expect(transactionCount).toHaveTextContent('0');
      });
    });

    it('should reject transactions with old dates', async () => {
      const user = userEvent.setup();
      const TestComponentOldDate = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const oldDate = new Date();
          oldDate.setFullYear(oldDate.getFullYear() - 2);
          
          const transactionData = {
            description: 'Test transaction',
            amount: 100,
            category: 'food',
            type: 'expense' as const,
            date: oldDate.toISOString().split('T')[0]
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add Old Date</button>;
      };

      renderWithFinanceProvider(<TestComponentOldDate />);

      const addButton = screen.getByText('Add Old Date');
      await user.click(addButton);

      await waitFor(() => {
        const transactionCount = screen.getByTestId('transaction-count');
        expect(transactionCount).toHaveTextContent('0');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should allow multiple transactions within rate limit', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(<TestComponent />);

      const addButton = screen.getByText('Add Transaction');
      
      // Add 5 transactions (within limit)
      for (let i = 0; i < 5; i++) {
        await user.click(addButton);
        await waitFor(() => {
          expect(screen.getByTestId('transaction-count')).toHaveTextContent((i + 1).toString());
        });
      }
    });

    it('should block transactions exceeding rate limit', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(<TestComponent />);

      const addButton = screen.getByText('Add Transaction');
      
      // Add 10 transactions (at limit)
      for (let i = 0; i < 10; i++) {
        await user.click(addButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId('transaction-count')).toHaveTextContent('10');
      });

      // Try to add one more (should be blocked)
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('transaction-count')).toHaveTextContent('10');
      });
    });
  });

  describe('SQL Injection Protection', () => {
    it('should sanitize SQL injection attempts in description', async () => {
      const user = userEvent.setup();
      const TestComponentSQLInjection = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const transactionData = {
            description: "'; DROP TABLE transactions; --",
            amount: 100,
            category: 'food',
            type: 'expense' as const,
            date: '2024-01-01'
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add SQL Injection</button>;
      };

      renderWithFinanceProvider(<TestComponentSQLInjection />);

      const addButton = screen.getByText('Add SQL Injection');
      await user.click(addButton);

      await waitFor(() => {
        const transactions = screen.getByTestId('transactions');
        expect(transactions).not.toHaveTextContent('DROP TABLE');
        expect(transactions).not.toHaveTextContent('--');
      });
    });

    it('should sanitize SQL injection attempts in category', async () => {
      const user = userEvent.setup();
      const TestComponentSQLInjectionCategory = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const transactionData = {
            description: 'Test transaction',
            amount: 100,
            category: "admin' OR '1'='1",
            type: 'expense' as const,
            date: '2024-01-01'
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add SQL Injection Category</button>;
      };

      renderWithFinanceProvider(<TestComponentSQLInjectionCategory />);

      const addButton = screen.getByText('Add SQL Injection Category');
      await user.click(addButton);

      await waitFor(() => {
        const transactions = screen.getByTestId('transactions');
        expect(transactions).not.toHaveTextContent('OR');
        expect(transactions).not.toHaveTextContent('1=1');
      });
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data integrity after sanitization', async () => {
      const user = userEvent.setup();
      renderWithFinanceProvider(<TestComponent />);

      const addButton = screen.getByText('Add Transaction');
      await user.click(addButton);

      await waitFor(() => {
        const transactions = screen.getByTestId('transactions');
        expect(transactions).toHaveTextContent('Test transaction');
        
        // Verify the transaction object is properly structured
        const transactionElements = screen.getAllByTestId(/transaction-/);
        expect(transactionElements).toHaveLength(1);
      });
    });

    it('should preserve valid data while sanitizing malicious content', async () => {
      const user = userEvent.setup();
      const TestComponentMixedContent = () => {
        const { addTransaction } = useFinance();
        
        const handleAddTransaction = () => {
          const transactionData = {
            description: 'Valid description <script>alert("xss")</script> with malicious content',
            amount: 100,
            category: 'food',
            type: 'expense' as const,
            date: '2024-01-01'
          };
          addTransaction(transactionData);
        };

        return <button onClick={handleAddTransaction}>Add Mixed Content</button>;
      };

      renderWithFinanceProvider(<TestComponentMixedContent />);

      const addButton = screen.getByText('Add Mixed Content');
      await user.click(addButton);

      await waitFor(() => {
        const transactions = screen.getByTestId('transactions');
        expect(transactions).toHaveTextContent('Valid description');
        expect(transactions).toHaveTextContent('with malicious content');
        expect(transactions).not.toHaveTextContent('<script>');
        expect(transactions).not.toHaveTextContent('alert');
      });
    });
  });
});
