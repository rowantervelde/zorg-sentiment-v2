/**
 * Composable for fetching sentiment data
 */

import type { SentimentResponse } from "~/types/api";

export function useSentiment() {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  // Reactive state
  const data = ref<SentimentResponse | null>(null);
  const pending = ref(false);
  const error = ref<Error | null>(null);

  // Fetch sentiment data
  async function fetchSentiment(include: "trend" | "summary" | "all" = "all") {
    pending.value = true;
    error.value = null;

    try {
      const response = await $fetch<SentimentResponse>(
        `${apiBase}/sentiment`,
        {
          query: { include },
        }
      );

      data.value = response;
      return response;
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error("Failed to fetch sentiment");
      console.error("Error fetching sentiment:", err);
      return null;
    } finally {
      pending.value = false;
    }
  }

  // Computed properties
  const hasData = computed(() => data.value !== null);
  const isStale = computed(() => data.value?.meta.isStale ?? false);
  const dataAge = computed(() => data.value?.meta.dataAge ?? 0);

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    hasData,
    isStale,
    dataAge,
    fetchSentiment,
    refresh: () => fetchSentiment("all"),
  };
}
