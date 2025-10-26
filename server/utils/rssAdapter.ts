/**
 * RSS Source Adapter - implements SourceAdapter interface for RSS feeds
 */

import type { SourceAdapter } from './sourceAdapter'
import type { Article } from '../types/article'
import type { SourceConfiguration } from '../types/sourceConfiguration'
import { SourceType } from '../types/source'
import { fetchRSSFeed, type RSSArticle } from './rssFetcher'
import { createHash } from 'crypto'

export class RSSAdapter implements SourceAdapter {
  /**
   * Fetch articles from RSS feed
   */
  async fetchArticles(config: SourceConfiguration): Promise<Article[]> {
    if (!this.validateConfig(config)) {
      throw new Error(`Invalid RSS configuration for source: ${config.id}`)
    }

    const timeout = config.timeout || 10000
    const maxArticles = config.maxArticles || 30

    // Fetch RSS feed with timeout
    const rssArticles = await fetchRSSFeed(config.url, {
      timeout,
      maxRetries: 1, // Single attempt per orchestrator pattern
    })

    // Limit articles BEFORE deduplication (per FR-014 clarification)
    const limitedArticles = rssArticles.slice(0, maxArticles)

    // Convert RSS articles to unified Article format
    return limitedArticles.map((rssArticle) => this.convertToArticle(rssArticle, config.id))
  }

  /**
   * Validate RSS source configuration
   */
  validateConfig(config: SourceConfiguration): boolean {
    // Check required fields
    if (!config.id || !config.name || !config.url) {
      return false
    }

    // Check URL is valid HTTPS
    try {
      const url = new URL(config.url)
      if (!url.protocol.startsWith('http')) {
        return false
      }
    } catch {
      return false
    }

    // Check type matches
    if (config.type !== SourceType.RSS) {
      return false
    }

    // Validate optional parameters if present
    if (config.maxArticles !== undefined) {
      if (config.maxArticles < 1 || config.maxArticles > 100) {
        return false
      }
    }

    if (config.timeout !== undefined) {
      if (config.timeout < 1000 || config.timeout > 30000) {
        return false
      }
    }

    return true
  }

  /**
   * Get source identifier
   */
  getIdentifier(config: SourceConfiguration): string {
    return config.id
  }

  /**
   * Check if adapter supports source type
   */
  supportsSourceType(type: SourceType): boolean {
    return type === SourceType.RSS
  }

  /**
   * Convert RSS article to unified Article format
   */
  private convertToArticle(rssArticle: RSSArticle, sourceId: string): Article {
    const deduplicationHash = this.generateDeduplicationHash(
      rssArticle.title,
      rssArticle.description
    )

    return {
      title: rssArticle.title,
      description: rssArticle.description,
      content: rssArticle.content,
      link: rssArticle.link,
      pubDate: rssArticle.pubDate,
      sourceId,
      deduplicationHash,
    }
  }

  /**
   * Generate SHA-256 hash for deduplication
   */
  private generateDeduplicationHash(title: string, content: string): string {
    const normalized = `${title} ${content}`.toLowerCase().trim()
    return createHash('sha256').update(normalized).digest('hex')
  }
}
