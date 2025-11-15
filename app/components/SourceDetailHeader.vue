<template>
  <div class="source-detail-header">
    <UCard>
      <div class="header-content">
        <!-- Source Name and Type -->
        <div class="source-info">
          <h1 class="source-name">{{ source.sourceName }}</h1>
          <span class="source-type-badge" :class="`type-${source.sourceType}`">
            {{ sourceTypeLabel }}
          </span>
        </div>

        <!-- Article Counts -->
        <div class="article-stats">
          <div class="stat-item">
            <span class="stat-label">Artikelen</span>
            <span class="stat-value">{{ source.articlesCollected }}</span>
          </div>
          <div v-if="articlePercentage" class="stat-item">
            <span class="stat-label">Percentage van totaal</span>
            <span class="stat-value">{{ articlePercentage.toFixed(1) }}%</span>
          </div>
        </div>

        <!-- Sentiment Breakdown -->
        <div class="sentiment-breakdown">
          <h2 class="breakdown-title">Sentimentverdeling</h2>
          <div class="breakdown-bars">
            <div class="breakdown-bar">
              <div class="bar-label">
                <span class="label-text">Positief</span>
                <span class="label-value">{{ source.sentimentBreakdown.positive }}%</span>
              </div>
              <div class="bar-track">
                <div 
                  class="bar-fill bar-positive"
                  :style="{ width: `${source.sentimentBreakdown.positive}%` }"
                ></div>
              </div>
            </div>
            <div class="breakdown-bar">
              <div class="bar-label">
                <span class="label-text">Neutraal</span>
                <span class="label-value">{{ source.sentimentBreakdown.neutral }}%</span>
              </div>
              <div class="bar-track">
                <div 
                  class="bar-fill bar-neutral"
                  :style="{ width: `${source.sentimentBreakdown.neutral}%` }"
                ></div>
              </div>
            </div>
            <div class="breakdown-bar">
              <div class="bar-label">
                <span class="label-text">Negatief</span>
                <span class="label-value">{{ source.sentimentBreakdown.negative }}%</span>
              </div>
              <div class="bar-track">
                <div 
                  class="bar-fill bar-negative"
                  :style="{ width: `${source.sentimentBreakdown.negative}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timestamp -->
        <div class="timestamp-section">
          <DataTimestamp 
            :timestamp="timestamp || source.fetchedAt"
            :is-stale="isStale"
          />
        </div>

        <!-- Fetch Status -->
        <div v-if="source.status !== 'success'" class="status-indicator">
          <div :class="`status-badge status-${source.status}`">
            {{ statusLabel }}
          </div>
          <p v-if="source.error" class="status-error">{{ source.error }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { SourceContribution } from '~/types/sentiment';

interface Props {
  source: SourceContribution & {
    articlePercentage?: number;
  };
  timestamp?: string;
}

const props = defineProps<Props>();

// Compute source type label
const sourceTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    rss: 'RSS Feed',
    social: 'Social Media',
    reddit: 'Reddit',
    other: 'Andere',
  };
  return labels[props.source.sourceType] || props.source.sourceType;
});

// Compute status label
const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    success: 'Succesvol',
    failed: 'Mislukt',
    partial: 'Gedeeltelijk',
  };
  return labels[props.source.status] || props.source.status;
});

// Article percentage (from extended source data)
const articlePercentage = computed(() => {
  return props.source.articlePercentage || 0;
});

// Check if data is stale (>24 hours old)
const isStale = computed(() => {
  const fetchTime = new Date(props.source.fetchedAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - fetchTime.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 24;
});
</script>

<style scoped>
.source-detail-header {
  width: 100%;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Source Info */
.source-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.source-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.source-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
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

/* Article Stats */
.article-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

/* Sentiment Breakdown */
.breakdown-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.breakdown-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.label-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.bar-track {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.bar-positive {
  background-color: #10b981;
}

.bar-neutral {
  background-color: #6b7280;
}

.bar-negative {
  background-color: #ef4444;
}

/* Timestamp Section */
.timestamp-section {
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Status Indicator */
.status-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #fef2f2;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.status-success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-failed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-partial {
  background-color: #fef3c7;
  color: #92400e;
}

.status-error {
  font-size: 0.875rem;
  color: #991b1b;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 767px) {
  .source-name {
    font-size: 1.5rem;
  }

  .article-stats {
    gap: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}

@media (min-width: 768px) {
  .source-info {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
}
</style>
