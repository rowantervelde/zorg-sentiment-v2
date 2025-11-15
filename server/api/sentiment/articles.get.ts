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

    // Build source summary
    const sourceSummary: SourceDetailSummary = {
      sourceId: sourceContribution.sourceId,
      sourceName: sourceContribution.sourceName,
      sourceType: sourceContribution.sourceType,
      totalArticles: sourceContribution.articlesCollected,
      deduplicatedArticles: 0, // TODO: Add dedupe tracking
      positivePercentage: sourceContribution.sentimentBreakdown.positive,
      neutralPercentage: sourceContribution.sentimentBreakdown.neutral,
      negativePercentage: sourceContribution.sentimentBreakdown.negative,
      fetchedAt: sourceContribution.fetchedAt,
      fetchStatus: sourceContribution.status,
      error: sourceContribution.error,
    };

    // For MVP, return mock articles
    // TODO: Extend storage to persist individual articles
    const articles: ArticleDetail[] = generateMockArticles(sourceContribution);

    logger.info('Articles generated', {
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

/**
 * Generate mock articles based on source contribution data
 * TODO: Replace with real article data from storage
 */
function generateMockArticles(sourceContribution: any): ArticleDetail[] {
  const articleCount = sourceContribution.articlesCollected;
  
  if (articleCount === 0) {
    return [];
  }

  // Generate mock articles with realistic sentiment distribution
  const articles: ArticleDetail[] = [];
  const { positive, neutral, negative } = sourceContribution.sentimentBreakdown;

  // Calculate how many articles of each type
  const positiveCount = Math.round((positive / 100) * articleCount);
  const negativeCount = Math.round((negative / 100) * articleCount);
  const neutralCount = articleCount - positiveCount - negativeCount;

  let totalWeightedScore = 0;

  // Generate positive articles
  for (let i = 0; i < positiveCount; i++) {
    const score = 0.3 + Math.random() * 0.7; // 0.3 to 1.0
    const recencyWeight = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
    const sourceWeight = 1.0;
    const weightedScore = score * recencyWeight * sourceWeight;
    totalWeightedScore += Math.abs(weightedScore);

    articles.push({
      id: `${sourceContribution.sourceId}-pos-${i}`,
      title: `Positief artikel over zorgverzekering ${i + 1}`,
      excerpt: 'Dit is een positief artikel over ontwikkelingen in de zorg...',
      pubDate: new Date(Date.now() - i * 3600000).toISOString(),
      link: `https://example.com/article-pos-${i}`,
      sourceId: sourceContribution.sourceId,
      rawSentimentScore: score,
      positiveWords: ['ontwikkelingen', 'verbetering', 'vooruitgang'],
      negativeWords: [],
      recencyWeight,
      sourceWeight,
      finalWeightedScore: weightedScore,
      contributionPercentage: 0, // Will be calculated later
      upvotes: sourceContribution.engagementStats?.avgUpvotes,
      comments: sourceContribution.engagementStats?.avgComments,
      deduplicated: false,
    });
  }

  // Generate negative articles
  for (let i = 0; i < negativeCount; i++) {
    const score = -0.3 - Math.random() * 0.7; // -0.3 to -1.0
    const recencyWeight = 0.6 + Math.random() * 0.4;
    const sourceWeight = 1.0;
    const weightedScore = score * recencyWeight * sourceWeight;
    totalWeightedScore += Math.abs(weightedScore);

    articles.push({
      id: `${sourceContribution.sourceId}-neg-${i}`,
      title: `Negatief artikel over zorgverzekering ${i + 1}`,
      excerpt: 'Dit is een negatief artikel over problemen in de zorg...',
      pubDate: new Date(Date.now() - (positiveCount + i) * 3600000).toISOString(),
      link: `https://example.com/article-neg-${i}`,
      sourceId: sourceContribution.sourceId,
      rawSentimentScore: score,
      positiveWords: [],
      negativeWords: ['problemen', 'tekort', 'wachttijden'],
      recencyWeight,
      sourceWeight,
      finalWeightedScore: weightedScore,
      contributionPercentage: 0,
      upvotes: sourceContribution.engagementStats?.avgUpvotes,
      comments: sourceContribution.engagementStats?.avgComments,
      deduplicated: false,
    });
  }

  // Generate neutral articles
  for (let i = 0; i < neutralCount; i++) {
    const score = -0.2 + Math.random() * 0.4; // -0.2 to 0.2
    const recencyWeight = 0.5 + Math.random() * 0.5;
    const sourceWeight = 1.0;
    const weightedScore = score * recencyWeight * sourceWeight;
    totalWeightedScore += Math.abs(weightedScore);

    articles.push({
      id: `${sourceContribution.sourceId}-neu-${i}`,
      title: `Neutraal artikel over zorgverzekering ${i + 1}`,
      excerpt: 'Dit is een neutraal informatief artikel over de zorg...',
      pubDate: new Date(Date.now() - (positiveCount + negativeCount + i) * 3600000).toISOString(),
      link: `https://example.com/article-neu-${i}`,
      sourceId: sourceContribution.sourceId,
      rawSentimentScore: score,
      positiveWords: [],
      negativeWords: [],
      recencyWeight,
      sourceWeight,
      finalWeightedScore: weightedScore,
      contributionPercentage: 0,
      upvotes: sourceContribution.engagementStats?.avgUpvotes,
      comments: sourceContribution.engagementStats?.avgComments,
      deduplicated: false,
    });
  }

  // Calculate contribution percentages
  if (totalWeightedScore > 0) {
    articles.forEach((article) => {
      article.contributionPercentage = 
        (Math.abs(article.finalWeightedScore) / totalWeightedScore) * 100;
    });
  }

  return articles;
}
