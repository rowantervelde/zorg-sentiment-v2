/**
 * GET /api/sentiment/articles
 * Returns article-level details for a specific source and timestamp
 * 
 * Query parameters:
 * - source: sourceId (required)
 * - timestamp: ISO 8601 timestamp (optional, defaults to latest)
 * 
 * Feature 004: Sentiment Detail Breakdown Page
 * Task 2.2: Extend API to Support Article-Level Details
 */

import type { ArticleDetail, SourceDetailSummary } from '~/types/sentiment';
import { getCurrentDataPoint } from '../../utils/storage';
import { StandardErrors } from '../../utils/errorResponse';

export interface ArticlesResponse {
  sourceSummary: SourceDetailSummary;
  articles: ArticleDetail[];
  timestamp: string;
}

export default defineEventHandler(async (event): Promise<ArticlesResponse> => {
  const query = getQuery(event);
  const sourceId = query.source as string;
  const requestedTimestamp = query.timestamp as string | undefined;
  const requestId = event.context.requestId || Math.random().toString(36).substring(7);

  // Structured logging
  const logger = {
    info: (message: string, meta?: Record<string, any>) => {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        requestId,
        endpoint: '/api/sentiment/articles',
        message,
        ...meta,
      }));
    },
    error: (message: string, error?: any, meta?: Record<string, any>) => {
      console.error(JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        requestId,
        endpoint: '/api/sentiment/articles',
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

  // Validate required parameters
  if (!sourceId) {
    logger.error('Missing required parameter: source');
    throw StandardErrors.badRequest('Missing required parameter: source');
  }

  logger.info('Article details requested', { sourceId, requestedTimestamp });

  try {
    // For MVP, we'll get the current data point
    // In the future, this could be extended to support historical timestamps
    const dataPoint = await getCurrentDataPoint();

    if (!dataPoint || !dataPoint.sourceContributions) {
      logger.info('No sentiment data available');
      throw StandardErrors.notFound('No sentiment data available');
    }

    // Find the source contribution
    const sourceContribution = dataPoint.sourceContributions.find(
      (sc) => sc.sourceId === sourceId
    );

    if (!sourceContribution) {
      logger.info('Source not found', { sourceId });
      throw StandardErrors.notFound(`Source not found: ${sourceId}`);
    }

    // Build source summary with safe defaults for sentimentBreakdown
    const breakdown = sourceContribution.sentimentBreakdown || {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    const sourceSummary: SourceDetailSummary = {
      sourceId: sourceContribution.sourceId,
      sourceName: sourceContribution.sourceName,
      sourceType: sourceContribution.sourceType,
      totalArticles: sourceContribution.articlesCollected,
      deduplicatedArticles: 0, // TODO: Add dedupe tracking
      positivePercentage: breakdown.positive,
      neutralPercentage: breakdown.neutral,
      negativePercentage: breakdown.negative,
      fetchedAt: sourceContribution.fetchedAt,
      fetchStatus: sourceContribution.status,
      error: sourceContribution.error,
    };

    // Feature 004: Get real articles from storage
    const storedArticles = dataPoint.analyzedArticles || [];
    const sourceArticles = storedArticles.filter((article) => article.sourceId === sourceId);
    
    // Map to ArticleDetail interface
    const articles: ArticleDetail[] = sourceArticles.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.description.substring(0, 200), // Truncate to 200 chars
      pubDate: article.pubDate,
      link: article.link,
      sourceId: article.sourceId,
      rawSentimentScore: article.rawSentimentScore,
      positiveWords: article.positiveWords,
      negativeWords: article.negativeWords,
      recencyWeight: article.recencyWeight,
      sourceWeight: article.sourceWeight,
      finalWeightedScore: article.finalWeightedScore,
      contributionPercentage: article.contributionPercentage,
      upvotes: article.engagementMetrics?.likes,
      comments: article.engagementMetrics?.comments,
      upvoteRatio: article.engagementMetrics?.upvoteRatio,
      deduplicated: article.deduplicated,
    }));

    logger.info('Articles retrieved from storage', {
      sourceId,
      articleCount: articles.length,
    });

    // Set cache headers (5 minutes)
    setResponseHeaders(event, {
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    });

    return {
      sourceSummary,
      articles,
      timestamp: dataPoint.timestamp,
    };
  } catch (error) {
    logger.error('Failed to fetch article details', error);
    
    // Re-throw standard errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    
    throw StandardErrors.internalError('Failed to fetch article details');
  }
});
