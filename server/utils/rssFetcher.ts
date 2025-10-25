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
 */
export async function fetchRSSFeed(feedUrl: string): Promise<RSSArticle[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZorgSentimentBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const articles = parseRSSXML(xmlText);

    return articles;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw error;
  }
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
