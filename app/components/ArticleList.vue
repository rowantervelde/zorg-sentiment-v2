<template>
  <div class="article-list">
    <!-- Sort Control -->
    <div class="sort-control-container">
      <ArticleSortControl
        :current-sort="currentSort"
        :source-type="sourceType"
        @sort-changed="handleSortChange"
      />
    </div>

    <!-- Article Cards -->
    <div v-if="sortedArticles.length > 0" class="articles-container">
      <div
        v-for="article in sortedArticles"
        :key="article.id || article.link"
        class="article-card"
      >
        <!-- Article Header -->
        <div class="article-header">
          <a
            :href="article.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-title"
            @click="trackArticleClick(article)"
          >
            {{ article.title }}
          </a>
        </div>

        <!-- Article Metadata -->
        <div class="article-metadata">
          <span class="metadata-item">
            <span class="metadata-label">Datum:</span>
            <span class="metadata-value">{{ formatDate(article.pubDate) }}</span>
          </span>
          <span class="metadata-item">
            <span class="metadata-label">Score:</span>
            <span class="metadata-value" :class="getSentimentClass(article.rawSentimentScore)">
              {{ formatScore(article.rawSentimentScore) }}
            </span>
          </span>
          <span class="metadata-item">
            <span class="metadata-label">Bijdrage:</span>
            <span class="metadata-value">{{ formatPercentage(article.contributionPercentage) }}</span>
          </span>
          <span v-if="article.upvotes !== null && article.upvotes !== undefined" class="metadata-item">
            <span class="metadata-label">Upvotes:</span>
            <span class="metadata-value">{{ article.upvotes }}</span>
          </span>
          <span v-if="article.comments !== null && article.comments !== undefined" class="metadata-item">
            <span class="metadata-label">Reacties:</span>
            <span class="metadata-value">{{ article.comments }}</span>
          </span>
        </div>

        <!-- Article Excerpt -->
        <p v-if="article.excerpt" class="article-excerpt">{{ article.excerpt }}</p>

        <!-- Sentiment Indicator -->
        <MoodIndicator
          :mood="getMoodFromScore(article.rawSentimentScore)"
          size="small"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon" aria-hidden="true">📄</div>
      <h3 class="empty-title">Geen artikelen gevonden</h3>
      <p class="empty-text">
        Deze bron heeft geen artikelen voor dit tijdstip.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArticleDetail, ArticleSortOption } from '~/types/sentiment';

interface Props {
  articles: ArticleDetail[];
  sourceType: string;
}

const props = defineProps<Props>();

// State
const currentSort = ref<ArticleSortOption>('contribution');

// Computed: Sorted articles
const sortedArticles = computed(() => {
  const articles = [...props.articles];

  switch (currentSort.value) {
    case 'contribution':
      return articles.sort((a, b) => b.contributionPercentage - a.contributionPercentage);
    
    case 'sentiment-high':
      return articles.sort((a, b) => b.rawSentimentScore - a.rawSentimentScore);
    
    case 'sentiment-low':
      return articles.sort((a, b) => a.rawSentimentScore - b.rawSentimentScore);
    
    case 'recency':
      return articles.sort((a, b) => {
        // Handle missing dates - put them at the end
        if (!a.pubDate && !b.pubDate) return 0;
        if (!a.pubDate) return 1;
        if (!b.pubDate) return -1;
        
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      });
    
    case 'engagement':
      return articles.sort((a, b) => {
        const aEngagement = (a.upvotes || 0) + (a.comments || 0);
        const bEngagement = (b.upvotes || 0) + (b.comments || 0);
        return bEngagement - aEngagement;
      });
    
    default:
      return articles;
  }
});

// Methods
function handleSortChange(newSort: ArticleSortOption) {
  currentSort.value = newSort;
}

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return 'Onbekende datum';
  }

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    return 'Ongeldige datum';
  }
}

function formatScore(score: number): string {
  return score.toFixed(2);
}

function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

function getSentimentClass(score: number): string {
  if (score > 0.2) return 'sentiment-positive';
  if (score < -0.2) return 'sentiment-negative';
  return 'sentiment-neutral';
}

function getMoodFromScore(score: number): 'positive' | 'negative' | 'neutral' | 'mixed' {
  if (score > 0.3) return 'positive';
  if (score < -0.3) return 'negative';
  if (Math.abs(score) < 0.1) return 'neutral';
  return 'mixed';
}

function trackArticleClick(article: ArticleDetail) {
  console.log('[ArticleList] Article clicked:', article.title);
  // FR-006: Article link opens in new tab (handled by target="_blank")
  // SC-007: Link opens within 500ms (native browser behavior)
}
</script>

<style scoped>
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Sort Control Container */
.sort-control-container {
  display: flex;
  justify-content: flex-end;
  padding: 0 0 1rem 0;
}

/* Articles Container */
.articles-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Article Card */
.article-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Article Header */
.article-header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.article-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  flex: 1;
  line-height: 1.4;
  transition: color 0.2s ease;
}

.article-title:hover {
  color: #10b981;
  text-decoration: underline;
}

.article-title:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
  border-radius: 0.25rem;
}

/* Article Metadata */
.article-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
}

.metadata-item {
  display: flex;
  gap: 0.25rem;
  align-items: baseline;
}

.metadata-label {
  color: #6b7280;
  font-weight: 500;
}

.metadata-value {
  color: #111827;
  font-weight: 600;
}

.sentiment-positive {
  color: #10b981;
}

.sentiment-negative {
  color: #ef4444;
}

.sentiment-neutral {
  color: #6b7280;
}

/* Article Excerpt */
.article-excerpt {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  line-height: 1;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.empty-text {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 767px) {
  .article-card {
    padding: 1rem;
  }

  .article-title {
    font-size: 1rem;
  }

  .article-metadata {
    flex-direction: column;
    gap: 0.5rem;
  }

  .metadata-item {
    justify-content: space-between;
  }
}

@media (min-width: 768px) {
  .article-list {
    gap: 2rem;
  }
}
</style>
