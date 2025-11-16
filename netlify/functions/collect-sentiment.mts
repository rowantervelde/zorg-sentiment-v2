/**
 * Netlify Scheduled Function: Collect Sentiment Data
 * Runs hourly to fetch from multiple RSS feeds, analyze sentiment, and store results
 * Schedule configured in netlify.toml: @hourly
 * 
 * Updated for multi-source collection (feature 002-multi-source-sentiment)
 * Feature 004: Now analyzes and stores individual articles with sentiment details
 */

import type { Config } from '@netlify/functions';
import type { SentimentDataPoint } from '../../app/types/sentiment';
import type { SourceConfiguration } from '../../server/types/sourceConfiguration';
import type { ArticleWithSentiment } from '../../server/types/article';
import { fetchFromAllSources } from '../../server/utils/sourceOrchestrator';
import { 
  analyzeArticleWithDetails, 
  calculateContributionPercentages 
} from '../../server/utils/sentimentAnalyzer';
import { generateMoodSummary, calculateMoodFromArticles } from '../../server/utils/moodSummary';
import { addDataPoint } from '../../server/utils/storage';
import sourcesConfig from '../../server/config/sources.json';

/**
 * Main scheduled function handler
 */
export default async (req: Request) => {
  const startTime = Date.now();
  
  try {
    const { next_run } = await req.json();
    console.log('[Collect Sentiment] Starting multi-source collection. Next run:', next_run);

    // Step 1: Load source configurations
    const sources = sourcesConfig.sources as SourceConfiguration[];
    console.log(`[Collect Sentiment] Loaded ${sources.length} source configurations`);
    console.time('[Collect Sentiment] Total duration');

    // Step 2: Fetch from all sources with orchestration
    console.log('[Collect Sentiment] Fetching from all sources...');
    console.time('[Collect Sentiment] Orchestration');
    const orchestrationResult = await fetchFromAllSources(sources);
    console.timeEnd('[Collect Sentiment] Orchestration');
    
    const { articles, sourceContributions, sourceDiversity, totalDurationMs } = orchestrationResult;
    
    console.log(`[Collect Sentiment] Orchestration complete in ${totalDurationMs}ms`);
    console.log(`[Collect Sentiment] Collected ${articles.length} unique articles from ${sourceDiversity.activeSources}/${sourceDiversity.totalSources} sources`);
    console.log(`[Collect Sentiment] Source contributions: ${sourceContributions.length} sources tracked`);

    if (articles.length === 0) {
      console.warn('[Collect Sentiment] No articles collected from any source');
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No articles collected from any source',
        sourceContributions,
        sourceDiversity,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Analyze each article individually with full details
    console.log('[Collect Sentiment] Analyzing articles individually...');
    console.time('[Collect Sentiment] Individual article analysis');
    
    // Get source config map for weighting
    const sourceConfigMap = new Map<string, SourceConfiguration>();
    sources.forEach(source => sourceConfigMap.set(source.id, source));
    
    // Analyze each article
    let analyzedArticles: ArticleWithSentiment[] = articles.map((article) => {
      const sourceConfig = sourceConfigMap.get(article.sourceId);
      return analyzeArticleWithDetails(article, sourceConfig);
    });
    
    // Calculate contribution percentages
    analyzedArticles = calculateContributionPercentages(analyzedArticles);
    
    console.timeEnd('[Collect Sentiment] Individual article analysis');
    console.log(`[Collect Sentiment] Analyzed ${analyzedArticles.length} articles individually`);
    
    // Step 4: Limit articles per source to top 50 by contribution
    console.log('[Collect Sentiment] Limiting to top 50 articles per source...');
    const MAX_ARTICLES_PER_SOURCE = 50;
    const articlesBySource = new Map<string, ArticleWithSentiment[]>();
    
    // Group by source
    analyzedArticles.forEach(article => {
      const existing = articlesBySource.get(article.sourceId) || [];
      existing.push(article);
      articlesBySource.set(article.sourceId, existing);
    });
    
    // Keep top 50 per source by contribution percentage
    const limitedArticles: ArticleWithSentiment[] = [];
    articlesBySource.forEach((sourceArticles, sourceId) => {
      const sorted = sourceArticles.sort((a, b) => b.contributionPercentage - a.contributionPercentage);
      const topArticles = sorted.slice(0, MAX_ARTICLES_PER_SOURCE);
      limitedArticles.push(...topArticles);
      
      if (sourceArticles.length > MAX_ARTICLES_PER_SOURCE) {
        console.log(`[Collect Sentiment] Limited ${sourceId} from ${sourceArticles.length} to ${MAX_ARTICLES_PER_SOURCE} articles`);
      }
    });
    
    console.log(`[Collect Sentiment] Storing ${limitedArticles.length} articles (limited from ${analyzedArticles.length})`);
    
    // Step 5: Calculate aggregate metrics FROM analyzed articles (single source of truth)
    console.log('[Collect Sentiment] Calculating aggregate metrics from articles...');
    const { breakdown, moodClassification } = calculateMoodFromArticles(limitedArticles);
    
    console.log('[Collect Sentiment] Aggregate analysis complete:', {
      mood: moodClassification,
      breakdown,
    });

    // Step 6: Calculate per-source sentiment breakdown FROM articles
    console.log('[Collect Sentiment] Calculating per-source sentiment breakdowns from articles...');
    console.time('[Collect Sentiment] Per-source analysis');
    const updatedContributions = sourceContributions.map((contribution) => {
      if (contribution.status === 'failed' || contribution.articlesCollected === 0) {
        console.log(`[Collect Sentiment] Skipping ${contribution.sourceName}: status=${contribution.status}`);
        return contribution;
      }
      
      // Get analyzed articles from this source
      const sourceArticles = limitedArticles.filter((a) => a.sourceId === contribution.sourceId);
      
      if (sourceArticles.length === 0) {
        console.log(`[Collect Sentiment] No articles found for ${contribution.sourceName} in analyzed set`);
        return contribution;
      }
      
      // Calculate breakdown from articles
      const { breakdown: sourceBreakdown } = calculateMoodFromArticles(sourceArticles);
      console.log(`[Collect Sentiment] ${contribution.sourceName}: ${sourceArticles.length} articles analyzed`);
      
      return {
        ...contribution,
        sentimentBreakdown: sourceBreakdown,
      };
    });
    console.timeEnd('[Collect Sentiment] Per-source analysis');
    console.log(`[Collect Sentiment] Per-source sentiment analysis complete for ${updatedContributions.length} sources`);

    // Step 5: Generate mood summary
    console.log('[Collect Sentiment] Generating mood summary...');
    const timestamp = new Date().toISOString();
    const confidence = limitedArticles.length / 100; // Simple confidence: more articles = higher confidence (capped at 1.0)
    
    const dataPoint: SentimentDataPoint = {
      timestamp,
      collectionDurationMs: Date.now() - startTime,
      moodClassification,
      breakdown,
      summary: '', // Will be set below
      articlesAnalyzed: limitedArticles.length,
      source: 'multi-source', // Legacy field - kept for backward compatibility
      confidence: Math.min(confidence, 1.0),
      sourceContributions: updatedContributions,
      sourceDiversity,
      analyzedArticles: limitedArticles, // Feature 004: Store individual articles
    };

    const moodSummary = generateMoodSummary(dataPoint);
    dataPoint.summary = moodSummary.text;

    console.log('[Collect Sentiment] Generated summary:', moodSummary.text);
    console.log('[Collect Sentiment] Data point object created:', {
      timestamp: dataPoint.timestamp,
      mood: dataPoint.moodClassification,
      articlesAnalyzed: dataPoint.articlesAnalyzed,
      storedArticles: dataPoint.analyzedArticles?.length,
      sourceContributions: dataPoint.sourceContributions?.length,
    });

    // Step 6: Store data point with 7-day retention validation
    console.log('[Collect Sentiment] Saving data point with 7-day retention validation...');
    console.time('[Collect Sentiment] Storage save');
    try {
      await addDataPoint(dataPoint);
      console.timeEnd('[Collect Sentiment] Storage save');
      console.log('[Collect Sentiment] Data point saved successfully to storage');
    } catch (storageError) {
      console.error('[Collect Sentiment] CRITICAL ERROR saving data point:', storageError);
      throw storageError;
    }

    // Verify data retention (7-day max)
    console.log('[Collect Sentiment] Verifying data retention...');
    console.time('[Collect Sentiment] Verify retention');
    const { getData } = await import('../../server/utils/storage');
    const history = await getData();
    const retentionDays = history.retentionDays;
    const oldestAllowed = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const violatingPoints = history.dataPoints.filter(
      (dp: SentimentDataPoint) => new Date(dp.timestamp) < oldestAllowed
    );
    console.timeEnd('[Collect Sentiment] Verify retention');
    
    if (violatingPoints.length > 0) {
      console.warn(`[Collect Sentiment] Found ${violatingPoints.length} data points older than ${retentionDays} days (should have been cleaned up)`);
    } else {
      console.log(`[Collect Sentiment] Data retention validation passed: all ${history.dataPoints.length} points within ${retentionDays}-day window`);
    }

    const duration = Date.now() - startTime;
    console.timeEnd('[Collect Sentiment] Total duration');
    console.log(`[Collect Sentiment] Collection complete in ${duration}ms`);
    console.log(`[Collect Sentiment] Source diversity: ${sourceDiversity.activeSources} active, ${sourceDiversity.failedSources} failed`);

    return new Response(JSON.stringify({
      success: true,
      dataPoint: {
        timestamp: dataPoint.timestamp,
        mood: dataPoint.moodClassification,
        articlesAnalyzed: dataPoint.articlesAnalyzed,
        sourceDiversity: dataPoint.sourceDiversity,
      },
      durationMs: duration,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Collect Sentiment] Error during collection:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Netlify scheduled function configuration
 * Runs every hour via netlify.toml configuration
 */
export const config: Config = {
  schedule: '@hourly',
};
