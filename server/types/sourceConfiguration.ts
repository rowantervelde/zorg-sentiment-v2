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
}
