/**
 * Reddit Source Adapter (Feature 003-reddit-integration)
 * Implements SourceAdapter interface for Reddit post collection
 * Uses direct OAuth2 client credentials flow for authentication
 * 
 * Tasks: T007-T019 (User Story 1 - Reddit collection MVP)
 */

import type { Article } from '../types/article'
import type { SourceConfiguration, RedditSourceConfig } from '../types/sourceConfiguration'
import type { SourceType } from '../types/source'
import type { SourceAdapter } from './sourceAdapter'
import { SourceType as SourceTypeEnum } from '../types/source'
import { createHash } from 'crypto'

interface AdapterState {
  lastFetchTime?: Date
  isHealthy: boolean
  errorCount: number
  rateLimitRemaining?: number
  rateLimitResetTime?: Date
}

interface KeywordConfig {
  primary: string[]
  secondary: string[]
  insurers: string[]
  filtering: {
    requirePrimary: boolean
    secondaryBonus: number
    insurerBonus: number
    minimumScore: number
  }
}

interface RedditOAuthToken {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  expiresAt: number
}

interface RedditPost {
  data: {
    title: string
    selftext: string
    author: string
    score: number
    num_comments: number
    upvote_ratio: number
    created_utc: number
    permalink: string
    subreddit: string
    is_self: boolean
    url: string
    id: string
  }
}

interface RedditComment {
  data: {
    body: string
    author: string
    score: number
    created_utc: number
  }
}

export class RedditAdapter implements SourceAdapter {
  private accessToken: RedditOAuthToken | null = null
  private state: AdapterState
  private keywords: KeywordConfig | null = null

  constructor() {
    this.state = {
      isHealthy: true,
      errorCount: 0,
    }
  }

  /**
   * T007: Get OAuth2 access token using client credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Return existing token if still valid
    if (this.accessToken && this.accessToken.expiresAt > Date.now()) {
      return this.accessToken.access_token
    }

    const clientId = process.env.REDDIT_CLIENT_ID
    const clientSecret = process.env.REDDIT_CLIENT_SECRET
    const userAgent = process.env.REDDIT_USER_AGENT || 'zorg-sentiment-v2:1.0.0'

    if (!clientId || !clientSecret) {
      throw new Error('[RedditAdapter] Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET environment variables')
    }

    try {
      // OAuth2 client credentials flow
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': userAgent,
        },
        body: 'grant_type=client_credentials',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OAuth2 token request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      
      this.accessToken = {
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        scope: data.scope || '*',
        expiresAt: Date.now() + (data.expires_in * 1000) - 60000, // Expire 1 min early
      }

      console.log('[RedditAdapter] OAuth2 token obtained successfully')
      return this.accessToken.access_token
    } catch (error) {
      this.state.isHealthy = false
      this.state.errorCount++
      throw new Error(`[RedditAdapter] Failed to get OAuth2 token: ${error}`)
    }
  }

  /**
   * Make authenticated request to Reddit OAuth API
   */
  private async redditFetch(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const token = await this.getAccessToken()
    const userAgent = process.env.REDDIT_USER_AGENT || 'zorg-sentiment-v2:1.0.0'

    const url = new URL(`https://oauth.reddit.com${endpoint}`)
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': userAgent,
      },
    })

    if (!response.ok) {
      throw new Error(`Reddit API request failed: ${response.status} ${response.statusText}`)
    }

    // Update rate limit info from headers
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')
    
    if (remaining) this.state.rateLimitRemaining = parseFloat(remaining)
    if (reset) this.state.rateLimitResetTime = new Date(parseFloat(reset) * 1000)

    return response.json()
  }

  /**
   * T009: Load keyword configuration for filtering
   */
  private async loadKeywords(): Promise<KeywordConfig> {
    if (this.keywords) return this.keywords

    try {
      // Dynamic import for Node.js environment
      const fs = await import('fs')
      const path = await import('path')
      const keywordsPath = path.join(process.cwd(), 'server', 'config', 'reddit-keywords.json')
      const keywordsData = fs.readFileSync(keywordsPath, 'utf-8')
      this.keywords = JSON.parse(keywordsData)
      return this.keywords!
    } catch (error) {
      console.error('[RedditAdapter] Failed to load keywords:', error)
      // Return default keywords if file not found
      return {
        primary: ['zorgverzekering', 'eigen risico', 'zorgkosten'],
        secondary: ['premie', 'zorg'],
        insurers: ['CZ', 'VGZ', 'Menzis'],
        filtering: {
          requirePrimary: true,
          secondaryBonus: 1,
          insurerBonus: 1,
          minimumScore: 1,
        },
      }
    }
  }

  /**
   * T008: Validate Reddit source configuration
   */
  validateConfig(config: SourceConfiguration): boolean {
    // Basic validation
    if (!config.id || !config.name || !config.type) {
      return false
    }

    if (config.type !== SourceTypeEnum.SOCIAL_REDDIT) {
      return false
    }

    // Validate Reddit-specific configuration
    const redditConfig = config.redditConfig
    if (!redditConfig) {
      console.error('[RedditAdapter] Missing redditConfig in source configuration')
      return false
    }

    if (!redditConfig.subreddit || redditConfig.subreddit.trim() === '') {
      console.error('[RedditAdapter] Missing or empty subreddit name')
      return false
    }

    // Validate time window
    const validTimeWindows = ['day', 'week', 'month']
    if (!validTimeWindows.includes(redditConfig.timeWindow)) {
      console.error('[RedditAdapter] Invalid timeWindow:', redditConfig.timeWindow)
      return false
    }

    // Validate numeric thresholds
    if (redditConfig.minScore < 0 || redditConfig.minComments < 0) {
      console.error('[RedditAdapter] Invalid minScore or minComments (must be >= 0)')
      return false
    }

    return true
  }

  /**
   * T009: Keyword filtering - check if post contains relevant Dutch healthcare keywords
   */
  private isRelevantPost(post: RedditPost, keywords: KeywordConfig): boolean {
    const text = `${post.data.title} ${post.data.selftext || ''}`.toLowerCase()

    // Check primary keywords (required)
    const hasPrimary = keywords.primary.some((kw) => text.includes(kw.toLowerCase()))
    if (!hasPrimary && keywords.filtering.requirePrimary) {
      return false
    }

    // Calculate bonus score
    let score = hasPrimary ? 1 : 0
    score += keywords.secondary.filter((kw) => text.includes(kw.toLowerCase())).length * keywords.filtering.secondaryBonus
    score += keywords.insurers.filter((kw) => text.includes(kw.toLowerCase())).length * keywords.filtering.insurerBonus

    return score >= keywords.filtering.minimumScore
  }

  /**
   * T010: Quality filtering - check if post meets minimum engagement thresholds
   */
  private meetsQualityThreshold(post: RedditPost, config: RedditSourceConfig): boolean {
    const score = post.data.score || 0
    const comments = post.data.num_comments || 0

    // Post must have either sufficient upvotes OR sufficient comments
    return score >= config.minScore || comments >= config.minComments
  }

  /**
   * T027: Upvote ratio filtering - exclude low-quality controversial posts
   */
  private meetsUpvoteRatioThreshold(post: RedditPost, config: RedditSourceConfig): boolean {
    const minRatio = config.minUpvoteRatio ?? 0.4 // Default 0.4 (40%)
    const upvoteRatio = post.data.upvote_ratio || 0
    return upvoteRatio >= minRatio
  }

  /**
   * T029: Dutch language detection via keyword presence
   */
  private isDutchContent(post: RedditPost, keywords: KeywordConfig): boolean {
    const text = `${post.data.title} ${post.data.selftext || ''}`.toLowerCase()
    
    // Check if text contains at least one Dutch keyword from any category
    const hasDutchKeyword = 
      keywords.primary.some((kw) => text.includes(kw.toLowerCase())) ||
      keywords.secondary.some((kw) => text.includes(kw.toLowerCase())) ||
      keywords.insurers.some((kw) => text.includes(kw.toLowerCase()))
    
    return hasDutchKeyword
  }

  /**
   * T011: Fetch top comments for a post
   */
  private async fetchTopComments(postId: string, subreddit: string, count: number): Promise<RedditComment[]> {
    try {
      const response = await this.redditFetch(`/r/${subreddit}/comments/${postId}`, {
        limit: count,
        depth: 1,
        sort: 'top',
      })

      // Response is [post_listing, comments_listing]
      const commentsListing = response[1]
      if (!commentsListing || !commentsListing.data || !commentsListing.data.children) {
        return []
      }

      const validComments = commentsListing.data.children
        .filter((item: any) => item.kind === 't1') // t1 = comment
        .map((item: any) => item as RedditComment)
        .filter((comment: RedditComment) => {
          const body = comment.data.body || ''
          return (
            body.length >= 50 &&
            !body.includes('[deleted]') &&
            !body.includes('[removed]')
          )
        })
        .slice(0, count)

      return validComments
    } catch (error) {
      console.error('[RedditAdapter] Error fetching comments:', error)
      return []
    }
  }

  /**
   * T015: Main fetchArticles method - orchestrates fetching, filtering, normalization
   */
  async fetchArticles(config: SourceConfiguration): Promise<Article[]> {
    const startTime = Date.now()

    try {
      // Validate configuration
      if (!this.validateConfig(config)) {
        throw new Error('[RedditAdapter] Invalid configuration')
      }

      // Load keywords
      const keywords = await this.loadKeywords()

      const redditConfig = config.redditConfig!
      const subreddit = redditConfig.subreddit

      console.log(`[RedditAdapter] Fetching posts from r/${subreddit}`)

      // Fetch posts from subreddit using OAuth API
      const response = await this.fetchWithRetry(async () => {
        return this.redditFetch(`/r/${subreddit}/hot`, {
          limit: redditConfig.maxPosts,
          raw_json: 1,
        })
      })

      const posts: RedditPost[] = response.data.children.filter((item: any) => item.kind === 't3')

      console.log(`[RedditAdapter] Fetched ${posts.length} posts from r/${subreddit}`)

      // T030: Track rejection reasons for filtering validation
      const rejectionStats = {
        notRelevant: 0,
        lowQuality: 0,
        lowUpvoteRatio: 0,
        notDutch: 0,
        total: 0,
      }

      // Filter posts by keywords, quality, upvote ratio, and language
      const relevantPosts = posts.filter((post: RedditPost) => {
        const isRelevant = this.isRelevantPost(post, keywords)
        const meetsQuality = this.meetsQualityThreshold(post, redditConfig)
        const meetsUpvoteRatio = this.meetsUpvoteRatioThreshold(post, redditConfig)
        const isDutch = this.isDutchContent(post, keywords)

        // T030: Log rejection reasons
        if (!isRelevant) {
          rejectionStats.notRelevant++
          return false
        }
        if (!meetsQuality) {
          rejectionStats.lowQuality++
          return false
        }
        if (!meetsUpvoteRatio) {
          rejectionStats.lowUpvoteRatio++
          return false
        }
        if (!isDutch) {
          rejectionStats.notDutch++
          return false
        }

        return true
      })

      rejectionStats.total = posts.length - relevantPosts.length

      console.log(`[RedditAdapter] ${relevantPosts.length} posts passed filtering`)
      console.log(`[RedditAdapter] Rejection breakdown: notRelevant=${rejectionStats.notRelevant}, lowQuality=${rejectionStats.lowQuality}, lowUpvoteRatio=${rejectionStats.lowUpvoteRatio}, notDutch=${rejectionStats.notDutch}`)

      // Convert posts to articles
      const articles: Article[] = []
      for (const post of relevantPosts) {
        try {
          // Fetch comments if enabled
          const comments = redditConfig.includeComments
            ? await this.fetchTopComments(post.data.id, subreddit, redditConfig.topCommentsCount)
            : []

          // Map to Article interface
          const article = await this.mapToArticle(post, config, comments)
          articles.push(article)
        } catch (error) {
          console.error('[RedditAdapter] Error processing post:', error)
          // Continue with other posts
        }
      }

      // Update state
      this.state.lastFetchTime = new Date()
      this.state.isHealthy = true
      this.state.errorCount = 0

      const duration = Date.now() - startTime
      console.log(`[RedditAdapter] Collected ${articles.length} articles in ${duration}ms`)

      return articles
    } catch (error: any) {
      this.state.isHealthy = false
      this.state.errorCount++

      // T016: Handle different error types
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('404')) {
        console.error(`[RedditAdapter] Permanent failure:`, error.message)
        throw error // Permanent failure
      }

      console.error('[RedditAdapter] Error fetching articles:', error)
      throw error
    }
  }

  /**
   * T016: Exponential backoff retry for transient errors
   */
  private async fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    const delays = [1000, 2000, 4000] // 1s, 2s, 4s

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error: any) {
        const isPermanent = error.message?.includes('403') || error.message?.includes('404')
        const isLastRetry = i === maxRetries - 1

        if (isPermanent || isLastRetry) {
          throw error
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delays[i]))
        console.log(`[RedditAdapter] Retrying after ${delays[i]}ms...`)
      }
    }

    throw new Error('[RedditAdapter] Max retries exceeded')
  }

  /**
   * T017: Get adapter state for monitoring
   */
  getAdapterState(): AdapterState {
    return { ...this.state }
  }

  /**
   * T012-T013: Normalize Reddit post content (text posts and link posts)
   */
  private async normalizeContent(post: RedditPost, comments: RedditComment[], maxLength?: number): Promise<string> {
    let content = ''

    // Handle different post types
    if (post.data.is_self && post.data.selftext) {
      // T012: Text post - use selftext as primary content
      content = post.data.selftext
    } else {
      // T013: Link post or media post - use title
      content = post.data.title
      if (post.data.url && !post.data.url.includes('reddit.com')) {
        content += '\n\n[External link]'
      }
    }

    // Add comments if available
    if (comments.length > 0) {
      content += '\n\n--- Comments ---\n'
      content += comments.map((comment) => comment.data.body).join('\n\n')
    }

    // T028: Truncate content to max length (default 2000 chars, consistent with RSS)
    const truncateAt = maxLength ?? 2000
    if (content.length > truncateAt) {
      content = content.substring(0, truncateAt) + '...'
    }

    return content
  }

  /**
   * T014: Map Reddit post to Article interface
   */
  private async mapToArticle(post: RedditPost, config: SourceConfiguration, comments: RedditComment[]): Promise<Article> {
    // T028: Use configured max content length or default 2000
    const maxContentLength = config.redditConfig?.maxContentLength ?? 2000
    const content = await this.normalizeContent(post, comments, maxContentLength)

    // Create deduplication hash
    const normalizedText = `${post.data.title} ${content}`.toLowerCase().trim()
    const deduplicationHash = createHash('sha256').update(normalizedText).digest('hex')

    const article: Article = {
      title: post.data.title,
      description: post.data.selftext?.substring(0, 200) || post.data.title,
      content,
      link: `https://reddit.com${post.data.permalink}`,
      pubDate: new Date(post.data.created_utc * 1000).toISOString(),
      sourceId: config.id,
      deduplicationHash,
      authorHandle: post.data.author ? `u/${post.data.author}` : undefined,
      postUrl: `https://reddit.com${post.data.permalink}`,
      engagementMetrics: {
        likes: post.data.score || 0,
        comments: post.data.num_comments || 0,
        shares: post.data.upvote_ratio ? Math.round((post.data.score || 0) * (post.data.upvote_ratio || 0)) : undefined,
        upvoteRatio: post.data.upvote_ratio || undefined, // T020: Store raw upvote ratio
      },
    }

    return article
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
