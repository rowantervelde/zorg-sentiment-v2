<template>
  <UCard class="mood-indicator-card">
    <div class="text-center">
      <!-- Mood Emoji -->
      <div class="mood-emoji text-8xl mb-4" :aria-label="moodLabel">
        {{ moodEmoji }}
      </div>

      <!-- Mood Classification Badge -->
      <UBadge
        :color="moodColor"
        variant="subtle"
        size="lg"
        class="mb-4"
      >
        {{ moodText }}
      </UBadge>

      <!-- Dutch Summary -->
      <p class="text-lg text-gray-700 dark:text-gray-300 mt-4">
        {{ summary }}
      </p>

      <!-- Sentiment Breakdown -->
      <div v-if="showBreakdown" class="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div class="text-center">
          <div class="font-semibold text-green-600 dark:text-green-400">
            {{ breakdown.positive }}%
          </div>
          <div class="text-gray-600 dark:text-gray-400">Positief</div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-gray-600 dark:text-gray-400">
            {{ breakdown.neutral }}%
          </div>
          <div class="text-gray-600 dark:text-gray-400">Neutraal</div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-red-600 dark:text-red-400">
            {{ breakdown.negative }}%
          </div>
          <div class="text-gray-600 dark:text-gray-400">Negatief</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MoodType, SentimentBreakdown } from "~/types/sentiment";

interface Props {
  mood: MoodType;
  summary: string;
  breakdown: SentimentBreakdown;
  showBreakdown?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showBreakdown: true,
});

// Computed properties
const moodEmoji = computed(() => {
  const emojiMap: Record<MoodType, string> = {
    positive: "😊",
    negative: "😟",
    mixed: "😐",
    neutral: "😐",
  };
  return emojiMap[props.mood];
});

const moodColor = computed(() => {
  const colorMap: Record<MoodType, "green" | "red" | "gray" | "yellow"> = {
    positive: "green",
    negative: "red",
    mixed: "yellow",
    neutral: "gray",
  };
  return colorMap[props.mood];
});

const moodText = computed(() => {
  const textMap: Record<MoodType, string> = {
    positive: "Positief",
    negative: "Negatief",
    mixed: "Gemengd",
    neutral: "Neutraal",
  };
  return textMap[props.mood];
});

const moodLabel = computed(() => {
  return `Stemming is ${moodText.value.toLowerCase()}: ${props.summary}`;
});
</script>

<style scoped>
.mood-indicator-card {
  max-width: 600px;
  margin: 0 auto;
}

.mood-emoji {
  line-height: 1;
  user-select: none;
}
</style>
