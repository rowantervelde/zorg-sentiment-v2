<template>
  <div class="article-sort-control">
    <label for="sort-select" class="sort-label">Sorteer op:</label>
    <select
      id="sort-select"
      v-model="selectedSort"
      class="sort-select"
      @change="handleSortChange"
      aria-label="Sorteer artikelen op"
    >
      <option value="contribution">Bijdrage (Hoogste eerst)</option>
      <option value="sentiment-high">Sentiment (Hoog naar Laag)</option>
      <option value="sentiment-low">Sentiment (Laag naar Hoog)</option>
      <option value="recency">Recente artikelen eerst</option>
      <option 
        v-if="showEngagementSort" 
        value="engagement"
      >
        Engagement (Upvotes + Reacties)
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { ArticleSortOption } from '~/types/sentiment';

interface Props {
  currentSort: ArticleSortOption;
  sourceType: string;
}

interface Emits {
  (e: 'sort-changed', sort: ArticleSortOption): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state synced with prop
const selectedSort = ref<ArticleSortOption>(props.currentSort);

// Watch for external changes
watch(() => props.currentSort, (newSort) => {
  selectedSort.value = newSort;
});

// Computed: Show engagement sort only for social sources
const showEngagementSort = computed(() => {
  return props.sourceType === 'social' || props.sourceType === 'reddit';
});

// Methods
function handleSortChange() {
  emit('sort-changed', selectedSort.value);
}
</script>

<style scoped>
.article-sort-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.sort-select {
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.sort-select:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.sort-select:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
  border-color: #10b981;
}

.sort-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 767px) {
  .article-sort-control {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
  }

  .sort-select {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .sort-select {
    min-width: 250px;
  }
}
</style>
