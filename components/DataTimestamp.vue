<template>
  <div class="data-timestamp text-sm text-gray-600 dark:text-gray-400">
    <!-- Last Updated -->
    <div class="flex items-center justify-center gap-2">
      <span class="font-medium">Laatst bijgewerkt:</span>
      <time :datetime="timestamp" class="font-mono">
        {{ formattedTime }}
      </time>
    </div>

    <!-- Staleness Warning -->
    <UAlert
      v-if="isStale"
      color="yellow"
      variant="subtle"
      class="mt-4"
      title="Data is verouderd"
      description="De gegevens zijn ouder dan 24 uur. Probeer later opnieuw."
    />

    <!-- Age Display -->
    <div v-if="!isStale && ageText" class="mt-2 text-xs text-center">
      {{ ageText }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  timestamp: string;
  isStale?: boolean;
  dataAge?: number; // in seconds
}

const props = withDefaults(defineProps<Props>(), {
  isStale: false,
  dataAge: 0,
});

// Format timestamp for display
const formattedTime = computed(() => {
  const date = new Date(props.timestamp);
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
});

// Human-readable age text
const ageText = computed(() => {
  if (props.dataAge === 0) return "";

  const minutes = Math.floor(props.dataAge / 60);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "Zojuist";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minuut" : "minuten"} geleden`;
  if (hours < 24) return `${hours} ${hours === 1 ? "uur" : "uren"} geleden`;

  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "dag" : "dagen"} geleden`;
});
</script>
