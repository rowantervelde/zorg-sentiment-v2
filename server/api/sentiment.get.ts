/**
 * Nitro API Route: GET /api/sentiment
 * Returns current sentiment data with optional trend and summary
 */

import { defineEventHandler, getQuery } from "h3";
import {
  getSentimentHistory,
  getLatestDataPoint,
} from "../../services/data-store";
import { generateMoodSummary, classifyMood } from "../../services/sentiment-analyzer";
import type { SentimentResponse } from "../../types/api";
import type { TrendPeriod, SentimentBreakdown } from "../../types/sentiment";

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const include = (query.include as string) || "all";

    // Get latest data point
    const latest = await getLatestDataPoint();

    if (!latest) {
      return {
        error: "No data available",
        message: "Sentiment data has not been collected yet",
        code: "NO_DATA",
      };
    }

    // Calculate data age
    const dataAge = Math.floor(
      (Date.now() - new Date(latest.timestamp).getTime()) / 1000
    );
    const isStale = dataAge > 24 * 60 * 60; // 24 hours

    // Build response
    const response: SentimentResponse = {
      current: latest,
      meta: {
        lastUpdated: latest.timestamp,
        dataAge,
        isStale,
      },
    };

    // Add trend data if requested
    if (include === "trend" || include === "all") {
      const history = await getSentimentHistory();
      if (history) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const trendDataPoints = history.dataPoints.filter(
          (dp) =>
            new Date(dp.timestamp) >= sevenDaysAgo &&
            new Date(dp.timestamp) <= now
        );

        // Calculate averages
        const totalPoints = trendDataPoints.length;
        const sum = trendDataPoints.reduce(
          (acc, dp) => ({
            positive: acc.positive + dp.breakdown.positive,
            neutral: acc.neutral + dp.breakdown.neutral,
            negative: acc.negative + dp.breakdown.negative,
          }),
          { positive: 0, neutral: 0, negative: 0 }
        );

        const averageMood: SentimentBreakdown = {
          positive: Math.round(sum.positive / totalPoints),
          neutral: Math.round(sum.neutral / totalPoints),
          negative: Math.round(sum.negative / totalPoints),
        };

        const dominantMood = classifyMood(averageMood);
        const expectedHours = 7 * 24; // 168 hours

        const trend: TrendPeriod = {
          startDate: sevenDaysAgo.toISOString(),
          endDate: now.toISOString(),
          dataPoints: trendDataPoints,
          averageMood,
          dominantMood,
          totalDataPoints: totalPoints,
          missingHours: expectedHours - totalPoints,
          dataCompleteness: (totalPoints / expectedHours) * 100,
        };

        response.trend = trend;
      }
    }

    // Add mood summary if requested
    if (include === "summary" || include === "all") {
      response.moodSummary = generateMoodSummary(
        latest.moodClassification,
        latest.timestamp
      );
    }

    return response;
  } catch (error) {
    console.error("[API] Error fetching sentiment:", error);
    return {
      error: "Internal server error",
      message: "Failed to fetch sentiment data",
      code: "INTERNAL_ERROR",
    };
  }
});
