import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import './Alert.css';

const Alert = () => {
  const { alert } = useFinance();

  if (!alert.show) return null;

  const Icon = alert.type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`alert alert-${alert.type}`}>
      <div className="alert-content">
        <Icon className="alert-icon" size={20} />
        <span className="alert-message">{alert.message}</span>
        <button 
          className="alert-close"
          onClick={() => {}} 
          aria-label="Cerrar alerta"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Alert;
