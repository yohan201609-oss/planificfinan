import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getAllCategories } from '../utils/categories';
import { getTodayDate } from '../utils/helpers';
import { format, addMonths, addWeeks, addYears } from 'date-fns';
import './BudgetModal.css';

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  color: string;
}

interface BudgetModalProps {
  budget?: Budget | null;
  onSave: (budget: Budget | Omit<Budget, 'id'>) => void;
  onClose: () => void;
}

const COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

const BudgetModal: React.FC<BudgetModalProps> = React.memo(({ budget, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount.toString() || '',
    period: budget?.period || 'monthly' as const,
    startDate: budget?.startDate || getTodayDate(),
    color: budget?.color || COLORS[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = getAllCategories();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Ingresa un monto válido';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Selecciona una fecha de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const amount = parseFloat(formData.amount);
    const startDate = new Date(formData.startDate);
    
    let endDate: Date;
    switch (formData.period) {
      case 'weekly':
        endDate = addWeeks(startDate, 1);
        break;
      case 'monthly':
        endDate = addMonths(startDate, 1);
        break;
      case 'yearly':
        endDate = addYears(startDate, 1);
        break;
    }
    
    const budgetData = {
      ...formData,
      amount,
      endDate: format(endDate, 'yyyy-MM-dd')
    };
    
    if (budget) {
      onSave({ ...budget, ...budgetData });
    } else {
      onSave(budgetData);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content budget-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </h2>
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={errors.category ? 'error' : ''}
            >
              <option value="">Seleccionar categoría</option>
              {categories.filter(c => c.type === 'expense').map(category => (
                <option key={category.key} value={category.key}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Monto del Presupuesto</label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="period">Período</label>
            <select
              id="period"
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Fecha de Inicio</label>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <div className="color-selector">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <motion.button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.button>
            
            <motion.button
              type="submit"
              className="btn-save"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {budget ? 'Actualizar' : 'Crear'} Presupuesto
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
});

BudgetModal.displayName = 'BudgetModal';

export default BudgetModal;
