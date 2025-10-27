/**
 * Twitter/X Source Adapter (Stub)
 * Implements SourceAdapter interface for future Twitter/X integration
 * Currently throws "Not implemented" error - to be implemented in future phase
 * 
 * Task T044: Create stub twitterAdapter.ts implementing SourceAdapter interface
 */

import type { Article } from '../types/article'
import type { SourceConfiguration } from '../types/sourceConfiguration'
import type { SourceType } from '../types/source'
import type { SourceAdapter } from './sourceAdapter'
import { SourceType as SourceTypeEnum } from '../types/source'

export class TwitterAdapter implements SourceAdapter {
  /**
   * Fetch articles from Twitter/X (not yet implemented)
   */
  async fetchArticles(config: SourceConfiguration): Promise<Article[]> {
    throw new Error(
      `[TwitterAdapter] Not implemented yet. Twitter/X integration planned for future phase. Source: ${config.name}`
    )
  }

  /**
   * Validate Twitter/X source configuration
   */
  validateConfig(config: SourceConfiguration): boolean {
    // Basic validation for future implementation
    if (!config.id || !config.name || !config.type) {
      return false
    }

    if (config.type !== SourceTypeEnum.SOCIAL_TWITTER) {
      return false
    }

    // TODO: Add Twitter-specific validation (API key, bearer token, etc.)
    return true
  }

  /**
   * Get source identifier
   */
  getIdentifier(config: SourceConfiguration): string {
    return config.id
  }

  /**
   * Check if adapter supports Twitter/X source type
   */
  supportsSourceType(type: SourceType): boolean {
    return type === SourceTypeEnum.SOCIAL_TWITTER
  }
}
