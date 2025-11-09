/**
 * Source Orchestrator - coordinates fetching from multiple sources
 * Implements Promise.allSettled for graceful degradation (FR-003)
 */

import type { Article } from '../types/article'
import type { SourceConfiguration } from '../types/sourceConfiguration'
import type { SourceContribution, SourceDiversity } from '~/types/sentiment'
import { SourceType } from '../types/source'
import type { SourceAdapter } from './sourceAdapter'
import { RSSAdapter } from './rssAdapter'
import { TwitterAdapter } from './twitterAdapter'
import { RedditAdapter } from './redditAdapter'
import { isDuplicate } from './deduplicator'

/**
 * Result of fetching from all sources
 */
export interface OrchestrationResult {
  /** Unique articles after deduplication */
  articles: Article[]
  
  /** Per-source contribution tracking */
  sourceContributions: SourceContribution[]
  
  /** Source diversity metrics */
  sourceDiversity: SourceDiversity
  
  /** Total fetch duration in milliseconds */
  totalDurationMs: number
}

/**
 * Adapter registry - maps source types to adapter instances (T042)
 * Implements adapter pattern for extensible source support
 */
const adapterRegistry = new Map<SourceType, SourceAdapter>([
  [SourceType.RSS, new RSSAdapter()],
  // T046: Social media adapters registered (commented out until implemented)
  [SourceType.SOCIAL_TWITTER, new TwitterAdapter()],
  [SourceType.SOCIAL_REDDIT, new RedditAdapter()],
])

/**
 * Fetch articles from all configured sources with graceful degradation
 * Uses Promise.allSettled to continue even if some sources fail
 */
export async function fetchFromAllSources(
  sources: SourceConfiguration[]
): Promise<OrchestrationResult> {
  const startTime = Date.now()
  
  // Filter only active sources
  const activeSources = sources.filter((source) => source.isActive)
  
  console.log(`[Orchestrator] Fetching from ${activeSources.length} active sources`)
  
  // Fetch from all sources in parallel using Promise.allSettled
  const fetchPromises = activeSources.map((source) => 
    fetchFromSource(source)
  )
  
  const results = await Promise.allSettled(fetchPromises)
  
  // Process results
  let allArticles: Article[] = []
  const sourceContributions: SourceContribution[] = []
  let successCount = 0
  let failureCount = 0
  
  results.forEach((result, index) => {
    const source = activeSources[index]
    if (!source) return
    
    if (result.status === 'fulfilled') {
      const { articles, contribution } = result.value
      allArticles = allArticles.concat(articles)
      sourceContributions.push(contribution)
      successCount++
      
      console.log(`[Orchestrator] ${source.name}: ${articles.length} articles fetched`)
    } else {
      failureCount++
      
      // Create failed contribution entry
      sourceContributions.push({
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        articlesCollected: 0,
        sentimentBreakdown: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
        fetchedAt: new Date().toISOString(),
        fetchDurationMs: 0,
        status: 'failed',
        error: result.reason?.message || 'Unknown error',
      })
      
      console.error(`[Orchestrator] ${source.name}: FAILED - ${result.reason?.message}`)
    }
  })
  
  // Deduplicate articles across sources
  console.log(`[Orchestrator] Starting deduplication of ${allArticles.length} articles...`)
  const dedupeStart = Date.now()
  const uniqueArticles = deduplicateArticles(allArticles)
  const dedupeDuration = Date.now() - dedupeStart
  
  console.log(`[Orchestrator] Deduplication: ${allArticles.length} → ${uniqueArticles.length} articles (took ${dedupeDuration}ms)`)
  
  // Calculate source diversity
  const sourceDiversity: SourceDiversity = {
    totalSources: activeSources.length,
    activeSources: successCount,
    failedSources: failureCount,
  }
  
  const totalDurationMs = Date.now() - startTime
  
  console.log(`[Orchestrator] Complete in ${totalDurationMs}ms - ${successCount} successful, ${failureCount} failed`)
  
  return {
    articles: uniqueArticles,
    sourceContributions,
    sourceDiversity,
    totalDurationMs,
  }
}

/**
 * T020: Calculate engagement statistics for Reddit articles
 * Aggregates upvotes, comments, and upvote ratios from Reddit posts
 */
function calculateEngagementStats(articles: Article[]): { 
  totalUpvotes: number
  totalComments: number
  avgUpvotes: number
  avgComments: number
  avgUpvoteRatio: number
} | undefined {
  // Filter for Reddit articles with engagement metrics
  const redditArticles = articles.filter(article => article.engagementMetrics)

  if (redditArticles.length === 0) {
    return undefined
  }

  // Extract engagement metrics
  const upvotes = redditArticles.map(a => a.engagementMetrics?.likes || 0)
  const comments = redditArticles.map(a => a.engagementMetrics?.comments || 0)
  
  // Extract upvote ratios - use direct upvoteRatio field
  const upvoteRatios = redditArticles
    .filter(a => a.engagementMetrics?.upvoteRatio !== undefined)
    .map(a => a.engagementMetrics!.upvoteRatio!)

  const totalUpvotes = upvotes.reduce((sum, val) => sum + val, 0)
  const totalComments = comments.reduce((sum, val) => sum + val, 0)

  return {
    totalUpvotes,
    totalComments,
    avgUpvotes: Math.round(totalUpvotes / upvotes.length) || 0,
    avgComments: Math.round(totalComments / comments.length) || 0,
    avgUpvoteRatio: upvoteRatios.length > 0 
      ? Math.round((upvoteRatios.reduce((sum, val) => sum + val, 0) / upvoteRatios.length) * 100) / 100 
      : 0,
  }
}

/**
 * Fetch articles from a single source with its adapter
 */
async function fetchFromSource(
  source: SourceConfiguration
): Promise<{ articles: Article[]; contribution: SourceContribution }> {
  const fetchStart = Date.now()
  
  // Get appropriate adapter for source type
  const adapter = adapterRegistry.get(source.type)
  
  if (!adapter) {
    throw new Error(`No adapter registered for source type: ${source.type}`)
  }
  
  if (!adapter.supportsSourceType(source.type)) {
    throw new Error(`Adapter does not support source type: ${source.type}`)
  }
  
  // Validate configuration
  if (!adapter.validateConfig(source)) {
    throw new Error(`Invalid configuration for source: ${source.id}`)
  }
  
  // Fetch articles with timeout enforcement
  const articles = await adapter.fetchArticles(source)
  
  const fetchDurationMs = Date.now() - fetchStart
  
  // Create source contribution (sentiment breakdown calculated later by analyzer)
  const contribution: SourceContribution = {
    sourceId: source.id,
    sourceName: source.name,
    sourceType: source.type,
    articlesCollected: articles.length,
    sentimentBreakdown: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    fetchedAt: new Date().toISOString(),
    fetchDurationMs,
    status: articles.length > 0 ? 'success' : 'partial',
    // T020-T021: Calculate engagement stats for Reddit sources
    engagementStats: source.type === SourceType.SOCIAL_REDDIT 
      ? calculateEngagementStats(articles)
      : undefined,
  }
  
  return { articles, contribution }
}

/**
 * Deduplicate articles across sources using 80% similarity threshold
 * Keeps first occurrence of each unique article
 */
function deduplicateArticles(articles: Article[]): Article[] {
  const unique: Article[] = []
  
  for (const article of articles) {
    if (!isDuplicate(article, unique)) {
      unique.push(article)
    }
  }
  
  return unique
}

/**
 * Calculate source diversity metrics
 */
export function calculateSourceDiversity(
  totalSources: number,
  articles: Article[]
): SourceDiversity {
  const sourceIds = new Set(articles.map((a) => a.sourceId))
  
  return {
    totalSources,
    activeSources: sourceIds.size,
    failedSources: totalSources - sourceIds.size,
  }
}
