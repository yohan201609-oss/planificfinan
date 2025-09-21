import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FinanceProvider } from '../../context/FinanceContext';
import TransactionForm from '../TransactionForm';
import TransactionList from '../TransactionList';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <FinanceProvider>
      {component}
    </FinanceProvider>
  );
};

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('TransactionForm', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProvider(<TransactionForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', () => {
      renderWithProvider(<TransactionForm />);
      
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cantidad/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      renderWithProvider(<TransactionForm />);
      
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('aria-labelledby', 'form-title');
    });

    it('should announce form submission', async () => {
      renderWithProvider(<TransactionForm />);
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/descripción/i), {
        target: { value: 'Test transaction' }
      });
      fireEvent.change(screen.getByLabelText(/cantidad/i), {
        target: { value: '100' }
      });
      fireEvent.change(screen.getByLabelText(/categoría/i), {
        target: { value: 'comida' }
      });
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /agregar/i }));
      
      // Check that the form was submitted (fields should be cleared)
      expect(screen.getByLabelText(/descripción/i)).toHaveValue('');
    });
  });

  describe('TransactionList', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithProvider(<TransactionList />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper section structure', () => {
      renderWithProvider(<TransactionList />);
      
      const section = screen.getByRole('region', { name: /historial de transacciones/i });
      expect(section).toBeInTheDocument();
    });

    it('should have proper button labels', () => {
      renderWithProvider(<TransactionList />);
      
      expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /limpiar todo/i })).toBeInTheDocument();
    });

    it('should announce when transactions are cleared', () => {
      renderWithProvider(<TransactionList />);
      
      const clearButton = screen.getByRole('button', { name: /limpiar todo/i });
      
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      
      fireEvent.click(clearButton);
      
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('¿Estás seguro')
      );
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', () => {
      renderWithProvider(<TransactionForm />);
      
      const descriptionInput = screen.getByLabelText(/descripción/i);
      const amountInput = screen.getByLabelText(/cantidad/i);
      const submitButton = screen.getByRole('button', { name: /agregar/i });
      
      // Tab navigation
      descriptionInput.focus();
      expect(document.activeElement).toBe(descriptionInput);
      
      fireEvent.keyDown(descriptionInput, { key: 'Tab' });
      expect(document.activeElement).toBe(amountInput);
      
      fireEvent.keyDown(amountInput, { key: 'Tab' });
      // Should move to next focusable element
      expect(document.activeElement).not.toBe(amountInput);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels', () => {
      renderWithProvider(<TransactionForm />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-labelledby', 'form-title');
      expect(form).toHaveAttribute('aria-describedby', 'form-description');
    });

    it('should have live regions for dynamic content', () => {
      renderWithProvider(<TransactionList />);
      
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});
