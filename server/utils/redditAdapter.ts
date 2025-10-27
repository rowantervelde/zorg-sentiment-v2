/**
 * Reddit Source Adapter (Stub)
 * Implements SourceAdapter interface for future Reddit integration
 * Currently throws "Not implemented" error - to be implemented in future phase
 * 
 * Task T045: Create stub redditAdapter.ts implementing SourceAdapter interface
 */

import type { Article } from '../types/article'
import type { SourceConfiguration } from '../types/sourceConfiguration'
import type { SourceType } from '../types/source'
import type { SourceAdapter } from './sourceAdapter'
import { SourceType as SourceTypeEnum } from '../types/source'

export class RedditAdapter implements SourceAdapter {
  /**
   * Fetch articles from Reddit (not yet implemented)
   */
  async fetchArticles(config: SourceConfiguration): Promise<Article[]> {
    throw new Error(
      `[RedditAdapter] Not implemented yet. Reddit integration planned for future phase. Source: ${config.name}`
    )
  }

  /**
   * Validate Reddit source configuration
   */
  validateConfig(config: SourceConfiguration): boolean {
    // Basic validation for future implementation
    if (!config.id || !config.name || !config.type) {
      return false
    }

    if (config.type !== SourceTypeEnum.SOCIAL_REDDIT) {
      return false
    }

    // TODO: Add Reddit-specific validation (subreddit, API credentials, etc.)
    return true
  }

  /**
   * Get source identifier
   */
  getIdentifier(config: SourceConfiguration): string {
    return config.id
  }

  /**
   * Check if adapter supports Reddit source type
   */
  supportsSourceType(type: SourceType): boolean {
    return type === SourceTypeEnum.SOCIAL_REDDIT
  }
}
