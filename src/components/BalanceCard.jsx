import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currency';
import './BalanceCard.css';

const BalanceCard = () => {
  const { financialSummary, currency } = useFinance();
  const { totalIncome, totalExpense, balance } = financialSummary;

  const getBalanceClass = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <section className="balance-section">
      <div className="balance-card">
        <h2>Balance Total</h2>
        <div className={`balance-amount ${getBalanceClass(balance)}`}>
          {formatCurrency(balance, currency)}
        </div>
      </div>
      
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-header">
            <ArrowUp className="summary-icon" size={20} />
            <span>Ingresos</span>
          </div>
          <div className="summary-amount">
            {formatCurrency(totalIncome, currency)}
          </div>
        </div>
        
        <div className="summary-card expense">
          <div className="summary-header">
            <ArrowDown className="summary-icon" size={20} />
            <span>Gastos</span>
          </div>
          <div className="summary-amount">
            {formatCurrency(totalExpense, currency)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BalanceCard;



