/**
 * API request/response types based on OpenAPI contract
 */

import type {
  SentimentDataPoint,
  TrendPeriod,
  MoodSummary,
  DataSource,
} from "./sentiment";

export interface SentimentResponse {
  current: SentimentDataPoint;
  trend?: TrendPeriod;
  moodSummary?: MoodSummary;
  meta: {
    lastUpdated: string;
    dataAge: number; // seconds
    isStale: boolean;
    nextUpdate?: string;
  };
}

export interface HistoryResponse {
  dataPoints: SentimentDataPoint[];
  count: number;
  period: {
    from: string;
    to: string;
  };
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  sources?: Array<{
    id: string;
    name: string;
    status: "operational" | "degraded" | "failed";
    lastSuccess: string | null;
    lastError: string | null;
  }>;
  dataAge?: number;
  isStale?: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  retryAfter?: number;
}

export type SentimentQueryInclude = "trend" | "summary" | "all";
