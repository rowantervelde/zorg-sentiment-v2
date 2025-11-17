# Dutch Healthcare Sentiment Lexicon

This directory contains a custom Dutch sentiment lexicon specifically designed for analyzing Dutch healthcare discussions.

## Overview

The Dutch lexicon replaces the default English AFINN wordlist with Dutch-specific vocabulary, including:

1. **Healthcare-specific terms**: Words commonly used in Dutch healthcare discussions (premie, eigen risico, vergoeding, etc.)
2. **General Dutch sentiment words**: Common positive and negative words in Dutch (goed, slecht, fantastisch, etc.)
3. **Dutch negation handling**: Support for Dutch negation words (niet, geen, nooit, etc.)

## Structure

```
languages/nl/
├── index.ts              # Main module export
├── labels.ts             # Word-to-score mappings
├── negators.ts           # Dutch negation words
└── scoring-strategy.ts   # Negation handling logic
```

## Scoring Scale

Words are scored on a scale from -3 to +3:

- **+3**: Very positive (uitstekend, fantastisch, perfect)
- **+2**: Positive (goed, fijn, prettig)
- **+1**: Slightly positive (ok, redelijk, acceptabel)
- **0**: Neutral (default, not explicitly listed)
- **-1**: Slightly negative (min, minder, matig)
- **-2**: Negative (slecht, vervelend, probleem)
- **-3**: Very negative (vreselijk, verschrikkelijk, catastrofaal)

## Healthcare Terms

### Positive Healthcare Terms

- **gezondheid** (+2): Health
- **vergoeding** (+2): Reimbursement
- **betaalbaar** (+2): Affordable
- **toegankelijk** (+2): Accessible
- **kwaliteit** (+2): Quality
- **preventie** (+2): Prevention

### Negative Healthcare Terms

- **premieverhoging** (-3): Premium increase
- **eigen risico** (-2): Deductible
- **onbetaalbaar** (-3): Unaffordable
- **wachtlijst** (-2): Waiting list
- **afgewezen** (-3): Rejected
- **bureaucratie** (-2): Bureaucracy

## Negation Handling

The lexicon supports Dutch negation words that invert sentiment:

- **niet**: not
- **geen**: no/none
- **nooit**: never
- **zonder**: without

### Examples

| Phrase | Sentiment | Explanation |
|--------|-----------|-------------|
| "goed" | +2 | Good (positive) |
| "niet goed" | -2 | Not good (negation inverts to negative) |
| "slecht" | -2 | Bad (negative) |
| "niet slecht" | +2 | Not bad (negation inverts to positive) |
| "duur" | -2 | Expensive (negative in healthcare context) |
| "geen dure premie" | +2 | No expensive premium (negation makes it positive) |

## Usage

The Dutch lexicon is automatically registered and used by the sentiment analyzer:

```typescript
import { analyzeSentiment } from '~/server/utils/sentimentAnalyzer';

// Automatically uses Dutch lexicon
const result = analyzeSentiment('De zorgverzekering is betaalbaar en de vergoeding is goed.');
// Returns positive sentiment due to "betaalbaar" and "goed"
```

## Adding New Words

To add new words to the lexicon:

1. Open `labels.ts`
2. Add the word and its score in the appropriate section
3. Use the scoring scale guidelines above
4. Consider adding variations (singular/plural, adjective/noun forms)

Example:
```typescript
// In labels.ts
export const labels: Record<string, number> = {
  // ... existing words ...
  
  // Your new word
  'nieuwwoord': 2,        // Positive word
  'nieuwwoorden': 2,      // Plural form
};
```

## Testing

Test the Dutch lexicon with sample healthcare sentences:

```bash
# Start the development server
npm run dev

# Test with sample data
curl http://localhost:8888/api/sentiment
```

## Performance

The Dutch lexicon contains approximately **400+ words**:
- **150+ healthcare-specific terms**
- **250+ general sentiment words**

This provides comprehensive coverage for Dutch healthcare discussions while maintaining fast analysis performance.

## Future Enhancements

Potential improvements for the Dutch lexicon:

1. **Compound word handling**: Dutch uses many compound words (e.g., "ziektekostenverzekering")
2. **Regional variations**: Support for Belgian Dutch differences
3. **Amplifiers**: Words that increase sentiment intensity (zeer, erg, heel)
4. **Domain expansion**: More insurance-specific terminology
5. **Diminutives**: Dutch diminutive forms (-je, -tje) that can soften sentiment

## References

- [AFINN-165 Wordlist](http://www2.imm.dtu.dk/pubdb/views/publication_details.php?id=6010) - Original English sentiment list
- [Sentiment.js Documentation](https://github.com/thisandagain/sentiment) - Base library
- Dutch healthcare terminology from Zorgwijzer, Rijksoverheid, and healthcare providers

## Maintenance

The lexicon should be reviewed and updated:
- **Quarterly**: Add new healthcare terms from current news
- **Annually**: Review and adjust scores based on usage patterns
- **As needed**: Add terms from user feedback or new healthcare policies

---

Last updated: November 2025
