import React, { useState } from 'react';
import './index.css';

const App = () => {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('finanzas-transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('finanzas-currency') || 'EUR';
    } catch {
      return 'EUR';
    }
  });
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'comida',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  // Configuración de monedas
  const currencies = {
    EUR: { symbol: '€', name: 'Euro', locale: 'es-ES' },
    USD: { symbol: '$', name: 'Dólar Estadounidense', locale: 'en-US' },
    DOP: { symbol: 'RD$', name: 'Peso Dominicano', locale: 'es-DO' },
    MXN: { symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
    ARS: { symbol: '$', name: 'Peso Argentino', locale: 'es-AR' },
    COP: { symbol: '$', name: 'Peso Colombiano', locale: 'es-CO' },
    CLP: { symbol: '$', name: 'Peso Chileno', locale: 'es-CL' },
    PEN: { symbol: 'S/', name: 'Sol Peruano', locale: 'es-PE' },
    GBP: { symbol: '£', name: 'Libra Esterlina', locale: 'en-GB' },
    CAD: { symbol: '$', name: 'Dólar Canadiense', locale: 'en-CA' },
    JPY: { symbol: '¥', name: 'Yen Japonés', locale: 'ja-JP' }
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    const config = currencies[currency];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: ['JPY', 'CLP', 'COP'].includes(currency) ? 0 : 2
    }).format(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount)
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('finanzas-transactions', JSON.stringify(updatedTransactions));
    
    setFormData({
      description: '',
      amount: '',
      category: 'comida',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
    
    alert('¡Transacción agregada exitosamente!');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const deleteTransaction = (id) => {
    if (window.confirm('¿Eliminar esta transacción?')) {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      localStorage.setItem('finanzas-transactions', JSON.stringify(updatedTransactions));
    }
  };

  // Función para cambiar moneda
  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('finanzas-currency', newCurrency);
    alert(`Moneda cambiada a ${currencies[newCurrency].name}`);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Banner de Actualización */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '1.1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          🎉 ¡ACTUALIZACIÓN EXITOSA! - Los cambios se han aplicado correctamente - v2.0
        </div>

        {/* Header */}
        <header style={{
          marginBottom: '40px',
          padding: '30px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'left', flex: '1' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: '0 0 10px 0',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                🚀 NUEVA VERSIÓN - Finanzas Personales v2.0
              </h1>
              <p style={{
                fontSize: '1.1rem',
                opacity: '0.9',
                fontWeight: '300',
                margin: '0'
              }}>
                ✅ ACTUALIZACIÓN EXITOSA - Gestiona tus finanzas con nuevas características
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '200px'
            }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: '0.9'
              }}>
                🪙 Moneda:
              </label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                style={{
                  padding: '10px 14px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(currencies).map(([code, config]) => (
                  <option 
                    key={code} 
                    value={code}
                    style={{
                      background: '#1f2937',
                      color: 'white',
                      padding: '10px'
                    }}
                  >
                    {config.symbol} {config.name} ({code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Balance Cards */}
        <section style={{ marginBottom: '40px' }}>
          {/* Balance Total */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '20px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #dbeafe'
          }}>
            <h2 style={{
              color: '#6b7280',
              fontSize: '1.2rem',
              marginBottom: '15px',
              fontWeight: '500'
            }}>
              Balance Total
            </h2>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: balance >= 0 ? '#10b981' : '#ef4444',
              textShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}>
              {formatCurrency(balance)}
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Ingresos */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
                color: '#6b7280'
              }}>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  padding: '8px',
                  borderRadius: '50%',
                  marginRight: '10px'
                }}>
                  📈
                </span>
                <span>Ingresos</span>
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                {formatCurrency(totalIncome)}
              </div>
            </div>

            {/* Gastos */}
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderLeft: '4px solid #ef4444'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
                color: '#6b7280'
              }}>
                <span style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '8px',
                  borderRadius: '50%',
                  marginRight: '10px'
                }}>
                  📉
                </span>
                <span>Gastos</span>
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                {formatCurrency(totalExpense)}
              </div>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #dbeafe'
        }}>
          <h2 style={{
            color: '#2563eb',
            marginBottom: '25px',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Agregar Transacción
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ej: Compras del supermercado"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  Cantidad ({currencies[currency].symbol})
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                >
                  <option value="comida">🍽️ Comida</option>
                  <option value="transporte">🚗 Transporte</option>
                  <option value="entretenimiento">🎮 Entretenimiento</option>
                  <option value="salud">⚕️ Salud</option>
                  <option value="compras">🛍️ Compras</option>
                  <option value="servicios">🔧 Servicios</option>
                  <option value="salario">💼 Salario</option>
                  <option value="freelance">💻 Freelance</option>
                  <option value="otros">📦 Otros</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  Tipo
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                >
                  <option value="expense">💸 Gasto</option>
                  <option value="income">💰 Ingreso</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              alignItems: 'end'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white'
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    minHeight: '48px'
                  }}
                >
                  ➕ Agregar Transacción
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Lista de Transacciones */}
        <section style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid #dbeafe'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            padding: '25px 30px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0'
            }}>
              Historial de Transacciones ({transactions.length})
            </h2>
            {transactions.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('¿Eliminar todas las transacciones? Esta acción no se puede deshacer.')) {
                    setTransactions([]);
                    localStorage.setItem('finanzas-transactions', JSON.stringify([]));
                    alert('Todas las transacciones han sido eliminadas');
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.8)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🗑️ Limpiar Todo
              </button>
            )}
          </div>

          <div style={{ padding: '30px' }}>
            {transactions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#9ca3af'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                  No hay transacciones registradas
                </p>
                <p>Agrega tu primera transacción usando el formulario de arriba</p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto',
                      gap: '20px',
                      alignItems: 'center',
                      padding: '20px',
                      border: '2px solid #f3f4f6',
                      borderRadius: '8px',
                      background: '#f9fafb',
                      borderLeft: `4px solid ${transaction.type === 'income' ? '#10b981' : '#ef4444'}`
                    }}
                  >
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      background: transaction.type === 'income' 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white'
                    }}>
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </div>

                    <div>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '5px'
                      }}>
                        {transaction.description}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          background: '#dbeafe',
                          color: '#2563eb',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {transaction.category}
                        </span>
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          {transaction.date}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: transaction.type === 'income' ? '#10b981' : '#ef4444',
                      textAlign: 'right'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>

                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Eliminar transacción"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <p style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600' }}>
            🚀 ¡NUEVA VERSIÓN v2.0 DESPLEGADA EXITOSAMENTE! - Los cambios están funcionando correctamente
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', opacity: '0.9' }}>
            Timestamp: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
