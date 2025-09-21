import { useEffect, useCallback, useRef } from 'react';

interface AccessibilityOptions {
  announceChanges?: boolean;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    announceChanges = true,
    focusManagement = true,
    keyboardNavigation = true
  } = options;

  const announceRef = useRef<HTMLDivElement | null>(null);

  // Create live region for screen reader announcements
  useEffect(() => {
    if (announceChanges && !announceRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
      announceRef.current = liveRegion;
    }

    return () => {
      if (announceRef.current) {
        document.body.removeChild(announceRef.current);
        announceRef.current = null;
      }
    };
  }, [announceChanges]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear the message after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const focusElement = useCallback((selector: string | HTMLElement) => {
    if (!focusManagement) return;

    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;

    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusManagement]);

  const trapFocus = useCallback((container: HTMLElement) => {
    if (!focusManagement) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [focusManagement]);

  const setupKeyboardNavigation = useCallback(() => {
    if (!keyboardNavigation) return;

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '/':
          // Focus search input
          focusElement('[data-testid="search-input"]');
          e.preventDefault();
          break;
        case 'n':
        case 'N':
          // Focus new transaction form
          if (e.ctrlKey || e.metaKey) {
            focusElement('[data-testid="transaction-form"]');
            e.preventDefault();
          }
          break;
        case 'Escape':
          // Close modals or clear filters
          const clearButton = document.querySelector('[data-testid="clear-filters"]') as HTMLElement;
          if (clearButton) {
            clearButton.click();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, [keyboardNavigation, focusElement]);

  useEffect(() => {
    return setupKeyboardNavigation();
  }, [setupKeyboardNavigation]);

  return {
    announce,
    focusElement,
    trapFocus,
    setupKeyboardNavigation
  };
};
