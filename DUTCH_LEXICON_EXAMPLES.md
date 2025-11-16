# Dutch Healthcare Sentiment Lexicon - Examples

## Overview

This document demonstrates how the custom Dutch healthcare sentiment lexicon analyzes Dutch text.

## Example Analyses

### Example 1: Positive Healthcare Sentiment

**Input:**
```
De zorgverzekering is betaalbaar en de vergoeding is goed.
```

**Analysis:**
- **Score:** +6
- **Comparative:** 0.667 (positive)
- **Recognized positive words:** betaalbaar, vergoeding, goed
- **Recognized negative words:** none
- **Overall sentiment:** ✅ Positive

**Explanation:** The text mentions "betaalbaar" (affordable, +2), "vergoeding" (reimbursement, +2), and "goed" (good, +2), resulting in a positive sentiment.

---

### Example 2: Negative Healthcare Sentiment

**Input:**
```
De premie is te duur en het eigen risico is onbetaalbaar.
```

**Analysis:**
- **Score:** -6
- **Comparative:** -0.545 (negative)
- **Recognized positive words:** none
- **Recognized negative words:** premie, duur, onbetaalbaar
- **Overall sentiment:** ❌ Negative

**Explanation:** The text mentions "premie" (premium, -1), "duur" (expensive, -2), and "onbetaalbaar" (unaffordable, -3), resulting in a negative sentiment.

---

### Example 3: Very Negative Healthcare Sentiment

**Input:**
```
De premieverhoging is een schandaal.
```

**Analysis:**
- **Score:** -6
- **Comparative:** -1.200 (very negative)
- **Recognized positive words:** none
- **Recognized negative words:** premieverhoging, schandaal
- **Overall sentiment:** ❌ Very Negative

**Explanation:** The text mentions "premieverhoging" (premium increase, -3) and "schandaal" (scandal, -3), resulting in a very negative sentiment.

---

### Example 4: Negation Handling (Positive)

**Input:**
```
De zorg is niet slecht.
```

**Analysis:**
- **Score:** +2
- **Comparative:** 0.400 (positive)
- **Recognized positive words:** slecht (inverted by negation)
- **Recognized negative words:** none
- **Overall sentiment:** ✅ Positive

**Explanation:** The word "slecht" (bad, -2) is preceded by "niet" (not), which inverts its sentiment to +2, resulting in a positive overall sentiment.

---

## Negation Rules

The Dutch lexicon supports negation words that invert the sentiment of following words:

| Negator | Example | Original Sentiment | After Negation |
|---------|---------|-------------------|----------------|
| niet | "niet goed" | goed (+2) | -2 (negative) |
| niet | "niet slecht" | slecht (-2) | +2 (positive) |
| geen | "geen probleem" | probleem (-2) | +2 (positive) |
| nooit | "nooit duur" | duur (-2) | +2 (positive) |

## Healthcare Terms Coverage

### Positive Terms (Score: +2 to +3)

| Word | Score | Translation |
|------|-------|-------------|
| betaalbaar | +2 | affordable |
| vergoeding | +2 | reimbursement |
| toegankelijk | +2 | accessible |
| kwaliteit | +2 | quality |
| gezondheid | +2 | health |
| preventie | +2 | prevention |
| uitstekend | +3 | excellent |

### Negative Terms (Score: -2 to -3)

| Word | Score | Translation |
|------|-------|-------------|
| premie | -1 | premium |
| duur | -2 | expensive |
| eigen risico | -2 | deductible |
| wachtlijst | -2 | waiting list |
| onbetaalbaar | -3 | unaffordable |
| premieverhoging | -3 | premium increase |
| schandaal | -3 | scandal |
| afgewezen | -3 | rejected |

## Implementation Details

The Dutch lexicon is automatically used by the sentiment analyzer:

```typescript
import { analyzeSentiment } from '~/server/utils/sentimentAnalyzer';

// Automatically uses Dutch lexicon
const result = analyzeSentiment('De zorgverzekering is betaalbaar.');
// Returns positive sentiment
```

## Testing

To test the Dutch lexicon:

1. **Run test cases:**
   ```bash
   node test-dutch-integration.mjs
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Test with API:**
   ```bash
   curl http://localhost:3000/api/sentiment
   ```

## Notes

- The lexicon contains **400+ Dutch words**
- **150+ healthcare-specific terms** for domain accuracy
- **250+ general sentiment words** for comprehensive coverage
- Negation handling supports: niet, geen, nooit, zonder
- Scoring scale: -3 (very negative) to +3 (very positive)
