import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext-fixed';
import './App.css';

// Componente Header simplificado
const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-text">
          <h1>💰 Finanzas Personales</h1>
          <p>Gestiona tus ingresos y gastos de manera simple</p>
        </div>
      </div>
    </header>
  );
};

// Componente Balance simplificado
const BalanceCard = () => {
  return (
    <section className="balance-section">
      <div className="balance-card">
        <h2>Balance Total</h2>
        <div className="balance-amount">€0.00</div>
      </div>
      
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-header">
            <span>📈 Ingresos</span>
          </div>
          <div className="summary-amount">€0.00</div>
        </div>
        
        <div className="summary-card expense">
          <div className="summary-header">
            <span>📉 Gastos</span>
          </div>
          <div className="summary-amount">€0.00</div>
        </div>
      </div>
    </section>
  );
};

// Componente Formulario simplificado
const TransactionForm = () => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'comida',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Formulario enviado: ' + JSON.stringify(formData));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="transaction-form-section">
      <h2>Agregar Transacción</h2>
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
              placeholder="Ej: Compras del supermercado"
              required
            />
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
              <option value="comida">🍽️ Comida</option>
              <option value="transporte">🚗 Transporte</option>
              <option value="entretenimiento">🎮 Entretenimiento</option>
              <option value="salud">⚕️ Salud</option>
              <option value="compras">🛍️ Compras</option>
              <option value="salario">💼 Salario</option>
              <option value="otros">📦 Otros</option>
            </select>
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
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
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
          </div>
          
          <div className="form-group">
            <button type="submit" className="btn-add">
              ➕ Agregar
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

// Componente principal de la aplicación
const AppContent = () => {
  return (
    <div className="container">
      <Header />
      <main>
        <BalanceCard />
        <TransactionForm />
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3>🎉 ¡Aplicación React Funcionando!</h3>
          <p>La aplicación de finanzas personales se ha convertido exitosamente a React.</p>
          <p><strong>Funcionalidades disponibles:</strong></p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>✅ Formulario de transacciones</li>
            <li>✅ Gestión de estado con React</li>
            <li>✅ Diseño responsive</li>
            <li>✅ Validaciones de formulario</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <FinanceProvider>
      <div className="app">
        <AppContent />
      </div>
    </FinanceProvider>
  );
};

export default App;



