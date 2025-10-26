/**
 * useSentiment Composable
 * Reactive sentiment data fetching for Vue components
 */

import type { SentimentResponse } from '~/types/api';
import type { SentimentDataPoint, TrendPeriod } from '~/types/sentiment';

export interface SentimentState {
  current: SentimentDataPoint | null;
  trend: TrendPeriod | null;
  summary: string | null;
  isStale: boolean;
  loading: boolean;
  error: Error | null;
  lastUpdated: string | null;
  rateLimitExceeded: boolean;
  retryAfter: number | null; // Seconds until retry allowed
}

export function useSentiment() {
  const state = useState<SentimentState>('sentiment', () => ({
    current: null,
    trend: null,
    summary: null,
    isStale: false,
    loading: false,
    error: null,
    lastUpdated: null,
    rateLimitExceeded: false,
    retryAfter: null,
  }));

  /**
   * Fetch current sentiment data
   * Enhanced with rate limit handling per FR-010a
   */
  async function fetchCurrent() {
    state.value.loading = true;
    state.value.error = null;
    state.value.rateLimitExceeded = false;

    try {
      const response = await $fetch<SentimentResponse>('/api/sentiment');
      
      state.value.current = response.current;
      state.value.isStale = response.isStale;
      state.value.lastUpdated = response.timestamp;
      state.value.loading = false;
    } catch (err: any) {
      state.value.loading = false;

      // Handle 429 Rate Limit response
      if (err.response?.status === 429 || err.statusCode === 429) {
        state.value.rateLimitExceeded = true;
        
        // Extract Retry-After header (in seconds)
        const retryAfterHeader = err.response?.headers?.get('Retry-After') || err.data?.retryAfter;
        state.value.retryAfter = retryAfterHeader ? parseInt(retryAfterHeader) : 60;
        
        state.value.error = new Error(`Snelheidsbeperking bereikt. Probeer het over ${state.value.retryAfter} seconden opnieuw.`);
        
        console.warn('[useSentiment] Rate limit exceeded (429). Retry after:', state.value.retryAfter);
      } else {
        state.value.error = err as Error;
        console.error('[useSentiment] Error fetching current data:', err);
      }
    }
  }

  /**
   * Fetch sentiment data with trend
   * Enhanced with rate limit handling per FR-010a
   */
  async function fetchWithTrend() {
    state.value.loading = true;
    state.value.error = null;
    state.value.rateLimitExceeded = false;

    try {
      const response = await $fetch<SentimentResponse>('/api/sentiment?include=trend');
      
      state.value.current = response.current;
      state.value.trend = response.trend || null;
      state.value.isStale = response.isStale;
      state.value.lastUpdated = response.timestamp;
      state.value.loading = false;
    } catch (err: any) {
      state.value.loading = false;

      // Handle 429 Rate Limit response
      if (err.response?.status === 429 || err.statusCode === 429) {
        state.value.rateLimitExceeded = true;
        
        const retryAfterHeader = err.response?.headers?.get('Retry-After') || err.data?.retryAfter;
        state.value.retryAfter = retryAfterHeader ? parseInt(retryAfterHeader) : 60;
        
        state.value.error = new Error(`Snelheidsbeperking bereikt. Probeer het over ${state.value.retryAfter} seconden opnieuw.`);
        
        console.warn('[useSentiment] Rate limit exceeded (429). Retry after:', state.value.retryAfter);
      } else {
        state.value.error = err as Error;
        console.error('[useSentiment] Error fetching trend data:', err);
      }
    }
  }

  /**
   * Fetch all sentiment data (current + trend + summary)
   * Enhanced with rate limit handling per FR-010a
   */
  async function fetchAll() {
    state.value.loading = true;
    state.value.error = null;
    state.value.rateLimitExceeded = false;

    try {
      const response = await $fetch<SentimentResponse>('/api/sentiment?include=all');
      
      state.value.current = response.current;
      state.value.trend = response.trend || null;
      state.value.summary = response.summary || null;
      state.value.isStale = response.isStale;
      state.value.lastUpdated = response.timestamp;
      state.value.loading = false;
    } catch (err: any) {
      state.value.loading = false;

      // Handle 429 Rate Limit response
      if (err.response?.status === 429 || err.statusCode === 429) {
        state.value.rateLimitExceeded = true;
        
        const retryAfterHeader = err.response?.headers?.get('Retry-After') || err.data?.retryAfter;
        state.value.retryAfter = retryAfterHeader ? parseInt(retryAfterHeader) : 60;
        
        state.value.error = new Error(`Snelheidsbeperking bereikt. Probeer het over ${state.value.retryAfter} seconden opnieuw.`);
        
        console.warn('[useSentiment] Rate limit exceeded (429). Retry after:', state.value.retryAfter);
      } else {
        state.value.error = err as Error;
        console.error('[useSentiment] Error fetching all data:', err);
      }
    }
  }

  /**
   * Refresh sentiment data
   */
  async function refresh() {
    await fetchCurrent();
  }

  /**
   * Check if data exists
   */
  const hasData = computed(() => state.value.current !== null);

  /**
   * Check if data is loading
   */
  const isLoading = computed(() => state.value.loading);

  /**
   * Check if there's an error
   */
  const hasError = computed(() => state.value.error !== null);

  /**
   * Get formatted age of data
   */
  const dataAge = computed(() => {
    if (!state.value.current) return null;

    const now = new Date();
    const dataDate = new Date(state.value.current.timestamp);
    const diffMs = now.getTime() - dataDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'Minder dan 1 uur geleden';
    }

    if (diffHours === 1) {
      return '1 uur geleden';
    }

    if (diffHours < 24) {
      return `${diffHours} uur geleden`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
  });

  return {
    // State
    state: readonly(state),
    hasData,
    isLoading,
    hasError,
    dataAge,

    // Actions
    fetchCurrent,
    fetchWithTrend,
    fetchAll,
    refresh,
  };
}
