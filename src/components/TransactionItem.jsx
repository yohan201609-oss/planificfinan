import React from 'react';
import { Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/helpers';
import { getCategoryIcon, getCategoryName } from '../utils/categories';
import './TransactionItem.css';

const TransactionItem = ({ transaction }) => {
  const { deleteTransaction, currency } = useFinance();

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      deleteTransaction(transaction.id);
    }
  };

  const iconName = getCategoryIcon(transaction.category);
  const IconComponent = Icons[iconName] || Icons.Circle;
  const categoryName = getCategoryName(transaction.category);
  const formattedDate = formatDate(transaction.date);
  const formattedAmount = formatCurrency(Math.abs(transaction.amount), currency);

  return (
    <div className={`transaction-item ${transaction.type}`}>
      <div className="transaction-icon">
        <IconComponent size={20} />
      </div>
      
      <div className="transaction-details">
        <h3>{transaction.description}</h3>
        <div className="transaction-meta">
          <span className="transaction-category-badge">
            {categoryName}
          </span>
          <span className="transaction-date">
            {formattedDate}
          </span>
        </div>
      </div>
      
      <div className="transaction-amount">
        {transaction.type === 'income' ? '+' : '-'}{formattedAmount}
      </div>
      
      <button 
        className="delete-btn"
        onClick={handleDelete}
        title="Eliminar transacción"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default TransactionItem;



