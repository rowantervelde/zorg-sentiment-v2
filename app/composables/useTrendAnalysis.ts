/**
 * Client-side Trend Analysis Composable
 * Provides utility functions for analyzing sentiment trend data
 */

import type { SentimentDataPoint, TrendPeriod, MoodType } from '~/types/sentiment';

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
