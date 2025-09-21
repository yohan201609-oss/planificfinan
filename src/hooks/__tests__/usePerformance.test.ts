import { renderHook, act } from '@testing-library/react';
import {
  usePerformance,
  useDebouncedCallback,
  useThrottledCallback,
  useExpensiveCalculation,
  useVirtualScrolling,
  useIntersectionObserver,
  useMemoryMonitor
} from '../usePerformance';

describe('usePerformance', () => {
  it('should track render count and performance metrics', () => {
    const { result, rerender } = renderHook(() => usePerformance());

    // Initial render
    expect(result.current.getPerformanceMetrics().renderCount).toBe(1);

    // Re-render
    rerender();
    expect(result.current.getPerformanceMetrics().renderCount).toBe(2);

    // Another re-render
    rerender();
    expect(result.current.getPerformanceMetrics().renderCount).toBe(3);
  });

  it('should calculate performance metrics correctly', () => {
    const { result } = renderHook(() => usePerformance());

    const metrics = result.current.getPerformanceMetrics();

    expect(metrics).toHaveProperty('renderCount');
    expect(metrics).toHaveProperty('totalTime');
    expect(metrics).toHaveProperty('avgRenderTime');
    expect(metrics).toHaveProperty('performance');

    expect(typeof metrics.renderCount).toBe('number');
    expect(typeof metrics.totalTime).toBe('number');
    expect(typeof metrics.avgRenderTime).toBe('number');
    expect(['excellent', 'good', 'needs-optimization']).toContain(metrics.performance);
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 100));

    // Call multiple times rapidly
    act(() => {
      result.current('call1');
      result.current('call2');
      result.current('call3');
    });

    // Function should not be called yet
    expect(mockFn).not.toHaveBeenCalled();

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Function should be called once with the last arguments
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call3');
  });

  it('should reset debounce timer on new calls', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 100));

    // First call
    act(() => {
      result.current('call1');
    });

    // Wait 50ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Second call should reset timer
    act(() => {
      result.current('call2');
    });

    // Wait another 50ms (total 100ms from second call)
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Function should be called once with second arguments
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call2');
  });
});

describe('useThrottledCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should throttle function calls', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(mockFn, 100));

    // Call multiple times rapidly
    act(() => {
      result.current('call1');
      result.current('call2');
      result.current('call3');
    });

    // Only first call should be executed immediately
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call1');

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Call again after throttle period
    act(() => {
      result.current('call4');
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('call4');
  });

  it('should not call function if called within throttle period', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useThrottledCallback(mockFn, 100));

    // First call
    act(() => {
      result.current('call1');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    // Try to call again before throttle period
    act(() => {
      jest.advanceTimersByTime(50);
      result.current('call2');
    });

    // Should still be only 1 call
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('useExpensiveCalculation', () => {
  it('should memoize expensive calculations', () => {
    const mockCalculation = jest.fn(() => {
      // Simulate expensive calculation
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += i;
      }
      return result;
    });

    const { result, rerender } = renderHook(
      ({ deps }) => useExpensiveCalculation(mockCalculation, deps),
      { initialProps: { deps: [1] } }
    );

    // First call
    expect(mockCalculation).toHaveBeenCalledTimes(1);
    expect(typeof result.current).toBe('number');

    // Re-render with same deps
    rerender({ deps: [1] });
    expect(mockCalculation).toHaveBeenCalledTimes(1); // Should not recalculate

    // Re-render with different deps
    rerender({ deps: [2] });
    expect(mockCalculation).toHaveBeenCalledTimes(2); // Should recalculate
  });

  it('should log performance in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const mockCalculation = jest.fn(() => 42);

    renderHook(() => useExpensiveCalculation(mockCalculation, [1]));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Calculation took \d+\.?\d* milliseconds/)
    );

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});

describe('useVirtualScrolling', () => {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `Item ${i}` }));
  const itemHeight = 50;
  const containerHeight = 400;

  it('should calculate visible items correctly', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(items, itemHeight, containerHeight)
    );

    expect(result.current.visibleItemCount).toBe(8); // 400 / 50
    expect(result.current.totalHeight).toBe(50000); // 1000 * 50
  });

  it('should return correct visible items for given scroll position', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(items, itemHeight, containerHeight)
    );

    const scrollTop = 1000; // 20 items scrolled
    const visibleItems = result.current.getVisibleItems(scrollTop);

    expect(visibleItems.startIndex).toBe(20);
    expect(visibleItems.endIndex).toBe(29); // 20 + 8 + 1
    expect(visibleItems.visibleItems).toHaveLength(9);
    expect(visibleItems.offsetY).toBe(1000); // 20 * 50
  });

  it('should handle scroll position beyond items', () => {
    const { result } = renderHook(() =>
      useVirtualScrolling(items, itemHeight, containerHeight)
    );

    const scrollTop = 60000; // Beyond all items
    const visibleItems = result.current.getVisibleItems(scrollTop);

    expect(visibleItems.endIndex).toBe(1000);
    expect(visibleItems.visibleItems.length).toBeLessThanOrEqual(9);
  });
});

describe('useIntersectionObserver', () => {
  let mockIntersectionObserver: jest.Mock;

  beforeEach(() => {
    mockIntersectionObserver = jest.fn();
    window.IntersectionObserver = mockIntersectionObserver as any;
  });

  afterEach(() => {
    delete (window as any).IntersectionObserver;
  });

  it('should create intersection observer', () => {
    const mockCallback = jest.fn();
    const mockOptions = { threshold: 0.5 };

    renderHook(() => useIntersectionObserver(mockCallback, mockOptions));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.5,
        rootMargin: '50px'
      })
    );
  });

  it('should observe target element', () => {
    const mockCallback = jest.fn();
    const mockObserve = jest.fn();
    const mockUnobserve = jest.fn();

    mockIntersectionObserver.mockImplementation((callback) => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: jest.fn()
    }));

    const { result } = renderHook(() => useIntersectionObserver(mockCallback));

    expect(mockObserve).toHaveBeenCalledWith(result.current.current);
  });

  it('should unobserve on cleanup', () => {
    const mockCallback = jest.fn();
    const mockObserve = jest.fn();
    const mockUnobserve = jest.fn();

    mockIntersectionObserver.mockImplementation((callback) => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: jest.fn()
    }));

    const { result, unmount } = renderHook(() => useIntersectionObserver(mockCallback));

    unmount();

    expect(mockUnobserve).toHaveBeenCalledWith(result.current.current);
  });
});

describe('useMemoryMonitor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return null when memory API is not available', () => {
    const { result } = renderHook(() => useMemoryMonitor());

    expect(result.current).toBe(null);
  });

  it('should monitor memory usage when API is available', () => {
    const mockMemory = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    };

    (performance as any).memory = mockMemory;

    const { result } = renderHook(() => useMemoryMonitor());

    expect(result.current).toEqual(mockMemory);
  });

  it('should update memory info periodically', () => {
    const mockMemory1 = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    };

    const mockMemory2 = {
      usedJSHeapSize: 1500000,
      totalJSHeapSize: 2500000,
      jsHeapSizeLimit: 4000000
    };

    (performance as any).memory = mockMemory1;

    const { result } = renderHook(() => useMemoryMonitor());

    expect(result.current).toEqual(mockMemory1);

    // Update memory info
    (performance as any).memory = mockMemory2;

    // Fast forward time to trigger next check
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current).toEqual(mockMemory2);
  });
});
