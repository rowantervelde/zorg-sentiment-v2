/**
 * Unified article representation from any source type
 */
export interface Article {
  /** Article headline */
  title: string
  
  /** Summary or excerpt */
  description: string
  
  /** Full text or combined title+description for analysis */
  content: string
  
  /** Canonical URL */
  link: string
  
  /** Publication timestamp (ISO 8601) */
  pubDate: string
  
  /** References SourceConfiguration.id */
  sourceId: string
  
  /** SHA-256 hash of normalized title+content for deduplication */
  deduplicationHash: string
  
  /** Optional fields for social media sources */
  authorHandle?: string
  postUrl?: string
  engagementMetrics?: {
    likes?: number
    shares?: number
    comments?: number
    upvoteRatio?: number // T020: Direct upvote ratio for Reddit (0.0-1.0)
  }
}

/**
 * Article with complete sentiment analysis results
 * Used for storage and deriving all aggregate metrics
 */
export interface ArticleWithSentiment extends Article {
  /** Unique identifier for storage */
  id: string
  
  /** Raw sentiment score from analyzer (-1.0 to +1.0) */
  rawSentimentScore: number
  
  /** Positive words identified by sentiment analyzer */
  positiveWords: string[]
  
  /** Negative words identified by sentiment analyzer */
  negativeWords: string[]
  
  /** Recency weight based on publication date (0.0-1.0) */
  recencyWeight: number
  
  /** Source reliability weight (0.0-1.0) */
  sourceWeight: number
  
  /** Final weighted score: rawSentimentScore * recencyWeight * sourceWeight */
  finalWeightedScore: number
  
  /** Contribution to overall sentiment (0-100 percentage) */
  contributionPercentage: number
  
  /** Whether this article was marked as duplicate */
  deduplicated: boolean
}
