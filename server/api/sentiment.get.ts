/**
 * GET /api/sentiment
 * Returns current sentiment data with optional trend and summary
 * Supports query parameter: ?include=trend|summary|all
 */

import type { SentimentResponse } from '~/types/api';
import type { SentimentDataPoint, TrendPeriod } from '~/types/sentiment';
import { getCurrentDataPoint, getDataPointsInRange, isDataStale } from '../utils/storage';
import { StandardErrors } from '../utils/errorResponse';

export default defineEventHandler(async (event): Promise<SentimentResponse> => {
  const query = getQuery(event);
  const include = (query.include as string) || '';
  const requestId = event.context.requestId || Math.random().toString(36).substring(7);

  // Structured logging with request context
  const logger = {
    info: (message: string, meta?: Record<string, any>) => {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        requestId,
        endpoint: '/api/sentiment',
        message,
        ...meta,
      }));
    },
    error: (message: string, error?: any, meta?: Record<string, any>) => {
      console.error(JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        requestId,
        endpoint: '/api/sentiment',
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

  logger.info('Sentiment data requested', { include });

  try {
    // Get current data point
    const current = await getCurrentDataPoint();
    const stale = await isDataStale();

    logger.info('Data fetched', { 
      hasData: !!current, 
      isStale: stale,
      dataTimestamp: current?.timestamp,
    });

    // Base response
    const response: SentimentResponse = {
      current,
      timestamp: new Date().toISOString(),
      isStale: stale,
    };

    // Include trend data if requested
    if (include === 'trend' || include === 'all') {
      logger.info('Including trend data');
      response.trend = await calculateTrendPeriod(event);
    }

    // Include summary if requested
    if (include === 'summary' || include === 'all') {
      logger.info('Including summary data');
      response.summary = current?.summary;
    }

    // Set cache headers (5 minutes)
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    });

    logger.info('Response sent successfully', { 
      includesTrend: !!response.trend,
      includesSummary: !!response.summary,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch sentiment data', error);
    throw StandardErrors.internalError('Failed to fetch sentiment data');
  }
});

/**
 * Calculate trend period for the last N hours (default: 7 days = 168 hours)
 */
async function calculateTrendPeriod(event: any): Promise<TrendPeriod> {
  const now = new Date();
  
  // Use runtime config - pass event to ensure env vars are read at runtime
  const config = useRuntimeConfig(event);
  const trendWindowHours = config.trendWindowHours;
  
  console.log('[API sentiment] Trend window hours:', trendWindowHours);
  console.log('[API sentiment] Runtime config:', config);
  
  const startTime = new Date(now.getTime() - trendWindowHours * 60 * 60 * 1000);

  const dataPoints = await getDataPointsInRange(startTime, now);

  // Calculate averages
  const avgPositive = Math.round(
    dataPoints.reduce((sum, dp) => sum + dp.breakdown.positive, 0) / (dataPoints.length || 1)
  );
  const avgNegative = Math.round(
    dataPoints.reduce((sum, dp) => sum + dp.breakdown.negative, 0) / (dataPoints.length || 1)
  );
  const avgNeutral = 100 - avgPositive - avgNegative;

  // Find dominant mood
  const moodCounts = dataPoints.reduce(
    (acc, dp) => {
      acc[dp.moodClassification] = (acc[dp.moodClassification] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const dominantMood = Object.keys(moodCounts).reduce((a, b) =>
    (moodCounts[a] ?? 0) > (moodCounts[b] ?? 0) ? a : b
  , 'neutral') as SentimentDataPoint['moodClassification'];

  const expectedHours = trendWindowHours;

  return {
    startDate: startTime.toISOString(),
    endDate: now.toISOString(),
    dataPoints,
    averageMood: {
      positive: avgPositive,
      neutral: avgNeutral,
      negative: avgNegative,
    },
    dominantMood,
    totalDataPoints: dataPoints.length,
    missingHours: expectedHours - dataPoints.length,
    dataCompleteness: (dataPoints.length / expectedHours) * 100,
  };
}
