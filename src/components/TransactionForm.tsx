import React, { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { getTodayDate } from '../utils/helpers';
import { getAllCategories } from '../utils/categories';
import { TransactionFormData, FormErrors } from '../types';
import { useAccessibility } from '../hooks/useAccessibility';
import './TransactionForm.css';

const TransactionForm: React.FC = React.memo(() => {
  const { addTransaction } = useFinance();
  const { announce } = useAccessibility();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    amount: '',
    category: '',
    type: 'income',
    date: getTodayDate()
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    const success = addTransaction(transactionData);
    
    if (success) {
      setFormData({
        description: '',
        amount: '',
        category: '',
        type: 'income',
        date: getTodayDate()
      });
      setErrors({});
      announce('Transacción agregada exitosamente');
    }
  }, [formData, addTransaction]);

  const categories = useMemo(() => getAllCategories(), []);

  return (
    <section 
      className="transaction-form-section"
      data-testid="transaction-form"
      role="form"
      aria-labelledby="form-title"
      aria-describedby="form-description"
    >
      <h2 id="form-title">Agregar Transacción</h2>
      <p id="form-description" className="sr-only">
        Formulario para agregar nuevas transacciones de ingresos o gastos
      </p>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Salario, Compras, etc."
              maxLength={100}
              required
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Cantidad</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
            {errors.amount && (
              <span className="error-message">{errors.amount}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="error-message">{errors.category}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
            {errors.type && (
              <span className="error-message">{errors.type}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            {errors.date && (
              <span className="error-message">{errors.date}</span>
            )}
          </div>
          
          <div className="form-group">
            <button type="submit" className="btn-add">
              <Plus size={20} />
              Agregar
            </button>
          </div>
        </div>
      </form>
    </section>
  );
});

TransactionForm.displayName = 'TransactionForm';

export default TransactionForm;



