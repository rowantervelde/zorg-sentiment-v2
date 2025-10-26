import type { Article } from '../types/article'
import type { SourceType } from '../types/source'
import type { SourceConfiguration } from '../types/sourceConfiguration'

/**
 * Abstract interface for source adapters
 * Each source type (RSS, Twitter, Reddit) implements this interface
 */
export interface SourceAdapter {
  /**
   * Fetch articles from the source
   * @param config Source configuration
   * @returns Array of articles or throws error
   */
  fetchArticles(config: SourceConfiguration): Promise<Article[]>
  
  /**
   * Validate source configuration
   * @param config Source configuration to validate
   * @returns true if valid, false otherwise
   */
  validateConfig(config: SourceConfiguration): boolean
  
  /**
   * Get source identifier
   * @param config Source configuration
   * @returns Unique identifier string
   */
  getIdentifier(config: SourceConfiguration): string
  
  /**
   * Check if adapter supports source type
   * @param type Source type to check
   * @returns true if supported
   */
  supportsSourceType(type: SourceType): boolean
}
