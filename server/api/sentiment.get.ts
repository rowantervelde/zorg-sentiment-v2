/**
 * GET /api/sentiment
 * Returns current sentiment data with optional trend and summary
 * Supports query parameter: ?include=trend|summary|all
 */

import type { SentimentResponse } from '~/types/api';
import type { SentimentDataPoint, TrendPeriod } from '~/types/sentiment';
import { getCurrentDataPoint, getDataPointsInRange, isDataStale } from '../utils/storage';

export default defineEventHandler(async (event): Promise<SentimentResponse> => {
  const query = getQuery(event);
  const include = (query.include as string) || '';

  try {
    // Get current data point
    const current = await getCurrentDataPoint();
    const stale = await isDataStale();

    // Base response
    const response: SentimentResponse = {
      current,
      timestamp: new Date().toISOString(),
      isStale: stale,
    };

    // Include trend data if requested
    if (include === 'trend' || include === 'all') {
      response.trend = await calculateTrendPeriod(event);
    }

    // Include summary if requested
    if (include === 'summary' || include === 'all') {
      response.summary = current?.summary;
    }

    // Set cache headers (5 minutes)
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Type': 'application/json',
    });

    return response;
  } catch (error) {
    console.error('[API /sentiment] Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch sentiment data',
    });
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
