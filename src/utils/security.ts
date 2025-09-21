// Security utilities for input sanitization and validation
import { Transaction, ValidationResult } from '../types';

// XSS Protection - Remove potentially dangerous HTML/JS
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove HTML tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    // Remove potentially dangerous attributes
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    // Escape special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim();
};

// SQL Injection Protection (for future database integration)
export const sanitizeForDatabase = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove SQL injection patterns
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
    // Remove quotes and semicolons
    .replace(/['";\\]/g, '')
    // Sanitize for XSS as well
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};

// Input validation with security checks
export const validateSecureInput = (input: string, options: {
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'email';
}): ValidationResult => {
  const errors: Record<string, string> = {};
  const sanitized = sanitizeInput(input);
  
  // Required validation
  if (options.required && !sanitized) {
    errors.input = 'Este campo es requerido';
    return { isValid: false, errors };
  }
  
  // Length validation
  if (options.minLength && sanitized.length < options.minLength) {
    errors.input = `Mínimo ${options.minLength} caracteres requeridos`;
  }
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    errors.input = `Máximo ${options.maxLength} caracteres permitidos`;
  }
  
  // Pattern validation
  if (options.pattern && sanitized && !options.pattern.test(sanitized)) {
    errors.input = 'Formato inválido';
  }
  
  // Type-specific validation
  if (options.type && sanitized) {
    switch (options.type) {
      case 'number':
        if (isNaN(Number(sanitized)) || !isFinite(Number(sanitized))) {
          errors.input = 'Debe ser un número válido';
        }
        break;
      case 'date':
        const date = new Date(sanitized);
        if (isNaN(date.getTime())) {
          errors.input = 'Debe ser una fecha válida';
        }
        break;
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(sanitized)) {
          errors.input = 'Debe ser un email válido';
        }
        break;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedValue: sanitized
  };
};

// Enhanced transaction validation with security
export const validateSecureTransaction = (transactionData: Partial<Transaction>): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate description with security checks
  const descriptionValidation = validateSecureInput(transactionData.description || '', {
    required: true,
    maxLength: 100,
    minLength: 1,
    type: 'text'
  });
  
  if (!descriptionValidation.isValid) {
    errors.description = Object.values(descriptionValidation.errors)[0] || 'Descripción inválida';
  }
  
  // Validate amount with security checks
  const amountValidation = validateSecureInput(transactionData.amount?.toString() || '', {
    required: true,
    type: 'number'
  });
  
  if (!amountValidation.isValid) {
    errors.amount = 'Cantidad inválida';
  } else {
    const amount = Number(amountValidation.sanitizedValue);
    if (amount <= 0) {
      errors.amount = 'La cantidad debe ser mayor a 0';
    }
    if (amount > 1000000) { // Reasonable upper limit
      errors.amount = 'La cantidad excede el límite máximo';
    }
  }
  
  // Validate category with security checks
  const categoryValidation = validateSecureInput(transactionData.category || '', {
    required: true,
    maxLength: 50,
    type: 'text'
  });
  
  if (!categoryValidation.isValid) {
    errors.category = 'Categoría inválida';
  }
  
  // Validate type
  if (!transactionData.type || !['income', 'expense'].includes(transactionData.type)) {
    errors.type = 'Tipo de transacción inválido';
  }
  
  // Validate date with security checks
  const dateValidation = validateSecureInput(transactionData.date || '', {
    required: true,
    type: 'date'
  });
  
  if (!dateValidation.isValid) {
    errors.date = 'Fecha inválida';
  } else {
    const transactionDate = new Date(dateValidation.sanitizedValue);
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    if (transactionDate < oneYearAgo || transactionDate > today) {
      errors.date = 'La fecha debe estar dentro del último año';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize transaction data
export const sanitizeTransaction = (transaction: Partial<Transaction>): Partial<Transaction> => {
  return {
    ...transaction,
    description: transaction.description ? sanitizeInput(transaction.description) : '',
    category: transaction.category ? sanitizeInput(transaction.category) : '',
    date: transaction.date ? sanitizeInput(transaction.date) : '',
    amount: transaction.amount ? Number(sanitizeInput(transaction.amount.toString())) : 0,
    type: transaction.type && ['income', 'expense'].includes(transaction.type) ? transaction.type : 'expense'
  };
};

// Rate limiting simulation (for future API integration)
export const checkRateLimit = (action: string, userId: string): boolean => {
  const key = `rate_limit_${action}_${userId}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // Max requests per minute
  
  try {
    const stored = localStorage.getItem(key);
    const requests = stored ? JSON.parse(stored) : [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter((time: number) => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    validRequests.push(now);
    localStorage.setItem(key, JSON.stringify(validRequests));
    
    return true; // Request allowed
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error to prevent blocking
  }
};

// Content Security Policy helpers
export const getCSPDirectives = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for React dev tools
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

// Secure storage helpers
export const secureStorage = {
  // Encrypt sensitive data before storing
  setItem: (key: string, value: any): void => {
    try {
      const serialized = JSON.stringify(value);
      // Basic encoding (in production, use proper encryption)
      const encoded = btoa(serialized);
      localStorage.setItem(`secure_${key}`, encoded);
    } catch (error) {
      console.error('Failed to store secure data:', error);
    }
  },
  
  // Decrypt sensitive data after retrieving
  getItem: (key: string): any => {
    try {
      const encoded = localStorage.getItem(`secure_${key}`);
      if (!encoded) return null;
      
      const serialized = atob(encoded);
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  },
  
  // Remove secure data
  removeItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  }
};

// Security audit helper
export const runSecurityAudit = (): { score: number; issues: string[] } => {
  const issues: string[] = [];
  let score = 100;
  
  // Check for XSS vulnerabilities
  const scripts = document.querySelectorAll('script');
  if (scripts.length > 0) {
    issues.push('External scripts detected');
    score -= 20;
  }
  
  // Check for unsafe inline styles
  const inlineStyles = document.querySelectorAll('[style]');
  if (inlineStyles.length > 10) {
    issues.push('Multiple inline styles detected');
    score -= 10;
  }
  
  // Check for external resources
  const externalResources = document.querySelectorAll('img[src^="http"], link[href^="http"]');
  if (externalResources.length > 0) {
    issues.push('External resources detected');
    score -= 15;
  }
  
  // Check for HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    issues.push('Not using HTTPS');
    score -= 25;
  }
  
  return { score: Math.max(0, score), issues };
};
