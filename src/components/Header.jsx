import React from 'react';
import { Wallet, Coins } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES } from '../utils/currency';
import './Header.css';

const Header = () => {
  const { currency, setCurrency } = useFinance();

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-text">
          <h1>
            <Wallet className="header-icon" size={32} />
            PlanificFinan
          </h1>
          <p>Planifica y gestiona tus finanzas personales de manera inteligente</p>
        </div>
        <div className="header-controls">
          <div className="currency-selector">
            <label htmlFor="currency-select">
              <Coins size={16} />
              Moneda:
            </label>
            <select 
              id="currency-select"
              value={currency}
              onChange={handleCurrencyChange}
            >
              {Object.entries(CURRENCIES).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.symbol} {config.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;



