<template>
  <UCard 
    class="source-card" 
    :class="{ 'source-card-clickable': true }"
    @click="navigateToDetail"
    role="button"
    :aria-label="`Bekijk details voor ${source.sourceName}`"
    tabindex="0"
    @keydown.enter="navigateToDetail"
    @keydown.space.prevent="navigateToDetail"
  >
    <div class="card-content">
      <!-- Header -->
      <div class="card-header">
        <div class="source-info">
          <h3 class="source-name">{{ source.sourceName }}</h3>
          <span class="source-type-badge" :class="`type-${source.sourceType}`">
            {{ sourceTypeLabel }}
          </span>
        </div>
        <div class="article-count">
          <span class="count-value">{{ source.articlesCollected }}</span>
          <span class="count-label">artikelen</span>
        </div>
      </div>

      <!-- Sentiment Mini-Breakdown -->
      <div v-if="sentimentBreakdown" class="sentiment-mini">
        <div class="mini-bar">
          <div 
            class="mini-segment mini-positive"
            :style="{ width: `${sentimentBreakdown.positive}%` }"
            :title="`${sentimentBreakdown.positive}% positief`"
          ></div>
          <div 
            class="mini-segment mini-neutral"
            :style="{ width: `${sentimentBreakdown.neutral}%` }"
            :title="`${sentimentBreakdown.neutral}% neutraal`"
          ></div>
          <div 
            class="mini-segment mini-negative"
            :style="{ width: `${sentimentBreakdown.negative}%` }"
            :title="`${sentimentBreakdown.negative}% negatief`"
          ></div>
        </div>
        <div class="mini-labels">
          <span class="mini-label positive">{{ sentimentBreakdown.positive }}%</span>
          <span class="mini-label neutral">{{ sentimentBreakdown.neutral }}%</span>
          <span class="mini-label negative">{{ sentimentBreakdown.negative }}%</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <span class="detail-link">Bekijk details →</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { SourceContribution } from '~/types/sentiment';

interface Props {
  source: SourceContribution;
  timestamp: string;
}

const props = defineProps<Props>();
const router = useRouter();

// Compute source type label
const sourceTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    rss: 'RSS',
    social: 'Social',
    reddit: 'Reddit',
    other: 'Andere',
  };
  return labels[props.source.sourceType] || props.source.sourceType;
});

// Sentiment breakdown with safe defaults
const sentimentBreakdown = computed(() => {
  return props.source.sentimentBreakdown || {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
});

// Navigate to detail page
function navigateToDetail() {
  // Save scroll position before navigation
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('dashboard-scroll-position', window.scrollY.toString());
  }

  // Navigate to detail page with query params
  router.push({
    path: '/sentiment/detail',
    query: {
      source: props.source.sourceId,
      timestamp: props.timestamp,
    },
  });
}
</script>

<style scoped>
.source-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.source-card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.source-card-clickable:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.source-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.source-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.3;
}

.source-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
}

.type-rss {
  background-color: #dbeafe;
  color: #1e40af;
}

.type-social,
.type-reddit {
  background-color: #fce7f3;
  color: #9f1239;
}

.type-other {
  background-color: #e5e7eb;
  color: #374151;
}

.article-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.count-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.count-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Sentiment Mini-Breakdown */
.sentiment-mini {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mini-bar {
  display: flex;
  height: 6px;
  border-radius: 9999px;
  overflow: hidden;
  background-color: #e5e7eb;
}

.mini-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.mini-positive {
  background-color: #10b981;
}

.mini-neutral {
  background-color: #6b7280;
}

.mini-negative {
  background-color: #ef4444;
}

.mini-labels {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.mini-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.mini-label.positive {
  color: #10b981;
}

.mini-label.neutral {
  color: #6b7280;
}

.mini-label.negative {
  color: #ef4444;
}

/* Footer */
.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.detail-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #10b981;
  transition: color 0.2s ease;
}

.source-card:hover .detail-link {
  color: #059669;
}

/* Responsive Design */
@media (max-width: 767px) {
  .source-name {
    font-size: 1rem;
  }

  .count-value {
    font-size: 1.25rem;
  }
}
</style>
