<template>
  <div class="data-timestamp">
    <!-- Last Updated Time -->
    <div class="timestamp-display" :aria-live="isStale ? 'polite' : 'off'">
      <span class="timestamp-label">Laatst bijgewerkt:</span>
      <span class="timestamp-value">{{ formattedTime }}</span>
    </div>

    <!-- Stale Data Warning (FR-008a: >24 hours) using Nuxt UI Alert -->
    <UAlert
      v-if="isStale"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="staleWarning"
      :description="staleDescription"
      :ui="{ root: 'max-w-md', icon: 'size-5' }"
    />
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

/**
 * Additional context for stale warning
 */
const staleDescription = computed(() => {
  if (!props.isStale) return '';
  return 'De weergegeven sentimentdata komt mogelijk niet overeen met de huidige situatie.';
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
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .timestamp-display {
    color: #9ca3af; /* gray-400 */
  }
}
</style>
