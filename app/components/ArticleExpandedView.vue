<template>
  <div class="expanded-view" role="region" :aria-label="`Gedetailleerde analyse van ${article.title}`">
    <!-- Article Excerpt with Word Highlights -->
    <div class="section">
      <h4 class="section-title">Artikeltekst met sentiment highlights</h4>
      <div 
        v-if="hasExcerpt" 
        class="highlighted-excerpt"
        role="article"
      >
        <span v-html="highlightedExcerpt"></span>
        <a 
          v-if="isTruncated"
          :href="article.link"
          target="_blank"
          rel="noopener noreferrer"
          class="read-more-link"
        >
          Lees volledig artikel bij de bron →
        </a>
      </div>
      <p v-else class="no-excerpt">
        Geen tekstfragment beschikbaar. 
        <a 
          :href="article.link"
          target="_blank"
          rel="noopener noreferrer"
          class="external-link"
        >
          Lees het volledige artikel →
        </a>
      </p>
    </div>

    <!-- Word Analysis -->
    <div class="section">
      <h4 class="section-title">Geïdentificeerde woorden</h4>
      <div class="word-analysis">
        <div class="word-category">
          <div class="category-header positive">
            <span class="category-icon" aria-hidden="true">✓</span>
            <span class="category-label">Positieve woorden</span>
            <span class="category-count">({{ positiveWordsCount }})</span>
          </div>
          <div v-if="hasPositiveWords" class="word-list">
            <span
              v-for="(word, index) in article.positiveWords"
              :key="`pos-${index}`"
              class="word-badge positive"
            >
              {{ word }}
            </span>
          </div>
          <p v-else class="no-words">Geen positieve woorden geïdentificeerd</p>
        </div>

        <div class="word-category">
          <div class="category-header negative">
            <span class="category-icon" aria-hidden="true">✗</span>
            <span class="category-label">Negatieve woorden</span>
            <span class="category-count">({{ negativeWordsCount }})</span>
          </div>
          <div v-if="hasNegativeWords" class="word-list">
            <span
              v-for="(word, index) in article.negativeWords"
              :key="`neg-${index}`"
              class="word-badge negative"
            >
              {{ word }}
            </span>
          </div>
          <p v-else class="no-words">Geen negatieve woorden geïdentificeerd</p>
        </div>
      </div>
    </div>

    <!-- Sentiment Calculation Breakdown (Task 3.4) -->
    <div class="section">
      <h4 class="section-title">Berekeningsdetails</h4>
      <div class="calculation-breakdown">
        <div class="calculation-step">
          <span class="step-label">Ruwe sentiment score:</span>
          <span class="step-value" :class="getSentimentClass(article.rawSentimentScore)">
            {{ formatScore(article.rawSentimentScore) }}
          </span>
        </div>
        <div class="calculation-operator">×</div>
        <div class="calculation-step">
          <span class="step-label">
            Recency gewicht:
            <span class="help-icon" title="Nieuwere artikelen krijgen meer gewicht">ⓘ</span>
          </span>
          <span class="step-value">{{ formatWeight(article.recencyWeight) }}</span>
        </div>
        <div class="calculation-operator">×</div>
        <div class="calculation-step">
          <span class="step-label">
            Bron gewicht:
            <span class="help-icon" title="Gewicht van de nieuwsbron">ⓘ</span>
          </span>
          <span class="step-value">{{ formatWeight(article.sourceWeight) }}</span>
        </div>
        <div class="calculation-operator">=</div>
        <div class="calculation-step final">
          <span class="step-label">Gewogen score:</span>
          <span class="step-value final" :class="getSentimentClass(article.finalWeightedScore)">
            {{ formatScore(article.finalWeightedScore) }}
          </span>
        </div>
        <div class="calculation-step contribution">
          <span class="step-label">Bijdrage aan totaal:</span>
          <span class="step-value">{{ formatPercentage(article.contributionPercentage) }}</span>
        </div>
      </div>
    </div>

    <!-- Screen Reader Summary -->
    <div class="sr-only" role="status" aria-live="polite">
      Dit artikel heeft een {{ getMoodLabel(article.rawSentimentScore) }} sentiment
      met {{ positiveWordsCount }} positieve woorden en {{ negativeWordsCount }} negatieve woorden.
      De gewogen score is {{ formatScore(article.finalWeightedScore) }} 
      en draagt {{ formatPercentage(article.contributionPercentage) }} bij aan het totale sentiment.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArticleDetail } from '~/types/sentiment';

interface Props {
  article: ArticleDetail;
}

const props = defineProps<Props>();

// Constants
const MAX_EXCERPT_LENGTH = 2000;

// Computed properties
const hasExcerpt = computed(() => {
  return props.article.excerpt && props.article.excerpt.trim().length > 0;
});

const isTruncated = computed(() => {
  if (!hasExcerpt.value) return false;
  const contentLength = props.article.contentLength || props.article.excerpt.length;
  return contentLength > MAX_EXCERPT_LENGTH;
});

const truncatedExcerpt = computed(() => {
  if (!hasExcerpt.value) return '';
  
  const excerpt = props.article.excerpt;
  if (excerpt.length <= MAX_EXCERPT_LENGTH) {
    return excerpt;
  }
  
  // Truncate to 200 chars for display
  return excerpt.substring(0, 200) + '...';
});

const positiveWordsCount = computed(() => props.article.positiveWords?.length || 0);
const negativeWordsCount = computed(() => props.article.negativeWords?.length || 0);
const hasPositiveWords = computed(() => positiveWordsCount.value > 0);
const hasNegativeWords = computed(() => negativeWordsCount.value > 0);

// Task 3.3: Word highlighting with accessibility
const highlightedExcerpt = computed(() => {
  if (!hasExcerpt.value) return '';
  
  let text = truncatedExcerpt.value;
  const positiveWords = props.article.positiveWords || [];
  const negativeWords = props.article.negativeWords || [];
  
  // Create a map of word positions to avoid overlapping highlights
  const highlights: Array<{ start: number; end: number; type: 'positive' | 'negative'; word: string }> = [];
  
  // Find positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'positive',
        word: match[0],
      });
    }
  });
  
  // Find negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      // Check for overlap with existing highlights
      const hasOverlap = highlights.some(h => 
        (match.index >= h.start && match.index < h.end) ||
        (match.index + match[0].length > h.start && match.index + match[0].length <= h.end)
      );
      
      if (!hasOverlap) {
        highlights.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'negative',
          word: match[0],
        });
      }
    }
  });
  
  // Sort highlights by position
  highlights.sort((a, b) => a.start - b.start);
  
  // Build highlighted text
  let result = '';
  let lastIndex = 0;
  
  highlights.forEach(highlight => {
    // Add text before highlight
    result += escapeHtml(text.substring(lastIndex, highlight.start));
    
    // Add highlighted word with accessibility features
    const icon = highlight.type === 'positive' ? '✓' : '✗';
    const className = highlight.type === 'positive' ? 'highlight-positive' : 'highlight-negative';
    const ariaLabel = highlight.type === 'positive' ? 'positief woord' : 'negatief woord';
    
    result += `<mark class="${className}" aria-label="${ariaLabel}: ${escapeHtml(highlight.word)}">` +
              `<span class="highlight-icon" aria-hidden="true">${icon}</span>` +
              escapeHtml(highlight.word) +
              `</mark>`;
    
    lastIndex = highlight.end;
  });
  
  // Add remaining text
  result += escapeHtml(text.substring(lastIndex));
  
  return result;
});

// Helper functions
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatScore(score: number): string {
  return score.toFixed(2);
}

function formatWeight(weight: number): string {
  return weight.toFixed(2);
}

function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

function getSentimentClass(score: number): string {
  if (score > 0.2) return 'sentiment-positive';
  if (score < -0.2) return 'sentiment-negative';
  return 'sentiment-neutral';
}

function getMoodLabel(score: number): string {
  if (score > 0.3) return 'positief';
  if (score < -0.3) return 'negatief';
  if (Math.abs(score) < 0.1) return 'neutraal';
  return 'gemengd';
}
</script>

<style scoped>
.expanded-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  margin-top: 1rem;
}

/* Section Styles */
.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* Highlighted Excerpt */
.highlighted-excerpt {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #374151;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
}

.no-excerpt {
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

.read-more-link,
.external-link {
  display: inline-block;
  margin-top: 0.75rem;
  color: #10b981;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.875rem;
}

.read-more-link:hover,
.external-link:hover {
  text-decoration: underline;
}

/* Word Highlighting with Accessibility (Task 3.3) */
.highlighted-excerpt :deep(mark) {
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}

.highlighted-excerpt :deep(.highlight-positive) {
  background-color: #d1fae5;
  color: #065f46;
  border-bottom: 2px solid #10b981;
  text-decoration-color: #10b981;
}

.highlighted-excerpt :deep(.highlight-negative) {
  background-color: #fee2e2;
  color: #991b1b;
  border-bottom: 2px solid #ef4444;
  text-decoration-color: #ef4444;
}

.highlighted-excerpt :deep(.highlight-icon) {
  margin-right: 0.125rem;
  font-size: 0.75rem;
}

/* Word Analysis */
.word-analysis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.word-category {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.category-header.positive {
  color: #065f46;
}

.category-header.negative {
  color: #991b1b;
}

.category-icon {
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
}

.category-count {
  color: #6b7280;
  font-weight: 400;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.word-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.word-badge.positive {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.word-badge.negative {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.no-words {
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

/* Calculation Breakdown (Task 3.4) */
.calculation-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
}

.calculation-step {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.calculation-step.final {
  background-color: #e0f2fe;
  border: 1px solid #0ea5e9;
  font-weight: 600;
}

.calculation-step.contribution {
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  font-weight: 600;
}

.step-label {
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.step-value {
  font-weight: 600;
  color: #111827;
}

.step-value.final {
  font-size: 1rem;
}

.step-value.sentiment-positive {
  color: #10b981;
}

.step-value.sentiment-negative {
  color: #ef4444;
}

.step-value.sentiment-neutral {
  color: #6b7280;
}

.calculation-operator {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #9ca3af;
  padding: 0.25rem 0;
}

.help-icon {
  cursor: help;
  color: #6b7280;
  font-size: 0.75rem;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive Design */
@media (max-width: 767px) {
  .expanded-view {
    padding: 1rem;
  }

  .calculation-breakdown {
    font-size: 0.8125rem;
  }

  .calculation-step {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

@media (min-width: 768px) {
  .word-analysis {
    flex-direction: row;
  }

  .word-category {
    flex: 1;
  }
}
</style>
