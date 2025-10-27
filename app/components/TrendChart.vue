<template>
  <div class="trend-chart-container">
    <!-- Chart Title -->
    <div class="chart-header">
      <h2 class="chart-title">{{ chartTitle }}</h2>
      <p v-if="trendDescription" class="chart-description">
        {{ trendDescription }}
      </p>
    </div>

    <!-- Building History Message -->
    <div v-if="showBuildingMessage" class="building-message" role="status">
      <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <div>
        <strong>Trendgeschiedenis wordt opgebouwd</strong>
        <p>{{ buildingMessageText }}</p>
      </div>
    </div>

    <!-- Chart Canvas -->
    <div v-else class="chart-wrapper">
      <div :style="{ height: props.height }">
        <Line
          :data="chartData"
          :options="chartOptions"
        />
      </div>

      <!-- Data Gaps Indicator -->
      <div v-if="hasGaps" class="gaps-indicator">
        <svg class="warning-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Sommige datapunten ontbreken in deze periode</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import type { TrendPeriod } from '~/types/sentiment';
import { detectDataGaps, detectSignificantChanges, getTrendDescription } from '~/composables/useTrendAnalysis';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  trend: TrendPeriod | null;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
});

// Computed properties
const trendWindowDays = computed(() => {
  if (!props.trend) return 7;
  const start = new Date(props.trend.startDate);
  const end = new Date(props.trend.endDate);
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
});

const trendWindowHours = computed(() => {
  if (!props.trend) return 168;
  const start = new Date(props.trend.startDate);
  const end = new Date(props.trend.endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60));
});

const chartTitle = computed(() => {
  const hours = trendWindowHours.value;
  const days = trendWindowDays.value;
  
  // For windows less than 24 hours, show hours
  if (hours < 24) {
    return `Stemmingstrend afgelopen ${hours} uur`;
  }
  
  // For exactly 24 hours
  if (hours === 24) {
    return 'Stemmingstrend afgelopen 24 uur';
  }
  
  // For multiple days
  return `Stemmingstrend afgelopen ${days} dagen`;
});

const hasData = computed(() => {
  return props.trend && props.trend.dataPoints.length > 0;
});

const showBuildingMessage = computed(() => {
  if (!props.trend) return true;
  
  const windowHours = trendWindowHours.value;
  const totalDataPoints = props.trend.totalDataPoints;
  const expectedMinimum = windowHours; // At least one data point per hour
  
  // Show message if less than expected window
  return totalDataPoints < expectedMinimum;
});

const buildingMessageText = computed(() => {
  if (!props.trend) {
    return 'We verzamelen momenteel de eerste stemmingsgegevens. Check over een paar uur terug.';
  }
  
  const totalDataPoints = props.trend.totalDataPoints;
  const windowDays = trendWindowDays.value;
  const windowHours = trendWindowHours.value;
  const completeness = Math.round(props.trend.dataCompleteness);
  
  if (totalDataPoints === 0) {
    return 'We verzamelen momenteel de eerste stemmingsgegevens.';
  }
  
  if (windowDays < 1) {
    // For sub-day windows (testing)
    return `We hebben ${totalDataPoints} datapunten verzameld (${completeness}% compleet voor ${windowHours} uur).`;
  }
  
  const hoursOfData = totalDataPoints;
  const daysOfData = Math.floor(hoursOfData / 24);
  
  if (daysOfData === 0) {
    return `We hebben ${hoursOfData} uur aan gegevens (${completeness}% compleet).`;
  }
  
  if (daysOfData < windowDays) {
    return `We hebben ${daysOfData} ${daysOfData === 1 ? 'dag' : 'dagen'} aan gegevens (${completeness}% compleet). Volledige ${windowDays}-dagen trend beschikbaar over ${windowDays - daysOfData} ${windowDays - daysOfData === 1 ? 'dag' : 'dagen'}.`;
  }
  
  return '';
});

const trendDescription = computed(() => {
  if (!hasData.value || !props.trend) return '';
  return getTrendDescription(props.trend);
});

const hasGaps = computed(() => {
  if (!hasData.value || !props.trend) return false;
  const gaps = detectDataGaps(props.trend.dataPoints);
  return gaps.length > 0;
});

const significantChanges = computed(() => {
  if (!hasData.value || !props.trend) return [];
  return detectSignificantChanges(props.trend.dataPoints, 20);
});

// Chart data
const chartData = computed<ChartData<'line'>>(() => {
  if (!hasData.value || !props.trend) {
    return {
      labels: [],
      datasets: [],
    };
  }

  const dataPoints = props.trend.dataPoints;

  // Generate labels (dates/times)
  const labels = dataPoints.map((dp) => {
    const date = new Date(dp.timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const hours = date.getHours();
    
    // Show date + time for better context
    return `${day}/${month} ${hours}:00`;
  });

  // Calculate net sentiment (positive - negative) for primary line
  const netSentiment = dataPoints.map((dp) => 
    dp.breakdown.positive - dp.breakdown.negative
  );

  // Detect significant changes for point styling
  const changes = significantChanges.value;
  const changeIndices = new Set(changes.map(c => c.index));

  // Point colors: highlight significant changes
  const pointColors = dataPoints.map((_, index) => {
    if (changeIndices.has(index)) {
      const change = changes.find(c => c.index === index);
      return change && change.swing > 0 ? '#10b981' : '#ef4444'; // Green for positive, red for negative
    }
    return '#3b82f6'; // Default blue
  });

  // Point sizes: larger for significant changes
  const pointSizes = dataPoints.map((_, index) => 
    changeIndices.has(index) ? 8 : 4
  );

  return {
    labels,
    datasets: [
      {
        label: 'Netto Stemming',
        data: netSentiment,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: pointSizes,
        pointHoverRadius: 10,
      },
    ],
  };
});

// Chart options
const chartOptions = computed<ChartOptions<'line'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (context) => {
            // Show full date/time in tooltip
            const firstContext = context[0];
            if (!firstContext) return '';
            
            const index = firstContext.dataIndex;
            if (props.trend && props.trend.dataPoints[index]) {
              const dp = props.trend.dataPoints[index];
              const date = new Date(dp.timestamp);
              return date.toLocaleString('nl-NL', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
            }
            return '';
          },
          label: (context) => {
            const value = context.parsed.y;
            if (value === null) return '';
            
            const index = context.dataIndex;
            
            if (props.trend && props.trend.dataPoints[index]) {
              const dp = props.trend.dataPoints[index];
              const mood = dp.moodClassification;
              const moodEmoji = mood === 'positive' ? '😊' : mood === 'negative' ? '😟' : '😐';
              
              return [
                `${moodEmoji} ${value > 0 ? 'Positief' : value < 0 ? 'Negatief' : 'Neutraal'} (${value > 0 ? '+' : ''}${value})`,
                '',
                `Positief: ${dp.breakdown.positive}%`,
                `Neutraal: ${dp.breakdown.neutral}%`,
                `Negatief: ${dp.breakdown.negative}%`,
              ];
            }
            
            return `Netto: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Datum & Tijd',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Netto Stemming (Positief - Negatief)',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#6b7280',
          callback: (value) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value as string);
            return `${numValue > 0 ? '+' : ''}${numValue}`;
          },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        // Range from -100 to +100
        min: -100,
        max: 100,
      },
    },
  };
});
</script>

<style scoped>
.trend-chart-container {
  width: 100%;
  margin-top: 2rem;
}

.chart-header {
  margin-bottom: 1rem;
  text-align: center;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.chart-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.building-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #dbeafe;
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
  color: #1e3a8a;
}

.building-message strong {
  display: block;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #1e40af;
}

.building-message p {
  margin: 0;
  font-size: 0.938rem;
  line-height: 1.5;
  color: #1e3a8a;
}

.info-icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
  flex-shrink: 0;
}

.chart-wrapper {
  position: relative;
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.gaps-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 0.375rem;
  color: #92400e;
  font-size: 0.875rem;
}

.warning-icon {
  width: 20px;
  height: 20px;
  color: #f59e0b;
  flex-shrink: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .chart-title {
    color: #f9fafb;
  }

  .chart-description {
    color: #d1d5db;
  }

  .chart-wrapper {
    background-color: #1f2937;
  }

  .building-message {
    background-color: #1e3a8a;
    border-color: #3b82f6;
    color: #dbeafe;
  }

  .building-message strong {
    color: #93c5fd;
  }

  .building-message p {
    color: #dbeafe;
  }

  .gaps-indicator {
    background-color: #78350f;
    border-color: #f59e0b;
    color: #fef3c7;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-title {
    font-size: 1.25rem;
  }

  .chart-description {
    font-size: 0.875rem;
  }

  .chart-wrapper {
    padding: 1rem;
  }

  .building-message {
    padding: 1rem;
    font-size: 0.875rem;
  }

  .building-message strong {
    font-size: 1rem;
  }
}
</style>
