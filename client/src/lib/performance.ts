// Performance optimization utilities
import { lazy } from 'react';

// Memory cache for static data
const memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const cacheManager = {
  set: (key: string, data: any, ttlSeconds: number = 300) => {
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  },

  get: (key: string) => {
    const cached = memoryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      memoryCache.delete(key);
      return null;
    }
    
    return cached.data;
  },

  clear: () => {
    memoryCache.clear();
  },

  size: () => memoryCache.size
};

// Debounce function for search and input operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Request Animation Frame optimization
export const rafThrottle = (fn: Function) => {
  let isRunning = false;
  return (...args: any[]) => {
    if (isRunning) return;
    isRunning = true;
    requestAnimationFrame(() => {
      fn(...args);
      isRunning = false;
    });
  };
};

// Image lazy loading utility
export const createImageLoader = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Preload critical resources
export const preloadResource = (href: string, as: string = 'script') => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Bundle size optimization - lazy load components
export const lazyLoadComponent = (importFunc: () => Promise<any>) => {
  return lazy(() => importFunc().catch(() => ({ default: () => null })));
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure.duration;
      } catch (e) {
        console.warn('Performance measurement failed:', e);
        return 0;
      }
    }
    return 0;
  },

  clearMarks: (name?: string) => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks(name);
    }
  }
};

// Memory cleanup utilities
export const memoryCleanup = {
  cleanupOldCacheEntries: () => {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        memoryCache.delete(key);
      }
    }
  },

  forceGarbageCollection: () => {
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }
};

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(memoryCleanup.cleanupOldCacheEntries, 5 * 60 * 1000);
}