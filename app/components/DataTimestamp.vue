<template>
  <div class="data-timestamp">
    <!-- Last Updated Time -->
    <div class="timestamp-display" :aria-live="isStale ? 'polite' : 'off'">
      <span class="timestamp-label">Laatst bijgewerkt:</span>
      <span class="timestamp-value">{{ formattedTime }}</span>
    </div>

    <!-- Stale Data Warning (FR-008a: >24 hours) -->
    <div v-if="isStale" class="stale-warning" role="alert">
      <span class="warning-icon" aria-hidden="true">⚠️</span>
      <span class="warning-text">{{ staleWarning }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  timestamp: string; // ISO 8601 format
  isStale: boolean;
}

const props = defineProps<Props>();

/**
 * Format timestamp to Dutch relative time
 * Based on formatTimestamp from moodSummary.ts
 */
const formattedTime = computed(() => {
  const date = new Date(props.timestamp);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) {
    return 'Zojuist';
  }
  
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minuut' : 'minuten'} geleden`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'uur' : 'uren'} geleden`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
  }
  
  // Format as date for older data
  return date.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

/**
 * Generate stale data warning message
 * Based on getStaleDataWarning from moodSummary.ts
 */
const staleWarning = computed(() => {
  if (!props.isStale) return '';

  const date = new Date(props.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const hoursOld = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (hoursOld < 24) {
    return '';
  }
  
  const daysOld = Math.floor(hoursOld / 24);
  
  if (daysOld === 1) {
    return 'Data is meer dan 1 dag oud';
  }
  
  return `Data is ${daysOld} dagen oud`;
});
</script>

<style scoped>
.data-timestamp {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
}

/* Timestamp Display */
.timestamp-display {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280; /* gray-500 */
}

.timestamp-label {
  font-weight: 500;
}

.timestamp-value {
  font-weight: 400;
  opacity: 0.9;
}

/* Stale Warning (FR-008a: prominent when >24 hours) */
.stale-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #fef3c7; /* yellow-100 */
  border: 1px solid #fbbf24; /* yellow-400 */
  border-radius: 0.5rem;
  color: #92400e; /* yellow-900 */
  font-size: 0.875rem;
  font-weight: 500;
  max-width: 400px;
}

.warning-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.warning-text {
  line-height: 1.4;
}

/* Responsive Design (RD-001: mobile <768px) */
@media (max-width: 767px) {
  .data-timestamp {
    padding: 0.75rem 0.5rem;
  }

  .timestamp-display {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }

  .stale-warning {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    max-width: 100%;
  }

  .warning-icon {
    font-size: 1.125rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .timestamp-display {
    color: #9ca3af; /* gray-400 */
  }

  .stale-warning {
    background-color: #451a03; /* yellow-950 */
    border-color: #92400e; /* yellow-900 */
    color: #fef3c7; /* yellow-100 */
  }
}
</style>
