/**
 * GET /api/sentiment/sources
 * Returns source contribution metrics for each data source
 * Per OpenAPI contract: sources-api.yaml
 * 
 * Implements T026-T031:
 * - T026: Creates endpoint implementing GET /api/sentiment/sources
 * - T027: Implements readLatestSources to extract sourceContributions
 * - T028: Implements calculateSourceMetrics for 7-day aggregation
 * - T029: Adds caching headers (5-minute cache)
 * - T030: Adds error handling for missing data (returns empty array)
 * - T031: Updates CORS middleware if needed
 */

import type { SourceContributionResponse } from '~/types/api';
import type { SentimentDataPoint, SourceContribution } from '~/types/sentiment';
import { getCurrentDataPoint, getDataPointsInRange } from '../../utils/storage';
import { StandardErrors } from '../../utils/errorResponse';

interface SourceMetricsData {
  successCount: number;
  totalAttempts: number;
  avgResponseTimeMs: number;
  consecutiveFailures: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  inactiveMarkedAt?: string;
}

export default defineEventHandler(async (event): Promise<SourceContributionResponse> => {
  const requestId = event.context.requestId || Math.random().toString(36).substring(7);

  // Structured logging with request context
  const logger = {
    info: (message: string, meta?: Record<string, any>) => {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        requestId,
        endpoint: '/api/sentiment/sources',
        message,
        ...meta,
      }));
    },
    error: (message: string, error?: any, meta?: Record<string, any>) => {
      console.error(JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        requestId,
        endpoint: '/api/sentiment/sources',
        message,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        ...meta,
      }));
    },
  };

  logger.info('Source contribution data requested');

  try {
    // T027: Read latest sentiment data point and extract sourceContributions
    const latestDataPoint = await readLatestSources();

    if (!latestDataPoint) {
      logger.info('No sentiment data available, returning empty sources');
      // T030: Return empty array with 200 status for graceful degradation
      return {
        timestamp: new Date().toISOString(),
        totalArticles: 0,
        totalSourcesAttempted: 0,
        activeSourcesCount: 0,
        failedSourcesCount: 0,
        sources: [],
      };
    }

    // T028: Calculate aggregated metrics for last 7 days
    const sourcesWithMetrics = await calculateSourceMetrics(latestDataPoint);

    // Build response
    const response: SourceContributionResponse = {
      timestamp: latestDataPoint.timestamp,
      totalArticles: latestDataPoint.articlesAnalyzed || 0,
      totalSourcesAttempted: latestDataPoint.sourceDiversity?.totalSources || 0,
      activeSourcesCount: latestDataPoint.sourceDiversity?.activeSources || 0,
      failedSourcesCount: latestDataPoint.sourceDiversity?.failedSources || 0,
      sources: sourcesWithMetrics,
    };

    logger.info('Source metrics calculated', {
      totalSources: response.sources.length,
      totalArticles: response.totalArticles,
      activeSourcesCount: response.activeSourcesCount,
    });

    // T029: Set cache headers (5-minute cache per research.md)
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    });

    logger.info('Response sent successfully');
    return response;
  } catch (error) {
    logger.error('Failed to fetch source contribution data', error);
    // T030: Return empty response on error for graceful degradation
    return {
      timestamp: new Date().toISOString(),
      totalArticles: 0,
      totalSourcesAttempted: 0,
      activeSourcesCount: 0,
      failedSourcesCount: 0,
      sources: [],
    };
  }
});

/**
 * T027: Read latest sentiment data and extract sourceContributions
 */
async function readLatestSources(): Promise<SentimentDataPoint | null> {
  try {
    const latestDataPoint = await getCurrentDataPoint();

    if (!latestDataPoint || !latestDataPoint.sourceContributions) {
      return null;
    }

    return latestDataPoint;
  } catch (error) {
    console.error('[API /sentiment/sources] Error reading latest data:', error);
    return null;
  }
}

/**
 * T028: Calculate aggregated 7-day metrics per source
 * Aggregates data from last 7 days for reliability metrics
 */
async function calculateSourceMetrics(
  latestDataPoint: SentimentDataPoint
): Promise<Array<SourceContribution & { category: string; articlePercentage: number; reliability: any }>> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get all data points from last 7 days
  const historicalDataPoints = await getDataPointsInRange(sevenDaysAgo, now);

  // Build metrics map: sourceId -> metrics
  const metricsMap = new Map<string, SourceMetricsData>();

  // Aggregate metrics across all data points in 7-day window
  for (const dataPoint of historicalDataPoints) {
    if (!dataPoint.sourceContributions) continue;

    for (const contribution of dataPoint.sourceContributions) {
      const sourceId = contribution.sourceId;
      const existing = metricsMap.get(sourceId) || {
        successCount: 0,
        totalAttempts: 0,
        avgResponseTimeMs: 0,
        consecutiveFailures: 0,
      };

      existing.totalAttempts += 1;

      if (contribution.status === 'success') {
        existing.successCount += 1;
      } else if (contribution.status === 'failed') {
        existing.consecutiveFailures += 1;
      } else {
        existing.consecutiveFailures = 0; // Reset on partial success
      }

      // Track response times (only for successful fetches)
      if (contribution.status === 'success') {
        const currentAvg = existing.avgResponseTimeMs;
        const count = existing.successCount;
        existing.avgResponseTimeMs =
          (currentAvg * (count - 1) + contribution.fetchDurationMs) / count;
      }

      existing.lastSuccessAt =
        contribution.status === 'success' ? contribution.fetchedAt : existing.lastSuccessAt;
      existing.lastFailureAt =
        contribution.status === 'failed' ? contribution.fetchedAt : existing.lastFailureAt;

      metricsMap.set(sourceId, existing);
    }
  }

  // Build response with metrics
  const totalArticles = latestDataPoint.articlesAnalyzed || 1; // Avoid division by zero

  return (latestDataPoint.sourceContributions || []).map((contribution) => {
    const metrics = metricsMap.get(contribution.sourceId) || {
      successCount: 0,
      totalAttempts: 0,
      avgResponseTimeMs: 0,
      consecutiveFailures: 0,
    };

    const successRate =
      metrics.totalAttempts > 0 ? (metrics.successCount / metrics.totalAttempts) * 100 : 0;

    // Mark source as inactive if 72+ consecutive failures
    const isInactive = metrics.consecutiveFailures >= 72;

    return {
      ...contribution,
      category: 'general', // Default category (can be enhanced later)
      articlePercentage: (contribution.articlesCollected / totalArticles) * 100,
      reliability: {
        successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
        avgResponseTimeMs: Math.round(metrics.avgResponseTimeMs),
        consecutiveFailures: metrics.consecutiveFailures,
        lastSuccessAt: metrics.lastSuccessAt,
        lastFailureAt: metrics.lastFailureAt,
        isHealthy: successRate >= 90,
        isInactive,
        inactiveMarkedAt: isInactive ? metrics.lastFailureAt : undefined,
      },
    };
  });
}
