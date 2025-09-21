import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { FinanceProvider } from './context/FinanceContext';
import FinanceDashboard from './components/FinanceDashboard';
import SkipLink from './components/SkipLink';
import './App.css';

const App = () => {
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Enter to focus on form submit
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        const submitBtn = document.querySelector('.btn-add');
        if (submitBtn) {
          submitBtn.click();
        }
      }
      
      // Escape to clear filters
      if (e.key === 'Escape') {
        const clearBtn = document.querySelector('.btn-clear');
        if (clearBtn) {
          clearBtn.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <FinanceProvider>
      <div className="app">
        <SkipLink />
          <FinanceDashboard />
        </div>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--white)',
              color: 'var(--text-primary)',
              border: '1px solid var(--light-blue)',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success-color)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger-color)',
                secondary: 'white',
              },
            },
          }}
        />
      </FinanceProvider>
    );
  };

export default App;



