import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { cacheManager, performanceMonitor } from '@/lib/performance';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  endpoint: string;
  cacheTime?: number;
  enablePrefetch?: boolean;
}

export function useOptimizedQuery<T>({
  queryKey,
  endpoint,
  cacheTime = 5 * 60 * 1000, // 5 minutes default
  enablePrefetch = false,
  ...options
}: OptimizedQueryOptions<T>) {
  const cacheKey = queryKey.join(':');

  const queryFn = async (): Promise<T> => {
    const perfTracker = performanceMonitor.mark(`query-${cacheKey}`);
    
    try {
      // Check memory cache first
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        performanceMonitor.measure(`query-${cacheKey}-cache-hit`, `query-${cacheKey}`);
        return cached;
      }

      // Fetch from API
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      cacheManager.set(cacheKey, data, cacheTime);
      
      const duration = performanceMonitor.measure(`query-${cacheKey}-fetch`, `query-${cacheKey}`);
      console.debug(`Query ${cacheKey} completed in ${duration}ms`);
      
      return data;
    } catch (error) {
      performanceMonitor.measure(`query-${cacheKey}-error`, `query-${cacheKey}`);
      throw error;
    }
  };

  const query = useQuery({
    queryKey,
    queryFn,
    staleTime: cacheTime,
    gcTime: cacheTime * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options
  });

  // Prefetch related data if enabled
  if (enablePrefetch && query.isSuccess && !query.isFetching) {
    // This could be extended to prefetch related queries
  }

  return {
    ...query,
    cacheStats: cacheManager.size(),
    cacheKey
  };
}