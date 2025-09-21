import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { getTodayDate } from '../utils/helpers';
import { getAllCategories } from '../utils/categories';
import { TransactionFormData, FormErrors } from '../types';
import './AnimatedForm.css';

const AnimatedForm: React.FC = React.memo(() => {
  const { addTransaction } = useFinance();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    amount: '',
    category: '',
    type: 'income',
    date: getTodayDate()
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const categories = getAllCategories();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    const success = addTransaction(transactionData);
    
    if (success) {
      setSubmitStatus('success');
      setFormData({
        description: '',
        amount: '',
        category: '',
        type: 'income',
        date: getTodayDate()
      });
      setErrors({});
      
      // Reset status after animation
      setTimeout(() => setSubmitStatus('idle'), 2000);
    } else {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 2000);
    }
    
    setIsSubmitting(false);
  };

  return (
    <motion.section 
      className="animated-form-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      data-testid="transaction-form"
      role="form"
      aria-labelledby="form-title"
    >
      <motion.h2 
        id="form-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Agregar Transacción
      </motion.h2>
      
      <form onSubmit={handleSubmit} className="animated-form">
        <motion.div 
          className="form-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.div 
            className="form-group"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.label 
              htmlFor="description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Descripción
            </motion.label>
            <motion.input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Salario, Compras, etc."
              maxLength={100}
              required
              whileFocus={{ 
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                borderColor: "#2563eb"
              }}
              transition={{ duration: 0.2 }}
            />
            <AnimatePresence>
              {errors.description && (
                <motion.span 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle size={16} />
                  {errors.description}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className="form-group"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.label 
              htmlFor="amount"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Cantidad
            </motion.label>
            <motion.input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
              whileFocus={{ 
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                borderColor: "#2563eb"
              }}
              transition={{ duration: 0.2 }}
            />
            <AnimatePresence>
              {errors.amount && (
                <motion.span 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle size={16} />
                  {errors.amount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div 
          className="form-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <motion.div 
            className="form-group"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.label 
              htmlFor="category"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Categoría
            </motion.label>
            <motion.select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              whileFocus={{ 
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                borderColor: "#2563eb"
              }}
              transition={{ duration: 0.2 }}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category, index) => (
                <motion.option 
                  key={category.key} 
                  value={category.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                >
                  {category.name}
                </motion.option>
              ))}
            </motion.select>
            <AnimatePresence>
              {errors.category && (
                <motion.span 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle size={16} />
                  {errors.category}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            className="form-group"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.label 
              htmlFor="type"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Tipo
            </motion.label>
            <motion.select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              whileFocus={{ 
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                borderColor: "#2563eb"
              }}
              transition={{ duration: 0.2 }}
            >
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </motion.select>
          </motion.div>
        </motion.div>

        <motion.div 
          className="form-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.div 
            className="form-group"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.label 
              htmlFor="date"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Fecha
            </motion.label>
            <motion.input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              whileFocus={{ 
                boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                borderColor: "#2563eb"
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
          
          <motion.div 
            className="form-group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <motion.button 
              type="submit" 
              className={`btn-add ${submitStatus}`}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Plus size={20} />
                    </motion.div>
                  </motion.div>
                ) : submitStatus === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Check size={20} />
                  </motion.div>
                ) : submitStatus === 'error' ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AlertCircle size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                {isSubmitting ? 'Agregando...' : 'Agregar'}
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.div>
      </form>
    </motion.section>
  );
});

AnimatedForm.displayName = 'AnimatedForm';

export default AnimatedForm;
