<template>
  <div class="detail-page-container">
    <!-- Back Navigation -->
    <div class="back-navigation">
      <button 
        @click="navigateBack" 
        class="back-button"
        aria-label="Terug naar dashboard"
      >
        ← Terug naar dashboard
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner" aria-label="Gegevens laden...">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">Brondetails laden...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="error-state" role="alert">
      <div class="error-icon" aria-hidden="true">❌</div>
      <h2 class="error-title">Er ging iets mis</h2>
      <p class="error-message">
        {{ errorMessage }}
      </p>
      <button 
        @click="retryLoad" 
        class="retry-button"
        aria-label="Opnieuw proberen"
      >
        Opnieuw proberen
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!sourceData" class="empty-state">
      <div class="empty-icon" aria-hidden="true">📊</div>
      <h2 class="empty-title">Geen artikelen gevonden</h2>
      <p class="empty-text">
        Deze bron heeft geen artikelen verzameld voor dit tijdstip.
      </p>
    </div>

    <!-- Content -->
    <div v-else class="detail-content">
      <!-- Source Header -->
      <SourceDetailHeader
        v-if="sourceData"
        :source="sourceData"
        :timestamp="timestamp"
      />

      <!-- Article List -->
      <ArticleList
        v-if="articles && articles.length > 0"
        :articles="articles"
        :source-type="sourceData.sourceType"
      />

      <!-- No Articles State -->
      <div v-else class="no-articles-state">
        <div class="no-articles-icon" aria-hidden="true">📄</div>
        <h3 class="no-articles-title">Geen artikelen gevonden</h3>
        <p class="no-articles-text">
          Deze bron heeft geen artikelen verzameld voor dit tijdstip.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SourceContribution, ArticleDetail } from '~/types/sentiment';
import type { ArticlesResponse } from '../../../server/api/sentiment/articles.get';

// Get route parameters
const route = useRoute();
const router = useRouter();

// Extract query parameters
const sourceId = computed(() => route.query.source as string);
const timestamp = computed(() => route.query.timestamp as string);

// State
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref('');
const sourceData = ref<SourceContribution | null>(null);
const articles = ref<ArticleDetail[]>([]);

// Fetch source data and articles
async function fetchSourceData() {
  if (!sourceId.value || !timestamp.value) {
    hasError.value = true;
    errorMessage.value = 'Ongeldige URL-parameters. Bron-ID en tijdstempel zijn vereist.';
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  hasError.value = false;

  try {
    // Fetch source contributions to get source metadata
    const sourcesResponse = await $fetch<any>('/api/sentiment/sources');
    
    // Find the specific source
    const source = sourcesResponse.sources?.find(
      (s: any) => s.sourceId === sourceId.value
    );

    if (!source) {
      sourceData.value = null;
      articles.value = [];
    } else {
      sourceData.value = source;

      // Fetch article-level details
      try {
        const articlesResponse = await $fetch<ArticlesResponse>('/api/sentiment/articles', {
          query: {
            source: sourceId.value,
            timestamp: timestamp.value,
          },
        });

        articles.value = articlesResponse.articles || [];
      } catch (articleError: any) {
        console.error('[Detail Page] Error fetching articles:', articleError);
        // Continue with empty articles array if article fetch fails
        articles.value = [];
      }
    }
  } catch (err: any) {
    console.error('[Detail Page] Error fetching source data:', err);
    hasError.value = true;
    errorMessage.value = 'Kon de brongegevens niet ophalen. Probeer het later opnieuw.';
  } finally {
    isLoading.value = false;
  }
}

// Navigate back to dashboard
function navigateBack() {
  // Use router.back() to preserve browser history
  router.back();
}

// Retry loading
function retryLoad() {
  fetchSourceData();
}

// Load data on mount
onMounted(() => {
  fetchSourceData();
});

// Set page meta
useHead({
  title: 'Brondetails - Zorg Sentiment',
  meta: [
    {
      name: 'description',
      content: 'Bekijk gedetailleerde sentimentanalyse voor een specifieke nieuwsbron.',
    },
  ],
});
</script>

<style scoped>
.detail-page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
  padding: 1rem;
}

/* Back Navigation */
.back-navigation {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f3f4f6;
  color: #111827;
  border-color: #9ca3af;
}

.back-button:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.loading-spinner {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.125rem;
  color: #6b7280;
  font-weight: 500;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.error-icon {
  font-size: 3rem;
  line-height: 1;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ef4444;
  margin: 0;
}

.error-message {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #059669;
}

.retry-button:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  line-height: 1;
}

.empty-title {
  font-size: 1.5rem;
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

.detail-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* No Articles State */
.no-articles-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
  background-color: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
}

.no-articles-icon {
  font-size: 3rem;
  line-height: 1;
}

.no-articles-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.no-articles-text {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 767px) {
  .detail-page-container {
    padding: 0.5rem;
  }

  .error-title,
  .empty-title {
    font-size: 1.25rem;
  }
}

@media (min-width: 768px) {
  .detail-page-container {
    padding: 2rem;
  }
}
</style>
