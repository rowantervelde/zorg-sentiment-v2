<template>
  <div class="dashboard-container">
    <!-- Page Header -->
    <header class="dashboard-header">
      <h1 class="dashboard-title">Zorg Sentiment</h1>
      <p class="dashboard-subtitle">
        Hoe voelt Nederland zich over zorgverzekeringen?
      </p>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Loading State (T029) -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner" aria-label="Gegevens laden...">
          <div class="spinner"></div>
        </div>
        <p class="loading-text">Gegevens laden...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="error-state" role="alert">
        <div class="error-icon" aria-hidden="true">❌</div>
        <h2 class="error-title">Er ging iets mis</h2>
        <p class="error-message">
          We konden de sentimentgegevens niet ophalen. Probeer het later opnieuw.
        </p>
        <button 
          @click="refreshData" 
          class="retry-button"
          aria-label="Opnieuw proberen"
        >
          Opnieuw proberen
        </button>
      </div>

      <!-- No Data State (T030) -->
      <div v-else-if="!hasData" class="no-data-state">
        <div class="no-data-icon" aria-hidden="true">📊</div>
        <h2 class="no-data-title">{{ noDataMessage }}</h2>
        <p class="no-data-text">
          We verzamelen elk uur nieuwe gegevens van Nederlandse nieuwsbronnen.
        </p>
      </div>

      <!-- Data Display (User Story 1) -->
      <div v-else class="data-display">
        <!-- Mood Indicator (User Story 1 - FR-001) -->
        <UCard class="mood-card">
          <MoodIndicator
            :mood="state.current!.moodClassification"
            :breakdown="state.current!.breakdown"
            :summary="state.current!.summary"
            :show-breakdown="true"
          />
        </UCard>

        <!-- Data Timestamp (FR-009) -->
        <DataTimestamp
          v-if="state.current"
          :timestamp="state.current.timestamp"
          :is-stale="state.isStale"
        />

        <!-- Trend Chart (User Story 2 - T039) -->
        <TrendChart
          v-if="state.trend"
          :trend="state.trend"
          class="trend-section"
        />

        <!-- Data Source Info -->
        <div class="data-source">
          <p class="source-text">
            Gebaseerd op {{ state.current!.articlesAnalyzed }} artikelen van Nederlandse nieuwsbronnen
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <p class="footer-text">
        Data wordt elk uur verzameld van openbare Nederlandse nieuwsbronnen
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Use sentiment composable (T028, T037)
const { state, hasData, isLoading, hasError, fetchWithTrend } = useSentiment();

// No data message (T030)
const noDataMessage = 'We verzamelen nog gegevens over de stemming. Check straks terug!';

// Refresh function that fetches with trend data
const refreshData = async () => {
  await fetchWithTrend();
};

// Fetch data on mount - now includes trend data (T037)
onMounted(async () => {
  await fetchWithTrend();
});

// Set page meta
useHead({
  title: 'Zorg Sentiment - Hoe voelt Nederland zich over zorgverzekeringen?',
  meta: [
    {
      name: 'description',
      content: 'Volg de Nederlandse stemming over zorgverzekeringen in real-time. Gebaseerd op sentiment analyse van nieuwsbronnen.',
    },
  ],
});
</script>

<style scoped>
/* Dashboard Container (VD-006: layout) */
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
}

/* Header */
.dashboard-header {
  text-align: center;
  padding: 3rem 1rem 2rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* Main Content */
.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

/* Loading State (T029) */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem 1rem;
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

/* No Data State (T030) */
.no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
}

.no-data-icon {
  font-size: 3rem;
  line-height: 1;
}

.no-data-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  max-width: 500px;
}

.no-data-text {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
}

/* Data Display */
.data-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.mood-card {
  width: 100%;
}

/* Trend Section (T039) */
.trend-section {
  width: 100%;
}

/* Data Source Info */
.data-source {
  text-align: center;
  padding: 1rem;
}

.source-text {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* Footer */
.dashboard-footer {
  padding: 2rem 1rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.footer-text {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* Responsive Design (RD-001: mobile <768px) */
@media (max-width: 767px) {
  .dashboard-header {
    padding: 2rem 1rem 1.5rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-subtitle {
    font-size: 1.125rem;
  }

  .dashboard-main {
    padding: 1.5rem 1rem;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
  }

  .spinner {
    width: 50px;
    height: 50px;
  }

  .error-title,
  .no-data-title {
    font-size: 1.25rem;
  }
}

/* Desktop (RD-002: ≥768px) */
@media (min-width: 768px) {
  .dashboard-header {
    padding: 4rem 2rem 3rem;
  }

  .dashboard-title {
    font-size: 3rem;
  }

  .dashboard-subtitle {
    font-size: 1.5rem;
  }

  .dashboard-main {
    padding: 3rem 2rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dashboard-container {
    background: linear-gradient(to bottom, #111827, #1f2937);
  }

  .dashboard-title {
    color: #f9fafb;
  }

  .dashboard-subtitle {
    color: #d1d5db;
  }

  .loading-text {
    color: #d1d5db;
  }

  .error-message,
  .no-data-text {
    color: #d1d5db;
  }

  .no-data-title {
    color: #f9fafb;
  }

  .source-text,
  .footer-text {
    color: #6b7280;
  }

  .dashboard-footer {
    border-top-color: #374151;
  }
}
</style>
