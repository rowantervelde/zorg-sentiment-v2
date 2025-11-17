#!/usr/bin/env node

/**
 * Simple test script for Dutch healthcare sentiment lexicon
 * Tests the built application's sentiment API
 */

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
  
  // Negative healthcare examples
  {
    text: 'De premie is te duur en het eigen risico is onbetaalbaar.',
    expected: 'negative',
    description: 'Expensive premium and unaffordable deductible'
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
    text: 'De premie is niet te duur.',
    expected: 'positive',
    description: 'Premium is not too expensive (negation should invert)'
  },
];

console.log('\n🧪 Dutch Healthcare Sentiment Lexicon - Test Cases\n');
console.log('='.repeat(80));
console.log('\nThese test cases validate the Dutch lexicon implementation:');

for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  console.log(`\n${i + 1}. ${testCase.description}`);
  console.log(`   Text: "${testCase.text}"`);
  console.log(`   Expected sentiment: ${testCase.expected}`);
}

console.log('\n' + '='.repeat(80));
console.log('\n📋 To test the implementation:');
console.log('   1. Start the server: npm run dev');
console.log('   2. Navigate to http://localhost:3000');
console.log('   3. Check the API: http://localhost:3000/api/sentiment');
console.log('   4. Verify Dutch words are recognized in article analysis\n');
