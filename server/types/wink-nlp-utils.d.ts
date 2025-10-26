declare module 'wink-nlp-utils' {
  export const string: {
    /**
     * Calculate similarity between two strings using Levenshtein distance
     * Returns a value between 0 and 1, where 1 means identical
     */
    similarity(str1: string, str2: string): number
  }
}
