/**
 * Article deduplication utility using Levenshtein distance
 * Detects duplicate articles across different sources (80% similarity threshold)
 */

import { string as wnlpString } from 'wink-nlp-utils'
import type { Article } from '../types/article'

const SIMILARITY_THRESHOLD = 0.8 // 80% similarity

/**
 * Calculate similarity between two text strings using Levenshtein distance
 * @param text1 First text string
 * @param text2 Second text string
 * @returns Similarity ratio (0-1), where 1 is identical
 */
export function titleContentSimilarity(text1: string, text2: string): number {
  // Normalize: lowercase and trim
  const normalized1 = text1.toLowerCase().trim()
  const normalized2 = text2.toLowerCase().trim()
  
  // Use wink-nlp-utils string similarity (Levenshtein-based)
  // Returns a value between 0 and 1
  return wnlpString.similarity(normalized1, normalized2)
}

/**
 * Check if an article is a duplicate of any article in the existing list
 * @param article Article to check
 * @param existingArticles Array of existing articles to compare against
 * @returns true if article is a duplicate (>= 80% similar to any existing article)
 */
export function isDuplicate(article: Article, existingArticles: Article[]): boolean {
  // Combine title and description for comparison
  const articleText = `${article.title} ${article.description}`
  
  for (const existing of existingArticles) {
    const existingText = `${existing.title} ${existing.description}`
    const similarity = titleContentSimilarity(articleText, existingText)
    
    if (similarity >= SIMILARITY_THRESHOLD) {
      return true
    }
  }
  
  return false
}
