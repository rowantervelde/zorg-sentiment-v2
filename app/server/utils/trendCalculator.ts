/**
 * Trend Period Calculation Utility
 * Calculates 7-day rolling window statistics and trend analysis
 */

import type { SentimentDataPoint, TrendPeriod, MoodType } from '~/types/sentiment';

/**
 * Calculate TrendPeriod from array of SentimentDataPoints
 * Filters to 7-day window and computes statistics
 */
export function calculateTrendPeriod(dataPoints: SentimentDataPoint[]): TrendPeriod {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter to 7-day window
  const filtered = dataPoints.filter((dp) => {
    const dpDate = new Date(dp.timestamp);
    return dpDate >= sevenDaysAgo && dpDate <= now;
  });

  // Sort chronologically (oldest first)
  const sorted = filtered.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const expectedHours = 7 * 24; // 168 hours

  return {
    startDate: sevenDaysAgo.toISOString(),
    endDate: now.toISOString(),
    dataPoints: sorted,
    averageMood: calculateAverageMood(sorted),
    dominantMood: calculateDominantMood(sorted),
    totalDataPoints: sorted.length,
    missingHours: expectedHours - sorted.length,
    dataCompleteness: sorted.length > 0 ? (sorted.length / expectedHours) * 100 : 0,
  };
}

/**
 * Calculate average sentiment percentages across all data points
 */
function calculateAverageMood(dataPoints: SentimentDataPoint[]): {
  positive: number;
  neutral: number;
  negative: number;
} {
  if (dataPoints.length === 0) {
    return { positive: 0, neutral: 0, negative: 0 };
  }

  const totals = dataPoints.reduce(
    (acc, dp) => ({
      positive: acc.positive + dp.breakdown.positive,
      neutral: acc.neutral + dp.breakdown.neutral,
      negative: acc.negative + dp.breakdown.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );

  return {
    positive: Math.round(totals.positive / dataPoints.length),
    neutral: Math.round(totals.neutral / dataPoints.length),
    negative: Math.round(totals.negative / dataPoints.length),
  };
}

/**
 * Calculate most frequent mood classification in period
 */
function calculateDominantMood(dataPoints: SentimentDataPoint[]): MoodType {
  if (dataPoints.length === 0) {
    return 'neutral';
  }

  const counts: Record<MoodType, number> = {
    positive: 0,
    negative: 0,
    mixed: 0,
    neutral: 0,
  };

  dataPoints.forEach((dp) => {
    counts[dp.moodClassification]++;
  });

  // Find mood with highest count
  let maxCount = 0;
  let dominant: MoodType = 'neutral';

  (Object.keys(counts) as MoodType[]).forEach((mood) => {
    if (counts[mood] > maxCount) {
      maxCount = counts[mood];
      dominant = mood;
    }
  });

  return dominant;
}

/**
 * Detect gaps in hourly data collection
 * Returns array of [startTime, endTime] tuples representing gaps
 */
export function detectDataGaps(dataPoints: SentimentDataPoint[]): Array<[string, string]> {
  if (dataPoints.length < 2) {
    return [];
  }

  // Sort chronologically
  const sorted = [...dataPoints].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const gaps: Array<[string, string]> = [];
  const expectedIntervalMs = 60 * 60 * 1000; // 1 hour
  const toleranceMs = 10 * 60 * 1000; // 10 minute tolerance

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentPoint = sorted[i];
    const nextPoint = sorted[i + 1];
    
    if (!currentPoint || !nextPoint) continue;
    
    const current = new Date(currentPoint.timestamp);
    const next = new Date(nextPoint.timestamp);
    const actualGap = next.getTime() - current.getTime();

    // If gap is significantly larger than expected interval, record it
    if (actualGap > expectedIntervalMs + toleranceMs) {
      gaps.push([currentPoint.timestamp, nextPoint.timestamp]);
    }
  }

  return gaps;
}

/**
 * Calculate sentiment swing percentage between two data points
 * Returns positive number for sentiment improvement, negative for decline
 */
export function calculateSentimentSwing(
  from: SentimentDataPoint,
  to: SentimentDataPoint
): number {
  // Calculate net sentiment (positive - negative)
  const fromNet = from.breakdown.positive - from.breakdown.negative;
  const toNet = to.breakdown.positive - to.breakdown.negative;
  
  return toNet - fromNet;
}

/**
 * Detect significant sentiment changes (>20% swing)
 * Returns array of data points where significant changes occurred
 */
export function detectSignificantChanges(
  dataPoints: SentimentDataPoint[],
  threshold: number = 20
): Array<{ dataPoint: SentimentDataPoint; swing: number; index: number }> {
  if (dataPoints.length < 2) {
    return [];
  }

  const sorted = [...dataPoints].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const changes: Array<{ dataPoint: SentimentDataPoint; swing: number; index: number }> = [];

  for (let i = 1; i < sorted.length; i++) {
    const previousPoint = sorted[i - 1];
    const currentPoint = sorted[i];
    
    if (!previousPoint || !currentPoint) continue;
    
    const swing = calculateSentimentSwing(previousPoint, currentPoint);
    
    if (Math.abs(swing) >= threshold) {
      changes.push({
        dataPoint: currentPoint,
        swing,
        index: i,
      });
    }
  }

  return changes;
}

/**
 * Get Dutch description for trend direction
 */
export function getTrendDescription(trend: TrendPeriod): string {
  const { averageMood, dominantMood } = trend;
  
  if (averageMood.positive > 50) {
    return 'De stemming is overwegend positief deze week';
  }
  
  if (averageMood.negative > 50) {
    return 'De stemming is overwegend negatief deze week';
  }
  
  if (dominantMood === 'mixed') {
    return 'De meningen zijn verdeeld deze week';
  }
  
  return 'De stemming is neutraal deze week';
}
