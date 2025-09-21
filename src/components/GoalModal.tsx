import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getAllCategories } from '../utils/categories';
import { format, addMonths } from 'date-fns';
import './GoalModal.css';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: string;
  color: string;
}

interface GoalModalProps {
  goal?: Goal | null;
  onSave: (goal: Goal | Omit<Goal, 'id'>) => void;
  onClose: () => void;
}

const COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

const GoalModal: React.FC<GoalModalProps> = React.memo(({ goal, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount.toString() || '',
    currentAmount: goal?.currentAmount.toString() || '',
    deadline: goal?.deadline || format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
    category: goal?.category || '',
    color: goal?.color || COLORS[0]
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ingresa el nombre de la meta';
    }
    
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Ingresa un monto objetivo válido';
    }
    
    if (!formData.currentAmount || parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Ingresa un monto actual válido';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Selecciona una fecha límite';
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'La fecha límite debe ser futura';
    }
    
    if (parseFloat(formData.currentAmount) > parseFloat(formData.targetAmount)) {
      newErrors.currentAmount = 'El monto actual no puede ser mayor al objetivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const goalData = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      category: formData.category || undefined
    };
    
    if (goal) {
      onSave({ ...goal, ...goalData });
    } else {
      onSave(goalData);
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
        className="modal-content goal-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {goal ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
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

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="name">Nombre de la Meta</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Vacaciones, Emergencia, Casa..."
              maxLength={50}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAmount">Monto Objetivo</label>
              <input
                type="number"
                id="targetAmount"
                value={formData.targetAmount}
                onChange={(e) => handleChange('targetAmount', e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className={errors.targetAmount ? 'error' : ''}
              />
              {errors.targetAmount && <span className="error-message">{errors.targetAmount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="currentAmount">Monto Actual</label>
              <input
                type="number"
                id="currentAmount"
                value={formData.currentAmount}
                onChange={(e) => handleChange('currentAmount', e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className={errors.currentAmount ? 'error' : ''}
              />
              {errors.currentAmount && <span className="error-message">{errors.currentAmount}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Fecha Límite</label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className={errors.deadline ? 'error' : ''}
            />
            {errors.deadline && <span className="error-message">{errors.deadline}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoría (Opcional)</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">Sin categoría</option>
              {categories.filter(c => c.type === 'income').map(category => (
                <option key={category.key} value={category.key}>
                  {category.name}
                </option>
              ))}
            </select>
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

          {/* Preview del progreso */}
          {formData.targetAmount && formData.currentAmount && (
            <div className="progress-preview">
              <h4>Vista Previa del Progreso</h4>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min((parseFloat(formData.currentAmount) / parseFloat(formData.targetAmount)) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="progress-text">
                {Math.min((parseFloat(formData.currentAmount) / parseFloat(formData.targetAmount)) * 100, 100).toFixed(1)}% completado
              </p>
            </div>
          )}

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
              {goal ? 'Actualizar' : 'Crear'} Meta
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
});

GoalModal.displayName = 'GoalModal';

export default GoalModal;
