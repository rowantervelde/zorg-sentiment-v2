# Feature Specification: Multi-Source Sentiment Data Collection

**Feature Branch**: `002-multi-source-sentiment`  
**Created**: 2025-10-26  
**Status**: Draft  
**Input**: User description: "More resources are needed to get a better sentiment for the app. First we need to add more relevant rss feeds and in later user stories we want also other sources like twitter, reddit or other kinds. All resources should be free accessible. Do deep research on the sources to check if the are usefull for the app. Important is to know wich resources are used and how much they add to the result."

## Clarifications

### Session 2025-10-26

- Q: What similarity percentage should trigger duplicate detection? → A: 80%+ similarity threshold (industry standard for news deduplication)
- Q: What maximum timeout should be used for RSS feed HTTP requests? → A: 10 seconds
- Q: How should source contribution metrics be accessed? → A: API endpoint (future-proof for public display)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Collect from Multiple Dutch Healthcare RSS Feeds (Priority: P1)

The system automatically collects sentiment data from multiple Dutch healthcare and insurance-related RSS feeds each hour, combining articles from different sources to create a more comprehensive sentiment picture. Visitors see sentiment data that reflects multiple perspectives and sources.

**Why this priority**: This is the foundation of improved data quality. Without multiple RSS sources, sentiment analysis remains narrow and potentially biased. This directly addresses the core problem: "more resources are needed to get a better sentiment."

**Independent Test**: Can be fully tested by triggering data collection, verifying that articles are fetched from multiple RSS feeds (not just NU.nl), and confirming that sentiment calculations include data from all configured sources. Delivers immediate value by improving sentiment accuracy through diverse data sources.

**Acceptance Scenarios**:

1. **Given** the system has 5 RSS feeds configured, **When** hourly data collection runs, **Then** articles are fetched from all available feeds and combined into a single sentiment calculation
2. **Given** one RSS feed is temporarily unavailable, **When** data collection runs, **Then** sentiment is calculated from remaining available feeds with no collection failure
3. **Given** articles from multiple feeds are collected, **When** sentiment analysis runs, **Then** the system tracks which articles came from which source for attribution

---

### User Story 2 - Track Source Contribution and Quality (Priority: P2)

Administrators or analytics can view which data sources contributed to sentiment calculations and how much each source contributed (article count, sentiment impact). This provides transparency about data quality and source reliability.

**Why this priority**: This fulfills the requirement to "know which resources are used and how much they add to the result." Without this visibility, we cannot evaluate source quality or optimize the source mix.

**Independent Test**: Can be fully tested by viewing source contribution metrics after data collection, verifying that each source shows article counts and sentiment distribution. Delivers value by enabling data-driven decisions about which sources to keep, add, or remove.

**Acceptance Scenarios**:

1. **Given** sentiment data has been collected, **When** querying the source contribution API endpoint, **Then** each configured RSS feed shows total articles contributed and percentage of total dataset
2. **Given** different sources have different sentiment profiles, **When** querying the source contribution API endpoint, **Then** each source shows its sentiment distribution (positive/neutral/negative percentages)
3. **Given** a source has been unavailable for 24+ hours, **When** querying the source status API endpoint, **Then** the source is marked as inactive with timestamp of last successful fetch

---

### User Story 3 - Configure RSS Feed Sources (Priority: P3)

Administrators can add, remove, or temporarily disable RSS feed sources through configuration, allowing the system to adapt to new sources or remove unreliable ones without code changes.

**Why this priority**: This enables operational flexibility and iterative improvement. While important for long-term maintainability, the system can initially function with hardcoded sources.

**Independent Test**: Can be fully tested by modifying the RSS feed configuration, triggering data collection, and verifying that only active feeds are used. Delivers value by reducing deployment friction when adjusting data sources.

**Acceptance Scenarios**:

1. **Given** a new RSS feed URL is added to configuration, **When** the next collection cycle runs, **Then** articles from the new feed are included in sentiment analysis
2. **Given** an RSS feed is marked as disabled in configuration, **When** data collection runs, **Then** that feed is skipped but other feeds continue to be processed
3. **Given** RSS feed configuration is invalid (malformed URL, missing required fields), **When** system starts or configuration is reloaded, **Then** validation error is logged and system continues with valid feeds only

---

### User Story 4 - Prepare for Social Media Source Integration (Priority: P4)

The data collection architecture supports multiple source types (not just RSS), making it straightforward to add Reddit, Twitter/X, or other platforms in future iterations. The storage and analysis components handle articles generically without RSS-specific assumptions.

**Why this priority**: This is forward-looking preparation without immediate user value. It's important for avoiding technical debt but shouldn't block the primary RSS expansion work.

**Independent Test**: Can be tested by code review verifying that interfaces and data models don't assume RSS-only sources, and by creating a proof-of-concept non-RSS source adapter. Delivers value by reducing refactoring costs when adding new source types later.

**Acceptance Scenarios**:

1. **Given** the data collection system, **When** reviewing code architecture, **Then** source fetching is abstracted behind a common interface that doesn't assume RSS format
2. **Given** a new source type needs to be added, **When** implementing the source adapter, **Then** no changes to sentiment analysis or storage layers are required
3. **Given** multiple source types are active, **When** viewing sentiment data, **Then** source type (RSS, social media, etc.) is tracked alongside source name

---

### Edge Cases

- What happens when multiple RSS feeds have duplicate articles (same content, different URLs)? System detects duplicates using 80% similarity threshold on combined title and content, avoiding counting the same story multiple times in sentiment analysis
- How does the system handle RSS feeds with different update frequencies? Collect from all configured feeds on each cycle; some may return no new articles if they update less frequently
- What if one RSS feed dominates by volume (e.g., 100 articles vs 5 from others)? Consider implementing per-source article limits or weighted sampling to prevent single-source bias
- How should the system handle RSS feeds that become permanently defunct? Mark source as failed after N consecutive failures (e.g., 72 hours) and alert for manual review
- What happens when an RSS feed changes its sentiment profile dramatically? Track historical source sentiment profiles to detect anomalies; consider flagging sudden shifts for review
- How does the system handle RSS feeds with different content formats (full text vs summaries)? Extract available content (title + description + content fields); quality may vary but all contribute to sentiment
- What if an RSS feed requires authentication or API keys in the future? Design source configuration to support optional authentication parameters for future use

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST collect articles from at least 4 distinct Dutch healthcare-related RSS feeds during each collection cycle
- **FR-002**: System MUST combine articles from all available RSS feeds into a single sentiment calculation per collection cycle
- **FR-003**: System MUST continue sentiment collection even when individual RSS feeds are temporarily unavailable (graceful degradation)
- **FR-004**: System MUST track the source (feed name/identifier) for each article collected
- **FR-005**: System MUST store source contribution metrics including article count per source and timestamp of last successful fetch
- **FR-006**: System MUST provide an API endpoint exposing source contribution data for each sentiment data point (article counts, sentiment breakdown per source, fetch status)
- **FR-007**: System MUST detect and handle duplicate articles across different RSS feeds by comparing title and content similarity (80% or higher similarity threshold)
- **FR-008**: System MUST support RSS feed configuration including feed URL, name/identifier, category, and active/inactive status
- **FR-009**: System MUST validate RSS feed configuration on startup and log errors for invalid feeds without blocking valid feeds
- **FR-010**: System MUST track RSS feed reliability metrics (success rate, avgResponseTimeMs, consecutive failures) with a 10-second timeout per request
- **FR-011**: System MUST mark RSS feeds as inactive after 72 hours of consecutive failures
- **FR-012**: System MUST support multiple source types (RSS, future social media) through a common data collection interface
- **FR-013**: System MUST normalize articles from different sources into a consistent format for sentiment analysis
- **FR-014**: System MUST limit articles per source to 30 articles BEFORE deduplication to prevent single-source dominance, then apply deduplication across all collected articles
- **FR-015**: System MUST include source diversity metrics in sentiment data points (number of sources, distribution of articles across sources)

### RSS Feed Source Requirements

The following Dutch healthcare and insurance-related RSS feeds MUST be supported as initial sources (all freely accessible without authentication):

- **RS-001**: NU.nl Gezondheid (https://www.nu.nl/rss/Gezondheid) - Current source, general health news
- **RS-002**: NOS.nl Gezondheid (https://feeds.nos.nl/nosnieuwsgezondheid) - Public broadcaster, high credibility health news
- **RS-003**: RTL Nieuws Gezondheid (https://www.rtlnieuws.nl/feeds/rtlnieuws-gezondheid.xml) - Major news outlet, health focus
- **RS-004**: Zorgkrant RSS (https://www.zorgkrant.nl/feed/) - Healthcare industry publication, insurance and policy focus
- **RS-005**: Skipr.nl (https://www.skipr.nl/rss.xml) - Healthcare professional news, policy and system perspective

**Rationale for source selection**:

- Mix of general public news (NU.nl, NOS, RTL) and healthcare-specific publications (Zorgkrant, Skipr)
- Covers different perspectives: patient/public view, industry/professional view, policy/system view
- All sources are freely accessible via RSS without authentication
- Established, reputable Dutch sources with regular updates
- Balance between high-volume general news and focused healthcare content

### Source Configuration Format

- **SC-001**: Each RSS feed configuration MUST include: unique identifier, display name, feed URL, category (general/healthcare-specific), and active status
- **SC-002**: RSS feed configuration MUST support optional parameters: max articles per fetch, priority/weight, custom headers, timeout settings (default 10 seconds)
- **SC-003**: Configuration MUST be stored in a format that allows runtime updates without code changes (JSON, YAML, or environment variables)

### Key Entities

- **Data Source**: Represents a configured source of sentiment data (RSS feed, future social media account), including URL/identifier, source type (RSS/social/other), category, active status, and reliability metrics
- **Source Contribution**: Tracks how much each source contributed to a sentiment data point, including article count, sentiment breakdown from that source, fetch timestamp, and any fetch errors
- **Article**: Unified representation of content from any source type, including title, content/description, publication date, source identifier, and unique deduplication hash
- **Source Configuration**: Collection of all configured data sources with their parameters, used to drive data collection process

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Sentiment data points include articles from at least 3 different RSS sources per collection cycle (demonstrating multi-source collection)
- **SC-002**: System continues to produce sentiment data points even when up to 2 RSS feeds are unavailable (demonstrating graceful degradation)
- **SC-003**: Source contribution metrics show the distribution of articles across sources, with no single source contributing more than 60% of total articles (demonstrating source diversity)
- **SC-004**: Duplicate articles are detected and excluded at a rate of 95% or higher when the same story appears on multiple feeds (demonstrating deduplication effectiveness)
- **SC-005**: RSS feed failures are detected and logged within 1 collection cycle, with feeds marked inactive after 72 hours of consecutive failures
- **SC-006**: Adding a new RSS feed requires only configuration changes without code deployment (demonstrating configuration flexibility)
- **SC-007**: Source contribution data is accessible via API endpoint for every sentiment data point, showing which sources contributed how many articles
- **SC-008**: Collection success rate across all sources averages 90% or higher over a 7-day period (demonstrating source reliability)
- **SC-009**: The data collection architecture supports adding non-RSS sources through a common interface without modifying sentiment analysis code (demonstrating extensibility for future source types)
- **SC-010**: Sentiment accuracy improves measurably with multi-source data compared to single-source baseline (e.g., sentiment variance/confidence increases by 20%+)

## Assumptions

- All identified RSS feeds remain freely accessible without authentication or API keys during MVP phase
- RSS feeds update at varying frequencies; hourly collection will capture new content from most sources
- Dutch language content dominates all sources; non-Dutch content will be minimal and acceptable
- RSS feed XML formats follow standard RSS 2.0 or Atom specifications; minor variations can be handled
- Article deduplication uses 80% similarity threshold on combined title and content text
- Source contribution metrics are accessible via API endpoint for internal monitoring; public UI display is deferred to future phases
- RSS feed reliability issues (timeouts, rate limits, outages) are transient; permanent failures are rare
- Administrative access for source configuration will use existing deployment processes (environment variables or config files)
- The sentiment analysis algorithm remains consistent across sources; no source-specific tuning is required
- Social media sources (Twitter, Reddit) are planned but not implemented in this feature; architecture preparation is sufficient
- Baseline sentiment metrics from single-source operation (NU.nl only) will be measured during the first week of November 2025 to establish a comparison point for SC-010 (20%+ variance improvement validation)

## Scope

### In Scope for This Feature

- Expansion from 1 RSS feed (NU.nl) to 5 diverse Dutch healthcare RSS feeds
- Multi-source data collection with graceful degradation when individual sources fail
- Source contribution tracking (article count, sentiment breakdown per source)
- API endpoint for accessing source contribution metrics and source status
- Article deduplication across sources
- RSS feed configuration system (add/remove/disable sources without code changes)
- Source reliability monitoring (success rate, consecutive failures, inactive marking)
- Architecture preparation for future non-RSS sources (common interface, generic article model)
- Per-source article limits to prevent dominance
- Source diversity metrics in sentiment data points

### Explicitly Out of Scope for This Feature

- Integration with social media platforms (Twitter, Reddit, etc.) - deferred to future features
- User-facing UI for source attribution display - API structure supports future implementation
- Real-time source monitoring dashboard - API provides data, UI deferred to future features
- Automated source discovery or recommendation system
- Machine learning-based duplicate detection - using simple title/content similarity matching
- Source credibility scoring or weighting based on reliability history
- User-facing display of source attribution ("this sentiment includes X articles from NU.nl") - internal tracking only
- Multi-language source support (English, German, etc.) - Dutch sources only
- RSS feed content quality filtering (spam detection, relevance scoring)
- Historical source contribution analysis or trend reporting
- API for third parties to suggest or submit new sources
- Source category-based sentiment breakdowns (general news vs healthcare-specific)
- Advanced deduplication using article embeddings or NLP similarity
- Source-specific sentiment analysis tuning or bias correction
- Automatic removal of consistently unreliable sources
- Source authentication or paid feed subscriptions
