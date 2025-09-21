import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Alert } from '../types';
import './AnimatedAlert.css';

interface AnimatedAlertProps {
  alert: Alert;
  onClose: () => void;
}

const AnimatedAlert: React.FC<AnimatedAlertProps> = React.memo(({ alert, onClose }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <AlertCircle size={24} />;
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'info':
        return <Info size={24} />;
      default:
        return <Info size={24} />;
    }
  };

  const getProgressColor = () => {
    switch (alert.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#2563eb';
      default:
        return '#2563eb';
    }
  };

  return (
    <AnimatePresence>
      {alert.show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className={`animated-alert ${alert.type}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <motion.div
            className="alert-content"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <motion.div
              className="alert-icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              {getIcon()}
            </motion.div>
            
            <motion.div
              className="alert-message"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <p>{alert.message}</p>
            </motion.div>
            
            <motion.button
              className="alert-close"
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              aria-label="Cerrar notificación"
            >
              <X size={18} />
            </motion.button>
          </motion.div>
          
          <motion.div
            className="alert-progress"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3, ease: "linear" }}
            style={{
              backgroundColor: getProgressColor()
            }}
          />
          
          {/* Ripple effect */}
          <motion.div
            className="alert-ripple"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              backgroundColor: getProgressColor()
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

AnimatedAlert.displayName = 'AnimatedAlert';

export default AnimatedAlert;
