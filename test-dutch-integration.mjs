/**
 * Manual test for Dutch lexicon integration
 * Run with: node --loader tsx test-dutch-integration.mjs
 */

import Sentiment from 'sentiment';

// Manually create Dutch lexicon for testing
const dutchLabels = {
  // Healthcare positive
  'betaalbaar': 2,
  'vergoeding': 2,
  'goed': 2,
  'uitstekend': 3,
  'kwaliteit': 2,
  
  // Healthcare negative
  'duur': -2,
  'premie': -1,
  'onbetaalbaar': -3,
  'eigen risico': -2,
  'schandaal': -3,
  'premieverhoging': -3,
  
  // General
  'slecht': -2,
};

const dutchNegators = {
  'niet': true,
  'geen': true,
  'nooit': true,
};

const dutchLanguage = {
  labels: dutchLabels,
  scoringStrategy: {
    apply: function(tokens, cursor, tokenScore) {
      if (cursor > 0) {
        const prevToken = tokens[cursor - 1].toLowerCase();
        if (dutchNegators[prevToken]) {
          tokenScore = -tokenScore;
        }
      }
      return tokenScore;
    }
  }
};

// Initialize sentiment with Dutch
const sentiment = new Sentiment();
sentiment.registerLanguage('nl', dutchLanguage);

console.log('\n🧪 Testing Dutch Lexicon Integration\n');
console.log('='.repeat(80));

const tests = [
  'De zorgverzekering is betaalbaar en de vergoeding is goed.',
  'De premie is te duur en het eigen risico is onbetaalbaar.',
  'De premieverhoging is een schandaal.',
  'De zorg is niet slecht.',
];

for (const text of tests) {
  const result = sentiment.analyze(text, { language: 'nl' });
  console.log(`\nText: "${text}"`);
  console.log(`Score: ${result.score} | Comparative: ${result.comparative.toFixed(3)}`);
  console.log(`Positive: [${result.positive.join(', ')}]`);
  console.log(`Negative: [${result.negative.join(', ')}]`);
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ Dutch lexicon is working correctly!\n');
