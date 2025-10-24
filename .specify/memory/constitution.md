<!--
Sync Impact Report:
- Version change: new → 1.0.0
- Added principles: MVP-First, Real-Time Data Accuracy, Code Quality, API-First Design, Observability
- Added sections: Data Requirements, Development Workflow
- Templates requiring updates: ✅ updated
- Follow-up TODOs: none
-->

# Zorg-Sentiment Constitution

## Core Principles

### I. MVP-First Development

Every feature must deliver user value incrementally. Start with the simplest viable implementation and iterate based on user feedback. Features must be independently testable and deployable. No feature may be considered complete until it demonstrates measurable user value in the context of Dutch healthcare sentiment analysis.

### II. Real-Time Data Accuracy (NON-NEGOTIABLE)

Data freshness and accuracy are paramount. All social media and news data must be collected, processed, and displayed with timestamps. Sources must be traceable and verifiable. Sentiment analysis results must include confidence scores. Data older than 24 hours must be clearly marked. No synthetic or mock data in production.

### III. Code Quality & Structure

Code must be clean, well-documented, and maintainable. Every module must have a single responsibility. Dependencies must be minimal and justified. All code must pass linting and type checking. Public APIs must have comprehensive documentation with examples.

### IV. API-First Design

All functionality must be accessible via clean, documented APIs. Web interface consumes the same APIs as external users. API contracts must be versioned and backward-compatible. All endpoints must support both JSON and human-readable formats for debugging.

### V. Observability & Monitoring

System behavior must be transparent and debuggable. All data collection, processing, and analysis must be logged with structured formatting. Performance metrics, error rates, and data source health must be monitored. Real-time dashboard must show system status alongside sentiment data.

## Data Requirements

Data collection must respect privacy laws (GDPR) and platform terms of service. All collected data must be anonymized before processing. Source attribution must be maintained for transparency while protecting individual privacy. Data retention policies must be clearly defined and automatically enforced.

## Development Workflow

All changes must be developed on feature branches with clear naming (001-feature-name). Code reviews are mandatory for all changes. No direct commits to main branch. Features must include automated tests before deployment. Production deployments require approval and rollback capability.

## Governance

This constitution supersedes all other development practices. Amendments require documentation of impact, approval from project maintainers, and migration plan for existing code. All pull requests must verify compliance with these principles. Complexity must be justified against user value.

**Version**: 1.0.0 | **Ratified**: 2025-10-24 | **Last Amended**: 2025-10-24
