import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinanceProvider, useFinance } from '../FinanceContext';
import { Transaction } from '../../types';

// Test component that uses the context
const TestComponent = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    financialSummary 
  } = useFinance();

  const handleAddTransaction = () => {
    addTransaction({
      description: 'Test transaction',
      amount: 100,
      category: 'comida',
      type: 'expense',
      date: '2024-01-15'
    });
  };

  const handleDeleteTransaction = () => {
    if (transactions.length > 0) {
      deleteTransaction(transactions[0].id);
    }
  };

  return (
    <div>
      <div data-testid="transaction-count">{transactions.length}</div>
      <div data-testid="balance">{financialSummary.balance}</div>
      <button onClick={handleAddTransaction}>Add Transaction</button>
      <button onClick={handleDeleteTransaction}>Delete Transaction</button>
    </div>
  );
};

describe('FinanceContext', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <FinanceProvider>
        {component}
      </FinanceProvider>
    );
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should provide initial state', () => {
    renderWithProvider(<TestComponent />);
    
    expect(screen.getByTestId('transaction-count')).toHaveTextContent('0');
    expect(screen.getByTestId('balance')).toHaveTextContent('0');
  });

  it('should add transaction successfully', async () => {
    renderWithProvider(<TestComponent />);
    
    fireEvent.click(screen.getByText('Add Transaction'));
    
    await waitFor(() => {
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('1');
    });
  });

  it('should delete transaction successfully', async () => {
    renderWithProvider(<TestComponent />);
    
    // Add a transaction first
    fireEvent.click(screen.getByText('Add Transaction'));
    
    await waitFor(() => {
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('1');
    });
    
    // Then delete it
    fireEvent.click(screen.getByText('Delete Transaction'));
    
    await waitFor(() => {
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('0');
    });
  });

  it('should calculate balance correctly', async () => {
    renderWithProvider(<TestComponent />);
    
    // Add an expense
    fireEvent.click(screen.getByText('Add Transaction'));
    
    await waitFor(() => {
      expect(screen.getByTestId('balance')).toHaveTextContent('-100');
    });
  });
});
