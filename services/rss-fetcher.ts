/**
 * RSS feed fetcher service
 */

interface RSSArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  content?: string;
}

export interface FetchResult {
  success: boolean;
  articles: RSSArticle[];
  error?: string;
  fetchedAt: string;
}

/**
 * Fetch and parse RSS feed
 */
export async function fetchRSSFeed(feedUrl: string): Promise<FetchResult> {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "ZorgSentiment/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const articles = parseRSS(xmlText);

    return {
      success: true,
      articles,
      fetchedAt,
    };
  } catch (error) {
    console.error("Failed to fetch RSS feed:", error);
    return {
      success: false,
      articles: [],
      error: error instanceof Error ? error.message : "Unknown error",
      fetchedAt,
    };
  }
}

/**
 * Parse RSS XML to extract articles
 */
function parseRSS(xmlText: string): RSSArticle[] {
  const articles: RSSArticle[] = [];

  // Simple XML parsing - in production, use a proper XML parser
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/;
  const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/;
  const linkRegex = /<link>(.*?)<\/link>/;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    const titleMatch = titleRegex.exec(itemXml);
    const descMatch = descRegex.exec(itemXml);
    const linkMatch = linkRegex.exec(itemXml);
    const pubDateMatch = pubDateRegex.exec(itemXml);

    if (titleMatch && descMatch) {
      articles.push({
        title: titleMatch[1],
        description: descMatch[1],
        link: linkMatch ? linkMatch[1] : "",
        pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
        content: descMatch[1], // Use description as content for sentiment analysis
      });
    }
  }

  return articles;
}

/**
 * Extract text content from articles for sentiment analysis
 */
export function extractTextForAnalysis(articles: RSSArticle[]): string[] {
  return articles.map((article) => {
    // Combine title and description for better context
    const text = `${article.title}. ${article.description || article.content || ""}`;
    // Remove HTML tags
    return text.replace(/<[^>]*>/g, " ").trim();
  });
}
