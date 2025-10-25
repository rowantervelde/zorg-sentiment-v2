/**
 * RSS Feed Fetcher for NU.nl Gezondheid
 * Fetches and parses RSS feed into article objects
 */

export interface RSSArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string; // ISO 8601
  content: string; // Full text content for analysis
}

/**
 * Fetch and parse RSS feed from NU.nl Gezondheid
 * Enhanced with retry logic and rate limit handling per FR-008
 */
export async function fetchRSSFeed(
  feedUrl: string,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
  }
): Promise<RSSArticle[]> {
  const { maxRetries = 3, retryDelay = 1000, timeout = 10000 } = options || {};

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZorgSentimentBot/1.0)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * (attempt + 1);
        
        console.warn(`[rssFetcher] Rate limited (429). Retry after ${waitTime}ms`);
        lastError = new Error(`Rate limited: retry after ${waitTime}ms`);
        
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
      }

      // Handle server errors (5xx)
      if (response.status >= 500) {
        console.warn(`[rssFetcher] Server error (${response.status}). Attempt ${attempt + 1}/${maxRetries}`);
        lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
        
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }

      // Handle client errors (4xx except 429)
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
      }

      const xmlText = await response.text();
      const articles = parseRSSXML(xmlText);

      console.log(`[rssFetcher] Successfully fetched ${articles.length} articles`);
      return articles;
      
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`[rssFetcher] Request timeout after ${timeout}ms. Attempt ${attempt + 1}/${maxRetries}`);
      } else {
        console.error(`[rssFetcher] Error on attempt ${attempt + 1}/${maxRetries}:`, error);
      }

      // Retry with exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  // All retries failed
  console.error('[rssFetcher] All retry attempts failed. Graceful fallback: returning empty array');
  console.error('[rssFetcher] Last error:', lastError);
  
  // Graceful fallback per FR-008: return empty array instead of throwing
  return [];
}

/**
 * Parse RSS XML into article objects
 */
function parseRSSXML(xmlText: string): RSSArticle[] {
  const articles: RSSArticle[] = [];

  // Simple regex-based XML parsing for RSS items
  // Note: In production, consider using a proper XML parser library
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = xmlText.matchAll(itemRegex);

  for (const item of items) {
    const itemContent = item[1] || '';

    const title = extractTag(itemContent, 'title');
    const description = extractTag(itemContent, 'description');
    const link = extractTag(itemContent, 'link');
    const pubDate = extractTag(itemContent, 'pubDate');

    // Combine title and description for content analysis
    const content = `${title} ${description}`;

    if (title && description) {
      articles.push({
        title: decodeHTML(title),
        description: decodeHTML(description),
        link: decodeHTML(link || ''),
        pubDate: parsePubDate(pubDate || ''),
        content: decodeHTML(content),
      });
    }
  }

  return articles;
}

/**
 * Extract content from XML tag
 */
function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match?.[1]?.trim() || '';
}

/**
 * Parse RSS pubDate to ISO 8601
 */
function parsePubDate(pubDate: string): string {
  try {
    const date = new Date(pubDate);
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Decode HTML entities
 */
function decodeHTML(html: string): string {
  // Remove CDATA sections
  html = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

  // Decode common HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  return html.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

/**
 * Filter articles to limit count
 */
export function limitArticles(articles: RSSArticle[], limit: number): RSSArticle[] {
  return articles.slice(0, limit);
}

/**
 * Get article age in hours
 */
export function getArticleAgeHours(article: RSSArticle): number {
  const now = new Date();
  const articleDate = new Date(article.pubDate);
  return (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Filter recent articles (within specified hours)
 */
export function filterRecentArticles(articles: RSSArticle[], maxAgeHours: number): RSSArticle[] {
  return articles.filter((article) => getArticleAgeHours(article) <= maxAgeHours);
}
