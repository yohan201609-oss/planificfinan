import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Performance monitoring hook
export const usePerformance = () => {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
  });
  
  const getPerformanceMetrics = useCallback(() => {
    const renderCount = renderCountRef.current;
    const totalTime = Date.now() - startTimeRef.current;
    const avgRenderTime = renderCount > 0 ? totalTime / renderCount : 0;
    
    return {
      renderCount,
      totalTime,
      avgRenderTime,
      performance: avgRenderTime < 16 ? 'excellent' : avgRenderTime < 33 ? 'good' : 'needs-optimization'
    };
  }, []);
  
  return { getPerformanceMetrics };
};

// Debounced callback hook
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

// Memoized expensive calculations
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(() => {
    const start = performance.now();
    const result = calculation();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Calculation took ${end - start} milliseconds`);
    }
    
    return result;
  }, deps);
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  return useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    
    return {
      visibleItemCount,
      totalHeight,
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleItemCount + 1, items.length);
        
        return {
          startIndex,
          endIndex,
          visibleItems: items.slice(startIndex, endIndex),
          offsetY: startIndex * itemHeight
        };
      }
    };
  }, [items, itemHeight, containerHeight]);
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );
    
    observer.observe(target);
    
    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);
  
  return targetRef;
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);
  
  const checkMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      });
    }
  }, []);
  
  useEffect(() => {
    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [checkMemory]);
  
  return memoryInfo;
};