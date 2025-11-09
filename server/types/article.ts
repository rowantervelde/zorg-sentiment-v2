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
