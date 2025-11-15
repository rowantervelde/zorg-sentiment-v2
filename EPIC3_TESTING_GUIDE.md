# Epic 3: Manual Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing the Article Expansion & Sentiment Analysis features implemented in Epic 3.

## Prerequisites
- Nuxt dev server running (`npm run dev`)
- Test data loaded (use `specs/004-sentiment-detail/tests/test-data.json`)
- Browser DevTools open for accessibility testing

## Test Scenarios

### TC-3.1: Expand and View Word Highlights

**Steps:**
1. Navigate to the detail page for a source (e.g., `/sentiment/detail?source=nu-nl-gezondheid&timestamp=2025-11-10T14:00:00Z`)
2. Locate an article with positive and negative words (e.g., "Nieuwe ontwikkelingen in zorgverzekering aanpak")
3. Click the "Toon details" button

**Expected Results:**
- ✅ Button changes to "Verberg details" with ▲ icon
- ✅ Expanded view appears with smooth animation
- ✅ Excerpt text is displayed with highlighted words
- ✅ Positive words show green background + ✓ icon + underline
- ✅ Negative words show red background + ✗ icon + underline
- ✅ Word counts displayed: "Positieve woorden (2)" and "Negatieve woorden (0)"
- ✅ All highlighted words are accessible (check with screen reader)

---

### TC-3.2: Multiple Independent Expansions

**Steps:**
1. On the article list page, expand the first article
2. Scroll down and expand the third article
3. Collapse the first article
4. Verify third article remains expanded

**Expected Results:**
- ✅ Multiple articles can be expanded simultaneously
- ✅ Collapsing one article doesn't affect others
- ✅ Page scroll position is maintained
- ✅ Sort order is preserved during expansion

---

### TC-4.2: Long Article Excerpt Truncation

**Steps:**
1. Find an article with `contentLength > 2000` (e.g., "Lang artikel met veel context")
2. Expand the article

**Expected Results:**
- ✅ Excerpt is truncated to 200 characters with "..."
- ✅ "Lees volledig artikel bij de bron →" link is displayed
- ✅ Link opens in new tab when clicked
- ✅ No horizontal scrolling in expanded view

---

### TC-4.6: Neutral Sentiment Handling

**Steps:**
1. Find an article with `rawSentimentScore` close to 0 (e.g., "Discussie over premie stijging")
2. Expand the article

**Expected Results:**
- ✅ Neutral notice banner appears with ℹ️ icon
- ✅ Banner shows: "Dit artikel heeft een neutrale sentiment score..."
- ✅ "Geen positieve woorden geïdentificeerd" message shows
- ✅ "Geen negatieve woorden geïdentificeerd" message shows
- ✅ Calculation breakdown shows score close to 0 in neutral color

---

### TC-5.1: Color Independence (Accessibility)

**Steps:**
1. Expand an article with word highlights
2. Use Chrome DevTools > Rendering > "Emulate vision deficiencies" > Protanopia
3. Verify highlights are still distinguishable

**Expected Results:**
- ✅ Positive words have ✓ icon even without color perception
- ✅ Negative words have ✗ icon even without color perception
- ✅ Both have underlines for additional distinction
- ✅ Word badges in analysis section are distinguishable by icons

**Screen Reader Test:**
1. Enable NVDA (Windows) or VoiceOver (Mac)
2. Navigate to an expanded article
3. Tab through the highlighted text

**Expected Announcements:**
- ✅ "positief woord: [word]" for positive highlights
- ✅ "negatief woord: [word]" for negative highlights
- ✅ Summary reads: "Dit artikel heeft een [mood] sentiment met [X] positieve woorden..."

---

### TC-5.2: Keyboard Navigation

**Steps:**
1. Tab to an article's "Toon details" button
2. Press Enter
3. Tab through the expanded content
4. Tab to "Verberg details" button
5. Press Space

**Expected Results:**
- ✅ All interactive elements reachable via Tab
- ✅ Enter key expands article
- ✅ Space key collapses article
- ✅ Focus indicators visible on all controls
- ✅ Logical tab order maintained

---

### TC-5.3: Screen Reader Summary

**Steps:**
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to detail page
3. Expand an article
4. Listen to the live region announcement

**Expected Results:**
- ✅ Article expansion triggers announcement
- ✅ Summary includes: mood, positive word count, negative word count
- ✅ Summary includes: weighted score and contribution percentage
- ✅ All sections have proper heading hierarchy (h4 for sections)

---

## Edge Case Testing

### Missing Excerpt
**Article:** Any article with `excerpt: ""`
- ✅ Shows: "Geen tekstfragment beschikbaar. Lees het volledige artikel →"
- ✅ External link works correctly

### Missing Publication Date
**Article:** Any article with `pubDate: null`
- ✅ Metadata shows "Onbekende datum"
- ✅ Sorting by recency places it at the bottom

### No Identified Words
**Article:** Any article with `positiveWords: []` and `negativeWords: []`
- ✅ Shows neutral notice if score is also ~0
- ✅ Shows "Geen ... woorden geïdentificeerd" in analysis section

---

## Performance Testing

### Multiple Expansions
**Steps:**
1. Expand 10 articles
2. Scroll through the list
3. Collapse all
4. Expand again

**Expected Results:**
- ✅ Smooth animations (no jank)
- ✅ No memory leaks (check DevTools Memory tab)
- ✅ Scroll performance at 60fps

---

## Browser Compatibility

**Test in:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Mobile Test:**
- ✅ iOS Safari (iPhone)
- ✅ Chrome Android

---

## Checklist

- [ ] TC-3.1: Expand and view word highlights
- [ ] TC-3.2: Multiple independent expansions
- [ ] TC-4.2: Long article excerpt truncation
- [ ] TC-4.6: Neutral sentiment handling
- [ ] TC-5.1: Color independence verification
- [ ] TC-5.1: Screen reader test (NVDA/JAWS/VoiceOver)
- [ ] TC-5.2: Keyboard navigation
- [ ] TC-5.3: Screen reader summary
- [ ] Edge case: Missing excerpt
- [ ] Edge case: Missing pub date
- [ ] Edge case: No identified words
- [ ] Performance: Multiple expansions
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS, Android

---

## Known Limitations

1. Font providers (Google Fonts, etc.) may not load in restricted environments
2. Build warnings for font providers are expected and non-critical
3. Sentiment word detection accuracy depends on the lexicon quality

---

## Success Criteria

All test cases must pass before Epic 3 is considered complete.
