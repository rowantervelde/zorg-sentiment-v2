<template>
  <div class="mood-indicator" :class="`mood-${mood}`">
    <!-- Emoji Display (VD-001, VD-002: 80-120px) -->
    <div 
      class="mood-emoji" 
      :aria-label="ariaLabel"
      role="img"
    >
      {{ emoji }}
    </div>

    <!-- Mood Summary Text (VD-004a: friendly Dutch) -->
    <div class="mood-summary">
      <h2 class="mood-title">{{ summaryText }}</h2>
    </div>

    <!-- Sentiment Breakdown (User Story 3) -->
    <div v-if="showBreakdown" class="mood-breakdown">
      <div class="breakdown-item breakdown-positive">
        <span class="breakdown-label">Positief</span>
        <span class="breakdown-value">{{ breakdown.positive }}%</span>
      </div>
      <div class="breakdown-item breakdown-neutral">
        <span class="breakdown-label">Neutraal</span>
        <span class="breakdown-value">{{ breakdown.neutral }}%</span>
      </div>
      <div class="breakdown-item breakdown-negative">
        <span class="breakdown-label">Negatief</span>
        <span class="breakdown-value">{{ breakdown.negative }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MoodType } from '~/types/sentiment';

// Props
interface Props {
  mood: MoodType;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summary: string;
  showBreakdown?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showBreakdown: true,
});

// Emoji mapping (VD-001)
const emojiMap: Record<MoodType, string> = {
  positive: '😊',
  negative: '😟',
  mixed: '😐',
  neutral: '😐',
};

const emoji = computed(() => emojiMap[props.mood]);

// ARIA labels for accessibility (A11Y-001, A11Y-002)
const ariaLabelMap: Record<MoodType, string> = {
  positive: 'Positieve stemming: blij gezicht emoji',
  negative: 'Negatieve stemming: bezorgd gezicht emoji',
  mixed: 'Gemengde stemming: neutraal gezicht emoji',
  neutral: 'Neutrale stemming: neutraal gezicht emoji',
};

const ariaLabel = computed(() => ariaLabelMap[props.mood]);

// Summary text with fallback
const summaryText = computed(() => props.summary || 'De stemming over zorg');
</script>

<style scoped>
.mood-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
}

/* Emoji Display (VD-002: 80-120px diameter) */
.mood-emoji {
  font-size: 100px;
  line-height: 1;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.mood-emoji:hover {
  transform: scale(1.1);
}

/* Mood-specific colors (VD-003) */
.mood-positive .mood-emoji {
  filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3));
}

.mood-negative .mood-emoji {
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
}

.mood-mixed .mood-emoji,
.mood-neutral .mood-emoji {
  filter: drop-shadow(0 4px 12px rgba(107, 114, 128, 0.3));
}

/* Summary Text (VD-004a: friendly, warm tone) */
.mood-summary {
  max-width: 600px;
}

.mood-title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
}

/* Color coding for titles (VD-003) */
.mood-positive .mood-title {
  color: #10b981; /* green-500 */
}

.mood-negative .mood-title {
  color: #ef4444; /* red-500 */
}

.mood-mixed .mood-title,
.mood-neutral .mood-title {
  color: #6b7280; /* gray-500 */
}

/* Breakdown Display */
.mood-breakdown {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 80px;
}

.breakdown-label {
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.breakdown-value {
  font-size: 1.25rem;
  font-weight: 700;
}

/* Breakdown colors */
.breakdown-positive .breakdown-label,
.breakdown-positive .breakdown-value {
  color: #10b981;
}

.breakdown-neutral .breakdown-label,
.breakdown-neutral .breakdown-value {
  color: #6b7280;
}

.breakdown-negative .breakdown-label,
.breakdown-negative .breakdown-value {
  color: #ef4444;
}

/* Responsive Design (RD-001: mobile <768px) */
@media (max-width: 767px) {
  .mood-indicator {
    padding: 1.5rem 1rem;
    gap: 1rem;
  }

  .mood-emoji {
    font-size: 80px;
    width: 80px;
    height: 80px;
  }

  .mood-title {
    font-size: 1.25rem;
  }

  .mood-breakdown {
    gap: 1rem;
  }

  .breakdown-item {
    min-width: 70px;
  }

  .breakdown-value {
    font-size: 1.125rem;
  }
}

/* Desktop (RD-002: ≥768px) */
@media (min-width: 768px) {
  .mood-emoji {
    font-size: 120px;
    width: 120px;
    height: 120px;
  }
}
</style>
