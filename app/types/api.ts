/**
 * API request/response types for sentiment endpoints
 * Based on contracts/sentiment-api.yaml OpenAPI specification
 */

import type { SentimentDataPoint, TrendPeriod, DataSource, SourceContribution } from './sentiment';

/**
 * Query parameters for GET /api/sentiment
 */
export interface SentimentQueryParams {
  include?: 'trend' | 'summary' | 'all'; // Optional data inclusions
}

/**
 * Source reliability metrics (T025)
 */
export interface SourceMetrics {
  successRate: number; // Percentage 0-100 (7-day window)
  avgResponseTimeMs: number; // Average response time in ms
  consecutiveFailures: number; // Current failure streak
  lastSuccessAt?: string; // ISO 8601 timestamp
  lastFailureAt?: string; // ISO 8601 timestamp
  isHealthy: boolean; // true if success rate >= 90%
  isInactive: boolean; // true if consecutive failures >= 72
  inactiveMarkedAt?: string; // ISO 8601 timestamp
}

/**
 * Source contribution response with metrics (T024)
 */
export interface SourceContributionResponse {
  timestamp: string; // ISO 8601 timestamp of sentiment data point
  totalArticles: number; // Total articles analyzed (after deduplication)
  totalSourcesAttempted: number; // Number of sources attempted in collection
  activeSourcesCount: number; // Number of sources that returned data
  failedSourcesCount: number; // Number of sources that failed
  sources: Array<SourceContribution & {
    category: string; // 'general' | 'healthcare-specific'
    articlePercentage: number; // Percentage of total articles (0-100)
    reliability: SourceMetrics; // Aggregated metrics per source
  }>;
}

/**
 * Response for GET /api/sentiment
 */
export interface SentimentResponse {
  // Current sentiment data (always included)
  current: SentimentDataPoint | null;

  // Optional: 7-day trend data
  trend?: TrendPeriod;

  // Optional: Human-readable summary
  summary?: string;

  // Metadata
  timestamp: string; // ISO 8601 when response was generated
  isStale: boolean; // true if data is >24 hours old
}

/**
 * Query parameters for GET /api/sentiment/history
 */
export interface HistoryQueryParams {
  startDate?: string; // ISO 8601 date
  endDate?: string; // ISO 8601 date
  limit?: number; // Max results to return
}

/**
 * Response for GET /api/sentiment/history
 */
export interface HistoryResponse {
  dataPoints: SentimentDataPoint[];
  total: number; // Total count matching filters
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
}

/**
 * Response for GET /api/health
 */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string; // ISO 8601
  sources: Array<{
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'error';
    lastFetchSuccess: string | null;
    lastFetchError: string | null;
  }>;
  dataAge: number; // Seconds since last data point
  isStale: boolean; // true if >24 hours
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: {
    code: string; // e.g., "RATE_LIMIT_EXCEEDED", "NOT_FOUND"
    message: string; // Human-readable error message
    details?: Record<string, any>; // Additional error context
  };
  timestamp: string; // ISO 8601
}

/**
 * Rate limit headers
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string; // "20"
  'X-RateLimit-Remaining': string; // "15"
  'X-RateLimit-Reset': string; // Unix timestamp
}
