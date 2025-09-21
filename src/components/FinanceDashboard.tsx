import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Cloud, Download } from 'lucide-react';
import Header from './Header';
import BalanceCard from './BalanceCard';
import AnimatedForm from './AnimatedForm';
import TransactionFilters from './TransactionFilters';
import TransactionList from './TransactionList';
import AnimatedAlert from './AnimatedAlert';
import PWAStatus from './PWAStatus';
import CloudSyncPanel from './CloudSyncPanel';
import CloudConfigModal from './CloudConfigModal';
import FinancialDashboard from './FinancialDashboard';
import AdvancedCharts from './AdvancedCharts';
import FinancialInsights from './FinancialInsights';
import BudgetManager from './BudgetManager';
import SettingsPanel from './SettingsPanel';
import CustomizableDashboard from './CustomizableDashboard';
import { useFinance } from '../context/FinanceContext';
import './FinanceDashboard.css';

interface CloudConfig {
  apiEndpoint: string;
  apiKey: string;
  userId: string;
  autoSyncInterval: number;
}

const FinanceDashboard: React.FC = React.memo(() => {
  const { alert, hideAlert } = useFinance();
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [useCustomizableDashboard, setUseCustomizableDashboard] = useState(false);

  // Load cloud configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('planificfinan-cloud-config');
    if (savedConfig) {
      try {
        setCloudConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading cloud config:', error);
      }
    }
  }, []);

  const handleCloudConfigSave = (config: CloudConfig) => {
    setCloudConfig(config);
    localStorage.setItem('planificfinan-cloud-config', JSON.stringify(config));
  };

  const handleTransactionsUpdate = (transactions: any[]) => {
    // This would be called when cloud sync updates transactions
    // The FinanceContext would handle the actual update
    console.log('Transactions updated from cloud:', transactions);
  };

  return (
    <motion.div 
      className="finance-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SkipLink />
      
      <div className="dashboard-header">
        <Header />
        
        <div className="header-actions">
          <motion.button
            className="action-btn dashboard-toggle"
            onClick={() => setUseCustomizableDashboard(!useCustomizableDashboard)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={useCustomizableDashboard ? "Vista clásica" : "Dashboard personalizable"}
          >
            <Settings size={20} />
            <span>{useCustomizableDashboard ? "Clásica" : "Personalizable"}</span>
          </motion.button>

          <motion.button
            className="action-btn cloud-btn"
            onClick={() => setShowCloudConfig(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Configurar sincronización en la nube"
          >
            <Cloud size={20} />
            <span>Nube</span>
          </motion.button>
          
          <motion.button
            className="action-btn settings-btn"
            onClick={() => setShowSettings(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Configuración"
          >
            <Settings size={20} />
            <span>Config</span>
          </motion.button>
        </div>
      </div>

      <main id="main-content" role="main">
        {useCustomizableDashboard ? (
          <CustomizableDashboard />
        ) : (
          <>
            <div className="dashboard-header">
              <h1>Dashboard Financiero</h1>
              <motion.button
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings size={20} />
                Configuración
              </motion.button>
            </div>

            <motion.div
              className="dashboard-content"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <BalanceCard />
              
              <FinancialDashboard />
              
              <AdvancedCharts />
              
              <FinancialInsights />
              
              <BudgetManager />
              
              <AnimatedForm />
              
              <TransactionFilters />
              
              {cloudConfig && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <CloudSyncPanel 
                    config={cloudConfig}
                    onTransactionsUpdate={handleTransactionsUpdate}
                  />
                </motion.div>
              )}
              
              <TransactionList />
            </motion.div>
          </>
        )}
      </main>

      <AnimatedAlert 
        alert={alert} 
        onClose={hideAlert} 
      />
      
      <PWAStatus />
      
      <CloudConfigModal
        isOpen={showCloudConfig}
        onClose={() => setShowCloudConfig(false)}
        onSave={handleCloudConfigSave}
        initialConfig={cloudConfig || undefined}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.div>
  );
});

FinanceDashboard.displayName = 'FinanceDashboard';

export default FinanceDashboard;
