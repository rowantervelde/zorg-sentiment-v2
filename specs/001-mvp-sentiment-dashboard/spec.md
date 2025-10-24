# Feature Specification: MVP Sentiment Dashboard

**Feature Branch**: `001-mvp-sentiment-dashboard`  
**Created**: 2025-10-24  
**Status**: Draft  
**Input**: User description: "A playful web app that visualizes how the Netherlands feels about healthcare insurance in real-time what: Zorg-sentiment collects and analyzes public conversations about Dutch healthcare insurance from social media and news sources. It translates this data into an interactive 'national mood' indicator. The goal is to make the serious world of healthcare insurance more engaging and human through humor, data, and visual storytelling. why: Healthcare insurance is a serious, data-heavy topic that often feels distant from people's emotions. Zorg-sentiment bridges that gap by using real-world data to reflect the collective public mood — turning dry sentiment into something visual, relatable, and fun. This app demonstrates how multiple open APIs can combine to create engaging insights from complex, regulated domains."

## Clarifications

### Session 2025-10-24

- Q: How should sentiment scores be classified into positive, neutral, and negative categories? → A: Three-way threshold: ≥60% positive = positive mood, ≥60% negative = negative mood, otherwise mixed/neutral
- Q: How often should the system collect new sentiment data from sources? → A: Hourly: Fresh data throughout the day while managing API rate limits and processing costs
- Q: What is the expected concurrent user capacity for the MVP? → A: 100-500 concurrent users: Small audience, minimal infrastructure, lowest cost
- Q: How old can displayed sentiment data be before the app should show a prominent "data may be outdated" warning? → A: 24 hours: Reasonable grace period, aligns with daily minimum update expectation
- Q: What rate limiting should be applied to protect against abuse? → A: Strict IP limits: 20 requests/hour per IP, very restrictive, may impact legitimate users on shared IPs

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Current National Mood (Priority: P1)

A visitor opens the web app to see how people in the Netherlands are currently feeling about healthcare insurance. They see a clear visual indicator showing the overall sentiment (positive, neutral, or negative) along with a simple, playful summary.

**Why this priority**: This is the core value proposition - showing the "pulse" of Dutch healthcare sentiment. Without this, there is no product. It's the most basic form of value delivery.

**Independent Test**: Can be fully tested by visiting the homepage and verifying that a sentiment indicator displays with current data. Delivers immediate value by answering "How do people feel about healthcare insurance right now?"

**Acceptance Scenarios**:

1. **Given** the app has collected sentiment data, **When** a visitor opens the homepage, **Then** they see a visual mood indicator (e.g., happy/neutral/sad) showing the current sentiment
2. **Given** the visitor views the homepage, **When** they read the summary text, **Then** they see a concise, human-readable description of the current mood (e.g., "The Netherlands is feeling cautiously optimistic about healthcare")
3. **Given** no data is available, **When** a visitor opens the homepage, **Then** they see a friendly message explaining data is being collected

---

### User Story 2 - See Sentiment Trends Over Time (Priority: P2)

A visitor wants to understand how sentiment has changed over recent days or weeks. They view a simple chart or timeline showing whether sentiment is improving, declining, or staying stable.

**Why this priority**: This adds context and makes the data more meaningful. Users can see patterns and trends, not just a snapshot. This is the next logical step after seeing current mood.

**Independent Test**: Can be fully tested by viewing the trends visualization and verifying it shows historical data points. Delivers value by revealing sentiment patterns over time.

**Acceptance Scenarios**:

1. **Given** the app has at least 7 days of sentiment data, **When** a visitor views the trends section, **Then** they see a visual representation of sentiment changes over the past week
2. **Given** the visitor hovers over or taps a data point, **When** they interact with the trend chart, **Then** they see the sentiment value and date for that point
3. **Given** sentiment has changed significantly, **When** the visitor views trends, **Then** notable changes are visually highlighted or called out

---

### User Story 3 - Understand Sentiment Breakdown (Priority: P3)

A curious visitor wants to see more detail behind the overall mood. They view a breakdown showing the proportion of positive, neutral, and negative sentiment.

**Why this priority**: This provides transparency and builds trust. Users can see that the "mood" isn't just a black box, but is based on actual distribution of opinions.

**Independent Test**: Can be fully tested by viewing the sentiment breakdown visualization and verifying percentages add up to 100%. Delivers value by showing the composition of the overall mood.

**Acceptance Scenarios**:

1. **Given** the app has sentiment data, **When** a visitor views the breakdown section, **Then** they see percentages or proportions for positive, neutral, and negative sentiment
2. **Given** the breakdown is displayed, **When** a visitor views the visualization, **Then** the three categories are clearly distinguished by color or labeling
3. **Given** one sentiment category dominates (e.g., >70%), **When** the visitor views the breakdown, **Then** this dominance is visually apparent

---

### Edge Cases

- What happens when data collection is temporarily unavailable (API downtime, rate limits)? Display last known data with timestamp; show warning if data is older than 24 hours
- How does the system handle the first day when historical data doesn't exist yet? Show current sentiment only; display message that trend history is building
- What if sentiment data shows extreme values (100% negative or positive)? Display actual values; system accepts full spectrum of sentiment distributions
- How should the app behave if a visitor accesses it in a non-Dutch language browser? Display Dutch content regardless (single language for MVP)
- What happens when there's a data gap in the timeline (missing days)? Display available data points with gaps clearly indicated on trend visualization

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a current sentiment indicator showing the overall mood about Dutch healthcare insurance
- **FR-002**: System MUST collect sentiment data from publicly available Dutch-language sources related to healthcare insurance topics
- **FR-003**: System MUST categorize collected data into positive, neutral, and negative sentiment
- **FR-003a**: System MUST classify overall mood as "positive" when ≥60% of sentiment data is positive, "negative" when ≥60% is negative, and "mixed/neutral" otherwise
- **FR-004**: System MUST generate a human-readable summary text describing the current national mood
- **FR-005**: System MUST collect sentiment data from sources on an hourly basis to maintain data freshness
- **FR-006**: System MUST display sentiment trends over time showing at least 7 days of historical data
- **FR-007**: System MUST show a breakdown of sentiment proportions (positive, neutral, negative percentages)
- **FR-008**: System MUST handle data collection failures gracefully by displaying the last known data with a timestamp
- **FR-008a**: System MUST display a prominent warning when displayed data is older than 24 hours
- **FR-009**: System MUST display timestamps showing when data was last updated
- **FR-010**: System MUST be accessible via standard web browsers without requiring user authentication
- **FR-010a**: System MUST implement rate limiting of 20 requests per hour per IP address to prevent abuse
- **FR-011**: System MUST present information in a visually engaging and playful manner while maintaining data accuracy
- **FR-012**: System MUST store historical sentiment data for trend visualization

### Key Entities

- **Sentiment Data Point**: Represents a single measurement of public sentiment, including timestamp, overall mood classification (positive/mixed/neutral/negative based on ≥60% threshold), and breakdown by category (positive/neutral/negative percentages)
- **Mood Summary**: A human-friendly text description of the current sentiment, generated based on the latest sentiment data point
- **Data Source**: Reference to where sentiment data originates (social media posts, news articles, public forums) - tracked for transparency but not displayed in MVP
- **Trend Period**: A time-bounded collection of sentiment data points used to visualize changes over time (minimum 7 days for MVP)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Visitors can understand the current sentiment about Dutch healthcare insurance within 5 seconds of landing on the homepage
- **SC-002**: The app displays updated sentiment data at least once every 24 hours
- **SC-002a**: Sentiment data is collected hourly, with no more than 90 minutes between successful data collection cycles
- **SC-003**: Sentiment visualizations are clear enough that 90% of visitors can correctly identify whether sentiment is predominantly positive, negative, or mixed without additional explanation
- **SC-004**: Historical trends show data for at least the past 7 days with no more than 1 missing day
- **SC-005**: The app remains accessible and displays last known data even when data collection services are temporarily unavailable
- **SC-006**: Page load time is under 3 seconds on standard broadband connections
- **SC-006a**: System handles at least 100 concurrent users without performance degradation, with capacity for up to 500 concurrent users
- **SC-007**: The sentiment breakdown percentages are accurate to within 2 percentage points of the underlying data

## Assumptions

- The target audience primarily speaks Dutch or understands Dutch content
- Visitors have access to modern web browsers (Chrome, Firefox, Safari, Edge within the last 2 versions)
- Public sentiment data sources are available through open APIs or publicly accessible platforms
- The app does not require user accounts or personalization in the MVP phase
- Sentiment analysis will be performed on Dutch-language text content only
- A "daily" update frequency is sufficient for MVP; real-time updates are deferred to future phases
- Hourly data collection provides sufficient freshness while managing API rate limits and processing costs
- The app will focus on desktop and mobile web experiences; native mobile apps are out of scope
- Data retention for historical trends will start at 7 days, with longer periods considered for future iterations
- The playful tone and visual design will be professional enough to maintain credibility while being engaging
- No moderation or filtering of source content is required for MVP beyond automated sentiment classification
- MVP targets 100-500 concurrent users with minimal infrastructure, scalability deferred to post-MVP
- Rate limiting (20 requests/hour per IP) provides abuse protection without authentication complexity

## Scope

### In Scope for MVP

- Single-page web application displaying current sentiment
- Daily automated data collection and sentiment analysis
- Visual mood indicator on homepage
- 7-day historical trend visualization
- Sentiment breakdown (positive/neutral/negative percentages)
- Responsive design for desktop and mobile browsers
- Dutch language interface
- Graceful error handling for data unavailability

### Explicitly Out of Scope for MVP

- User accounts and authentication
- Real-time sentiment updates (sub-daily)
- Interactive features (commenting, voting, sharing)
- Multiple language support
- Detailed source attribution for individual data points
- Sentiment analysis of specific healthcare insurance companies
- Custom date range selection for trends
- Data export functionality
- Email notifications or alerts
- Integration with third-party analytics beyond basic web metrics
- Administrative dashboard for content moderation
- AI-generated commentary (deferred to post-MVP)
