import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { getCategoryIcon, getCategoryName } from '../utils/categories';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface AnimatedTransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  index: number;
}

const AnimatedTransactionItem: React.FC<AnimatedTransactionItemProps> = React.memo(({
  transaction,
  onDelete,
  index
}) => {
  const isIncome = transaction.type === 'income';
  const icon = isIncome ? TrendingUp : TrendingDown;
  const IconComponent = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.1
      }}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`transaction-item ${transaction.type}`}
      role="listitem"
      aria-label={`${transaction.description} - ${formatCurrency(transaction.amount)}`}
    >
      <motion.div 
        className="transaction-icon"
        whileHover={{ rotate: 5 }}
        transition={{ duration: 0.2 }}
      >
        <IconComponent size={20} />
      </motion.div>
      
      <div className="transaction-details">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {transaction.description}
        </motion.h3>
        
        <motion.div 
          className="transaction-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span 
            className="transaction-category-badge"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.1 }}
          >
            {getCategoryName(transaction.category)}
          </motion.span>
          
          <motion.span 
            className="transaction-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {new Date(transaction.date).toLocaleDateString('es-ES')}
          </motion.span>
        </motion.div>
      </div>
      
      <motion.div 
        className="transaction-amount"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
      >
        {formatCurrency(transaction.amount)}
      </motion.div>
      
      <motion.button
        className="delete-btn"
        onClick={() => onDelete(transaction.id)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        aria-label={`Eliminar transacción: ${transaction.description}`}
      >
        <Trash2 size={16} />
      </motion.button>
    </motion.div>
  );
});

AnimatedTransactionItem.displayName = 'AnimatedTransactionItem';

export default AnimatedTransactionItem;
