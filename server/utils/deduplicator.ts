/**
 * Article deduplication utility using Levenshtein distance
 * Detects duplicate articles across different sources (80% similarity threshold)
 */

import type { Article } from '../types/article'

const SIMILARITY_THRESHOLD = 0.8 // 80% similarity

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits required to transform one string into another
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  
  // Create a 2D array to store distances
  const matrix: number[][] = []
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }
  
  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }
  
  return matrix[len1][len2]
}

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
  
  // Handle edge cases
  if (normalized1 === normalized2) return 1.0
  if (normalized1.length === 0 || normalized2.length === 0) return 0.0
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalized1, normalized2)
  
  // Convert to similarity ratio: similarity = 1 - (distance / maxLength)
  const maxLength = Math.max(normalized1.length, normalized2.length)
  const similarity = 1 - (distance / maxLength)
  
  return Math.max(0, Math.min(1, similarity)) // Clamp between 0 and 1
}

/**
 * Check if an article is a duplicate of any article in the existing list
 * @param article Article to check
 * @param existingArticles Array of existing articles to compare against
 * @returns true if article is a duplicate (>= 80% similar to any existing article)
 */
export function isDuplicate(article: Article, existingArticles: Article[]): boolean {
  // Quick check: exact hash match (much faster than Levenshtein)
  for (const existing of existingArticles) {
    if (article.deduplicationHash === existing.deduplicationHash) {
      return true // Exact duplicate found via hash
    }
  }
  
  // Two-stage fuzzy matching for performance:
  // Stage 1: Compare titles only (short text, fast)
  // Stage 2: Only if titles are similar, compare full text
  
  for (const existing of existingArticles) {
    // Stage 1: Quick title check
    const titleSimilarity = titleContentSimilarity(article.title, existing.title)
    
    // If titles are very different (<50% similar), skip this article entirely
    if (titleSimilarity < 0.5) {
      continue
    }
    
    // If titles are very similar (>=80%), it's likely a duplicate
    if (titleSimilarity >= SIMILARITY_THRESHOLD) {
      return true
    }
    
    // Stage 2: Titles are somewhat similar (50-80%), check full text
    // Only combine title + description if needed
    const articleText = `${article.title} ${article.description}`
    const existingText = `${existing.title} ${existing.description}`
    
    // Skip if texts are vastly different in length (optimization)
    const lengthDiff = Math.abs(articleText.length - existingText.length)
    const maxLength = Math.max(articleText.length, existingText.length)
    if (lengthDiff / maxLength > 0.5) {
      continue // If length differs by >50%, skip expensive Levenshtein calculation
    }
    
    const fullSimilarity = titleContentSimilarity(articleText, existingText)
    
    if (fullSimilarity >= SIMILARITY_THRESHOLD) {
      return true
    }
  }
  
  return false
}
