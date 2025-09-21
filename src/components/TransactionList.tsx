import React from 'react';
import { Trash2, Receipt, Download, Upload } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import TransactionItem from './TransactionItem';
import { exportData, importData } from '../utils/storage';
import { useAccessibility } from '../hooks/useAccessibility';
import './TransactionList.css';

const TransactionList = () => {
  const { 
    filteredTransactions, 
    clearAllTransactions, 
    transactions,
    importTransactions,
    showAlert
  } = useFinance();
  const { announce } = useAccessibility();

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las transacciones? Esta acción no se puede deshacer.')) {
      clearAllTransactions();
      announce('Todas las transacciones han sido eliminadas');
    }
  };

  const handleExport = async () => {
    try {
      const success = exportData(transactions);
      if (success) {
        showAlert('Datos exportados exitosamente', 'success');
      } else {
        showAlert('Error al exportar los datos', 'error');
      }
    } catch (error) {
      showAlert('Error al exportar los datos', 'error');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedData = await importData(file);
      if (window.confirm('¿Quieres reemplazar todas las transacciones existentes con los datos importados?')) {
        importTransactions(importedData);
      }
    } catch (error) {
      showAlert('Error al importar los datos: ' + error.message, 'error');
    }
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <section 
      className="transactions-section"
      aria-labelledby="transactions-title"
      aria-describedby="transactions-description"
    >
      <div className="transactions-header">
        <h2 id="transactions-title">Historial de Transacciones</h2>
        <p id="transactions-description" className="sr-only">
          Lista de todas las transacciones registradas. Total: {filteredTransactions.length} transacciones
        </p>
        <div className="header-actions">
          <button 
            onClick={handleExport}
            className="btn-action btn-export"
            title="Exportar datos"
            disabled={transactions.length === 0}
          >
            <Download size={16} />
            Exportar
          </button>
          
          <label className="btn-action btn-import" title="Importar datos">
            <Upload size={16} />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          
          <button 
            onClick={handleClearAll}
            className="btn-action btn-clear"
            disabled={transactions.length === 0}
            title="Limpiar todas las transacciones"
          >
            <Trash2 size={16} />
            Limpiar Todo
          </button>
        </div>
      </div>
      
      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="no-transactions" role="status" aria-live="polite">
            <Receipt size={64} aria-hidden="true" />
            <p>No hay transacciones registradas</p>
            <p>Agrega tu primera transacción usando el formulario de arriba</p>
          </div>
        ) : (
          <div 
            className="transactions-grid"
            role="list"
            aria-label="Lista de transacciones"
          >
            {filteredTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionList;



