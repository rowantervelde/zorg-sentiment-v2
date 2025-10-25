/**
 * GET /api/sentiment/history
 * Returns historical sentiment data points with date filtering
 * Per OpenAPI contract: supports from, to, and limit query parameters
 */

import type { SentimentDataPoint } from '~/types/sentiment';
import { getDataPointsInRange, getData } from '../../utils/storage';
import { StandardErrors } from '../../utils/errorResponse';

interface HistoryResponse {
  dataPoints: SentimentDataPoint[];
  count: number;
  period: {
    from: string;
    to: string;
  };
}

export default defineEventHandler(async (event): Promise<HistoryResponse> => {
  const query = getQuery(event);

  try {
    // Parse query parameters
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Default to 7-day window
    const fromParam = query.from as string | undefined;
    const toParam = query.to as string | undefined;
    const limitParam = query.limit as string | undefined;

    let fromDate = sevenDaysAgo;
    let toDate = now;
    let limit = 168; // Default: 7 days * 24 hours

    // Validate and parse 'from' parameter
    if (fromParam) {
      const parsedFrom = new Date(fromParam);
      if (isNaN(parsedFrom.getTime())) {
        throw StandardErrors.badRequest(
          'Invalid from parameter: must be valid ISO 8601 date',
          'INVALID_FROM_PARAMETER'
        );
      }
      fromDate = parsedFrom;
    }

    // Validate and parse 'to' parameter
    if (toParam) {
      const parsedTo = new Date(toParam);
      if (isNaN(parsedTo.getTime())) {
        throw StandardErrors.badRequest(
          'Invalid to parameter: must be valid ISO 8601 date',
          'INVALID_TO_PARAMETER'
        );
      }
      toDate = parsedTo;
    }

    // Validate date range
    if (fromDate > toDate) {
      throw StandardErrors.badRequest(
        'Invalid date range: from must be before to',
        'INVALID_DATE_RANGE'
      );
    }

    // Validate and parse 'limit' parameter
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 168) {
        throw StandardErrors.badRequest(
          'Invalid limit parameter: must be between 1 and 168',
          'INVALID_LIMIT_PARAMETER'
        );
      }
      limit = parsedLimit;
    }

    // Fetch data points in range
    let dataPoints = await getDataPointsInRange(fromDate, toDate);

    // Apply limit
    if (dataPoints.length > limit) {
      dataPoints = dataPoints.slice(0, limit);
    }

    // Set cache headers (5 minutes)
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Type': 'application/json',
    });

    return {
      dataPoints,
      count: dataPoints.length,
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    };
  } catch (error) {
    // Re-throw H3 errors (already formatted)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    // Handle unexpected errors
    console.error('[API /sentiment/history] Error:', error);
    throw StandardErrors.internalError('Failed to fetch sentiment history');
  }
});
