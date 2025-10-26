/**
 * Mood Summary Generator
 * Generates human-readable Dutch summaries with emoji based on sentiment
 */

import type { MoodType, MoodSummary, SentimentDataPoint } from '~/types/sentiment';

/**
 * Dutch mood summary templates
 * Following VD-004 and VD-004a specifications for playful, friendly tone
 */
const MOOD_TEMPLATES: Record<MoodType, string[]> = {
  positive: [
    'Nederland voelt zich optimistisch over zorgverzekeringen',
    'De stemming over zorg is positief',
    'Er heerst een hoopvol gevoel over gezondheidszorg',
    'Positieve vibes over zorgverzekeringen',
    'Nederland kijkt hoopvol naar de gezondheidszorg',
    'De sfeer rondom zorg is opgewekt',
  ],
  negative: [
    'Er is onvrede over zorgverzekeringen',
    'De stemming over zorg is negatief',
    'Zorgen over gezondheidszorg domineren',
    'Nederland maakt zich zorgen over de gezondheidszorg',
    'Kritische geluiden over zorgverzekeringen',
    'Onrust over de zorgverzekeringen',
  ],
  mixed: [
    'De meningen over zorg zijn verdeeld',
    'Een gemengd gevoel over zorgverzekeringen',
    'De stemming over zorg is gemengd',
    'Nederland is verdeeld over de gezondheidszorg',
    'Wisselende meningen over zorgverzekeringen',
    'Een gemêleerd beeld over de gezondheidszorg',
  ],
  neutral: [
    'Een neutrale stemming over zorgverzekeringen',
    'Kalme reacties op gezondheidszorg',
    'De stemming over zorg is neutraal',
    'Rustig nieuws over gezondheidszorg',
    'Geen sterke reacties op zorgverzekeringen',
    'Evenwichtige berichtgeving over zorg',
  ],
};

/**
 * Emoji mapping for mood types (per VD-001)
 */
const MOOD_EMOJI: Record<MoodType, string> = {
  positive: '😊',
  negative: '😟',
  mixed: '😐',
  neutral: '😐',
};

/**
 * Generate a mood summary from a sentiment data point
 */
export function generateMoodSummary(dataPoint: SentimentDataPoint): MoodSummary {
  const template = getRandomTemplate(dataPoint.moodClassification);
  const emoji = getMoodEmoji(dataPoint.moodClassification);

  return {
    text: template,
    mood: dataPoint.moodClassification,
    generatedAt: new Date().toISOString(),
    basedOnDataPoint: dataPoint.timestamp,
    emoji,
  };
}

/**
 * Get a random template for the mood type
 */
function getRandomTemplate(mood: MoodType): string {
  const templates = MOOD_TEMPLATES[mood];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex] ?? templates[0] ?? 'De stemming over zorg';
}

/**
 * Get emoji for mood type
 */
export function getMoodEmoji(mood: MoodType): string {
  return MOOD_EMOJI[mood];
}

/**
 * Generate a summary with percentage details
 * Example: "Nederland is positief over zorg (65% positief, 25% neutraal, 10% negatief)"
 */
export function generateDetailedSummary(dataPoint: SentimentDataPoint): string {
  const baseTemplate = getRandomTemplate(dataPoint.moodClassification);
  const percentageDetail = `(${dataPoint.breakdown.positive}% positief, ${dataPoint.breakdown.neutral}% neutraal, ${dataPoint.breakdown.negative}% negatief)`;
  
  return `${baseTemplate} ${percentageDetail}`;
}

/**
 * Generate a summary for no data scenario
 */
export function getNoDataMessage(): string {
  return 'We verzamelen nog gegevens over de stemming. Check straks terug!';
}

/**
 * Generate a stale data warning message
 */
export function getStaleDataWarning(hoursOld: number): string {
  if (hoursOld < 24) {
    return '';
  }
  
  const daysOld = Math.floor(hoursOld / 24);
  
  if (daysOld === 1) {
    return '⚠️ Data is meer dan 1 dag oud';
  }
  
  return `⚠️ Data is ${daysOld} dagen oud`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
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
}

/**
 * Validate summary text length (max 200 chars per VD-005)
 */
export function validateSummaryLength(text: string): boolean {
  return text.length <= 200;
}
