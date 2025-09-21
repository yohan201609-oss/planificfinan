import {
  sanitizeInput,
  sanitizeForDatabase,
  validateSecureInput,
  validateSecureTransaction,
  sanitizeTransaction,
  checkRateLimit,
  secureStorage,
  runSecurityAudit
} from '../security';
import { Transaction } from '../../types';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>hello')).toBe('hello');
      expect(sanitizeInput('<div>test</div>')).toBe('test');
      expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
    });

    it('should escape special characters', () => {
      expect(sanitizeInput('test & "quotes"')).toBe('test &amp; &quot;quotes&quot;');
      expect(sanitizeInput('test < > symbols')).toBe('test &lt; &gt; symbols');
    });

    it('should remove dangerous attributes', () => {
      expect(sanitizeInput('<div onclick="alert(1)">test</div>')).toBe('test');
      expect(sanitizeInput('<a href="javascript:alert(1)">link</a>')).toBe('link');
    });

    it('should handle empty or invalid input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });
  });

  describe('sanitizeForDatabase', () => {
    it('should remove SQL injection patterns', () => {
      expect(sanitizeForDatabase("'; DROP TABLE users; --")).toBe(' DROP TABLE users; ');
      expect(sanitizeForDatabase("SELECT * FROM users")).toBe('* FROM users');
      expect(sanitizeForDatabase("admin' OR '1'='1")).toBe('admin OR 11');
    });

    it('should remove quotes and semicolons', () => {
      expect(sanitizeForDatabase('test"; DROP TABLE;')).toBe('test DROP TABLE');
      expect(sanitizeForDatabase("test' OR 1=1")).toBe('test OR 11');
    });
  });

  describe('validateSecureInput', () => {
    it('should validate required fields', () => {
      const result = validateSecureInput('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors.input).toBe('Este campo es requerido');
    });

    it('should validate minimum length', () => {
      const result = validateSecureInput('ab', { minLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.errors.input).toBe('Mínimo 3 caracteres requeridos');
    });

    it('should validate maximum length', () => {
      const result = validateSecureInput('very long string', { maxLength: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors.input).toBe('Máximo 5 caracteres permitidos');
    });

    it('should validate number type', () => {
      const result = validateSecureInput('not a number', { type: 'number' });
      expect(result.isValid).toBe(false);
      expect(result.errors.input).toBe('Debe ser un número válido');
    });

    it('should validate date type', () => {
      const result = validateSecureInput('invalid date', { type: 'date' });
      expect(result.isValid).toBe(false);
      expect(result.errors.input).toBe('Debe ser una fecha válida');
    });

    it('should validate email type', () => {
      const result = validateSecureInput('invalid-email', { type: 'email' });
      expect(result.isValid).toBe(false);
      expect(result.errors.input).toBe('Debe ser un email válido');
    });

    it('should validate pattern', () => {
      const result = validateSecureInput('abc123', { pattern: /^[a-z]+$/ });
      expect(result.isValid).toBe(false);
      expect(result.errors.input).toBe('Formato inválido');
    });

    it('should return sanitized value', () => {
      const result = validateSecureInput('<script>alert("xss")</script>test', { maxLength: 10 });
      expect(result.sanitizedValue).toBe('test');
    });
  });

  describe('validateSecureTransaction', () => {
    const validTransaction: Partial<Transaction> = {
      description: 'Test transaction',
      amount: 100,
      category: 'food',
      type: 'expense',
      date: '2024-01-01'
    };

    it('should validate valid transaction', () => {
      const result = validateSecureTransaction(validTransaction);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject transaction with XSS in description', () => {
      const transaction = { ...validTransaction, description: '<script>alert("xss")</script>test' };
      const result = validateSecureTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toContain('Descripción inválida');
    });

    it('should reject transaction with invalid amount', () => {
      const transaction = { ...validTransaction, amount: -50 };
      const result = validateSecureTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('La cantidad debe ser mayor a 0');
    });

    it('should reject transaction with amount exceeding limit', () => {
      const transaction = { ...validTransaction, amount: 2000000 };
      const result = validateSecureTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('La cantidad excede el límite máximo');
    });

    it('should reject transaction with invalid type', () => {
      const transaction = { ...validTransaction, type: 'invalid' as any };
      const result = validateSecureTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBe('Tipo de transacción inválido');
    });

    it('should reject transaction with future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const transaction = { ...validTransaction, date: futureDate.toISOString().split('T')[0] };
      const result = validateSecureTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.date).toBe('La fecha debe estar dentro del último año');
    });

    it('should reject transaction with old date', () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2);
      const transaction = { ...validTransaction, date: oldDate.toISOString().split('T')[0] };
      const result = validateSecureTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors.date).toBe('La fecha debe estar dentro del último año');
    });
  });

  describe('sanitizeTransaction', () => {
    it('should sanitize all string fields', () => {
      const transaction: Partial<Transaction> = {
        description: '<script>alert("xss")</script>test',
        category: 'food',
        date: '2024-01-01',
        amount: 100,
        type: 'expense'
      };

      const result = sanitizeTransaction(transaction);
      expect(result.description).toBe('test');
      expect(result.category).toBe('food');
      expect(result.date).toBe('2024-01-01');
      expect(result.amount).toBe(100);
      expect(result.type).toBe('expense');
    });

    it('should handle invalid type', () => {
      const transaction: Partial<Transaction> = {
        description: 'test',
        category: 'food',
        date: '2024-01-01',
        amount: 100,
        type: 'invalid' as any
      };

      const result = sanitizeTransaction(transaction);
      expect(result.type).toBe('expense'); // Default fallback
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should allow requests within rate limit', () => {
      expect(checkRateLimit('test_action', 'user1')).toBe(true);
      expect(checkRateLimit('test_action', 'user1')).toBe(true);
    });

    it('should block requests exceeding rate limit', () => {
      // Make 10 requests (the limit)
      for (let i = 0; i < 10; i++) {
        expect(checkRateLimit('test_action', 'user1')).toBe(true);
      }

      // 11th request should be blocked
      expect(checkRateLimit('test_action', 'user1')).toBe(false);
    });

    it('should allow requests for different actions', () => {
      // Exceed limit for one action
      for (let i = 0; i < 11; i++) {
        checkRateLimit('action1', 'user1');
      }

      // Different action should still work
      expect(checkRateLimit('action2', 'user1')).toBe(true);
    });

    it('should allow requests for different users', () => {
      // Exceed limit for one user
      for (let i = 0; i < 11; i++) {
        checkRateLimit('test_action', 'user1');
      }

      // Different user should still work
      expect(checkRateLimit('test_action', 'user2')).toBe(true);
    });
  });

  describe('secureStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should store and retrieve data securely', () => {
      const testData = { sensitive: 'data', number: 123 };
      
      secureStorage.setItem('test', testData);
      const retrieved = secureStorage.getItem('test');
      
      expect(retrieved).toEqual(testData);
    });

    it('should handle null data', () => {
      secureStorage.setItem('test', null);
      const retrieved = secureStorage.getItem('test');
      
      expect(retrieved).toBe(null);
    });

    it('should handle non-existent keys', () => {
      const retrieved = secureStorage.getItem('nonexistent');
      expect(retrieved).toBe(null);
    });

    it('should remove data', () => {
      secureStorage.setItem('test', { data: 'test' });
      secureStorage.removeItem('test');
      
      const retrieved = secureStorage.getItem('test');
      expect(retrieved).toBe(null);
    });

    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => secureStorage.setItem('test', { data: 'test' })).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('runSecurityAudit', () => {
    it('should return security score and issues', () => {
      const result = runSecurityAudit();
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should detect external scripts', () => {
      // Mock document with external script
      const mockScript = document.createElement('script');
      mockScript.src = 'https://external.com/script.js';
      document.head.appendChild(mockScript);

      const result = runSecurityAudit();
      expect(result.issues).toContain('External scripts detected');
      expect(result.score).toBeLessThan(100);

      document.head.removeChild(mockScript);
    });

    it('should detect HTTPS usage', () => {
      const originalProtocol = location.protocol;
      Object.defineProperty(location, 'protocol', {
        value: 'http:',
        configurable: true
      });

      const result = runSecurityAudit();
      expect(result.issues).toContain('Not using HTTPS');
      expect(result.score).toBeLessThan(100);

      Object.defineProperty(location, 'protocol', {
        value: originalProtocol,
        configurable: true
      });
    });
  });
});
