import type { SourceType } from './source'

/**
 * Configuration for a data source (RSS feed or future social media)
 */
export interface SourceConfiguration {
  /** Unique identifier (kebab-case, e.g., "nu-nl-gezondheid") */
  id: string
  
  /** Display name (e.g., "NU.nl Gezondheid") */
  name: string
  
  /** Source type */
  type: SourceType
  
  /** Feed URL or API endpoint */
  url: string
  
  /** Source category */
  category: 'general' | 'healthcare-specific'
  
  /** Whether source is currently enabled */
  isActive: boolean
  
  /** Max articles per fetch (default: 30) */
  maxArticles?: number
  
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number
  
  /** Weight for future weighted sampling (default: 1) */
  priority?: number
  
  /** Additional HTTP headers */
  customHeaders?: Record<string, string>
  
  /** Reliability metrics */
  reliability?: {
    successRate?: number
    avgResponseTimeMs?: number
    consecutiveFailures?: number
    lastSuccessAt?: string
    lastFailureAt?: string
  }
  
  /** Reddit-specific configuration (Feature 003) */
  redditConfig?: RedditSourceConfig
}

/**
 * Reddit-specific source configuration (Feature 003-reddit-integration)
 */
export interface RedditSourceConfig {
  /** Subreddit name without r/ prefix (e.g., "thenetherlands") */
  subreddit: string
  
  /** Time window for fetching posts: "day" | "week" | "month" */
  timeWindow: 'day' | 'week' | 'month'
  
  /** Minimum upvote score threshold (default: 5) */
  minScore: number
  
  /** Minimum comment count threshold (default: 3) */
  minComments: number
  
  /** Maximum posts to fetch before filtering (default: 20) */
  maxPosts: number
  
  /** Whether to include comments in article content (default: true) */
  includeComments: boolean
  
  /** Number of top comments to include (default: 5) */
  topCommentsCount: number
  
  /** T026: Minimum upvote ratio threshold (default: 0.4, range: 0.0-1.0) */
  minUpvoteRatio?: number
  
  /** T026: Maximum content length in characters (default: 2000) */
  maxContentLength?: number
}
