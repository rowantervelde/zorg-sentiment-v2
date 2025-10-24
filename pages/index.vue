<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div class="container mx-auto px-4 py-8 md:py-16">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Zorg Sentiment Dashboard
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Hoe voelt Nederland zich over zorgverzekeringen?
        </p>
      </header>

      <!-- Loading State -->
      <div v-if="pending" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          Gegevens laden...
        </p>
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="red"
        variant="solid"
        class="max-w-2xl mx-auto"
        title="Fout bij laden"
        :description="error.message"
      />

      <!-- No Data State -->
      <div v-else-if="!hasData" class="text-center py-16">
        <div class="text-6xl mb-4">📊</div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Nog geen gegevens beschikbaar
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          We verzamelen momenteel sentimentgegevens over zorgverzekeringen. 
          Kom binnenkort terug om de eerste resultaten te zien!
        </p>
        <UButton @click="refresh" color="blue">
          Opnieuw proberen
        </UButton>
      </div>

      <!-- Data Display -->
      <div v-else class="space-y-8">
        <!-- Mood Indicator -->
        <MoodIndicator
          :mood="data!.current.moodClassification"
          :summary="data!.current.summary"
          :breakdown="data!.current.breakdown"
        />

        <!-- Timestamp -->
        <DataTimestamp
          :timestamp="data!.current.timestamp"
          :is-stale="isStale"
          :data-age="dataAge"
        />

        <!-- Metadata -->
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Gebaseerd op {{ data!.current.articlesAnalyzed }} 
            {{ data!.current.articlesAnalyzed === 1 ? 'artikel' : 'artikelen' }} 
            van {{ data!.current.source }}
          </p>
        </div>

        <!-- Refresh Button -->
        <div class="text-center">
          <UButton 
            @click="refresh" 
            color="gray" 
            variant="soft"
            :disabled="pending"
          >
            <template #leading>
              <span :class="{ 'animate-spin': pending }">🔄</span>
            </template>
            Vernieuwen
          </UButton>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          MVP Sentiment Dashboard - Gegevens worden elk uur bijgewerkt
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending, error, hasData, isStale, dataAge, fetchSentiment, refresh } = useSentiment();

// Fetch data on mount
onMounted(() => {
  fetchSentiment("all");
});

// Set up auto-refresh every 5 minutes
const refreshInterval = 5 * 60 * 1000; // 5 minutes
let intervalId: NodeJS.Timeout;

onMounted(() => {
  intervalId = setInterval(() => {
    refresh();
  }, refreshInterval);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
