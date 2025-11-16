#!/usr/bin/env node

/**
 * Test script for Dutch healthcare sentiment lexicon
 * 
 * Usage: node test-dutch-lexicon.js
 */

import Sentiment from 'sentiment';

// Import the Dutch language module
const { dutchLanguage } = await import('./server/utils/sentiment/languages/nl/index.ts');

// Initialize sentiment analyzer with Dutch
const sentiment = new Sentiment();
sentiment.registerLanguage('nl', dutchLanguage);

// Test cases with expected sentiment
const testCases = [
  // Positive healthcare examples
  {
    text: 'De zorgverzekering is betaalbaar en de vergoeding is goed.',
    expected: 'positive',
    description: 'Affordable insurance with good reimbursement'
  },
  {
    text: 'De kwaliteit van de gezondheidszorg is uitstekend.',
    expected: 'positive',
    description: 'Excellent healthcare quality'
  },
  {
    text: 'Preventie en toegankelijkheid zijn prima geregeld.',
    expected: 'positive',
    description: 'Good prevention and accessibility'
  },
  
  // Negative healthcare examples
  {
    text: 'De premie is te duur en het eigen risico is onbetaalbaar.',
    expected: 'negative',
    description: 'Expensive premium and unaffordable deductible'
  },
  {
    text: 'De wachtlijst is verschrikkelijk lang en de kosten zijn hoog.',
    expected: 'negative',
    description: 'Terrible waiting list and high costs'
  },
  {
    text: 'De premieverhoging is een schandaal.',
    expected: 'negative',
    description: 'Premium increase scandal'
  },
  
  // Negation examples
  {
    text: 'De zorg is niet slecht.',
    expected: 'positive',
    description: 'Healthcare is not bad (negation should invert)'
  },
  {
    text: 'Geen probleem met de vergoeding.',
    expected: 'positive',
    description: 'No problem with reimbursement (negation should invert)'
  },
  {
    text: 'De premie is niet te duur.',
    expected: 'positive',
    description: 'Premium is not too expensive (negation should invert)'
  },
  
  // Mixed sentiment
  {
    text: 'De zorg is goed maar de premie is duur.',
    expected: 'neutral',
    description: 'Good care but expensive premium'
  },
];

console.log('\n🧪 Testing Dutch Healthcare Sentiment Lexicon\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = sentiment.analyze(testCase.text, { language: 'nl' });
  
  // Determine actual sentiment based on comparative score
  let actual = 'neutral';
  if (result.comparative > 0.5) {
    actual = 'positive';
  } else if (result.comparative < -0.5) {
    actual = 'negative';
  }
  
  const success = actual === testCase.expected;
  const icon = success ? '✅' : '❌';
  
  console.log(`\n${icon} Test: ${testCase.description}`);
  console.log(`   Text: "${testCase.text}"`);
  console.log(`   Expected: ${testCase.expected} | Actual: ${actual}`);
  console.log(`   Score: ${result.score} | Comparative: ${result.comparative.toFixed(3)}`);
  console.log(`   Positive words: ${result.positive.length} | Negative words: ${result.negative.length}`);
  
  if (result.positive.length > 0) {
    console.log(`   Positive: ${result.positive.join(', ')}`);
  }
  if (result.negative.length > 0) {
    console.log(`   Negative: ${result.negative.join(', ')}`);
  }
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed (${testCases.length} total)`);

if (failed === 0) {
  console.log('\n✨ All tests passed! Dutch lexicon is working correctly.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Review the lexicon and scoring strategy.\n');
  process.exit(1);
}
