# Documentation Index

Welcome to the Zorg Sentiment Dashboard documentation!

## 📖 Quick Navigation

### Getting Started

Start here if you're new to the project:

1. **[Getting Started Guide](guides/getting-started.md)** - Installation and first run
2. **[Local Testing Guide](guides/local-testing.md)** - Test the application locally

### Guides

**For Users & Operators:**

- **[Reddit Integration](guides/reddit-integration.md)** - Configure Reddit as a data source
- **[Operations Guide](guides/operations.md)** - Monitoring, maintenance, and troubleshooting

**For Developers:**

- **[Contributing Guide](../CONTRIBUTING.md)** - Development workflow and standards
- **[Extending Sources](guides/extending-sources.md)** - Add new data source adapters
- **[Mermaid Diagram Guide](mermaid-guide.md)** - Create diagrams in documentation

### Technical Documentation

**Architecture:**

- **[Multi-Source Design](architecture/multi-source-design.md)** - System architecture and design patterns

**API:**

- **[API Reference](api/)** - Complete endpoint documentation

### Testing & Deployment

- **[Local Testing](guides/local-testing.md)** - Comprehensive testing guide
- **[Testing Trends](testing-trends.md)** - Trend-specific testing
- **[Edge Cases Testing](guides/edge-cases-testing.md)** - Edge case scenarios
- **[Deployment Checklist](guides/deployment.md)** - Pre-deployment validation

### Feature Specifications

Detailed specifications for each feature:

- **[Feature 001: MVP Dashboard](../specs/001-mvp-sentiment-dashboard/)** - Core sentiment visualization
- **[Feature 002: Multi-Source Collection](../specs/002-multi-source-sentiment/)** - Orchestrator and adapters
- **[Feature 003: Reddit Integration](../specs/003-reddit-integration/)** - Reddit API integration

## 📂 Documentation Structure

```
zorg-sentiment-v2/
├── README.md                          # This file
├── mermaid-guide.md                  # Diagram creation guide
├── testing-trends.md                 # Trend testing guide
├── guides/                            # User & developer guides
│   ├── getting-started.md            # Installation and setup
│   ├── local-testing.md              # Testing guide
│   ├── edge-cases-testing.md         # Edge case scenarios
│   ├── deployment.md                 # Deployment validation
│   ├── reddit-integration.md         # Reddit configuration
│   ├── operations.md                 # Monitoring & maintenance
│   └── extending-sources.md          # Adding new sources
├── architecture/                      # Technical design
│   └── multi-source-design.md        # Architecture overview
└── api/                              # API documentation
    └── README.md                     # Endpoint reference
```

## 🎯 Documentation by Role

### I want to run the dashboard locally

→ **[Getting Started Guide](guides/getting-started.md)**

### I want to add Reddit as a data source

→ **[Reddit Integration Guide](guides/reddit-integration.md)**

### I want to monitor the production system

→ **[Operations Guide](guides/operations.md)**

### I want to contribute code

→ **[Contributing Guide](../CONTRIBUTING.md)**

### I want to add a new data source

→ **[Extending Sources Guide](guides/extending-sources.md)**

### I want to understand the architecture

→ **[Multi-Source Design](architecture/multi-source-design.md)**

### I want to use the API

→ **[API Reference](api/)**

### I want to test before deploying

→ **[Deployment Checklist](guides/deployment.md)**

## 🔍 Search Tips

Looking for specific information?

- **Setup & Installation** → Getting Started Guide
- **Testing** → Local Testing Guide or Edge Cases Testing
- **Configuration** → Getting Started or Reddit Integration
- **Monitoring** → Operations Guide
- **API Endpoints** → API Reference
- **Architecture** → Multi-Source Design
- **Data Sources** → Extending Sources Guide
- **Reddit** → Reddit Integration Guide
- **Deployment** → Deployment Checklist
- **Development** → Contributing Guide

## 📝 Documentation Standards

When updating documentation:

1. **Keep it current** - Update docs when code changes
2. **Be specific** - Include code examples and screenshots
3. **Link between docs** - Reference related documentation
4. **Test instructions** - Verify all commands work
5. **Use clear language** - Write for your audience

## 🤝 Contributing to Docs

Found an issue or want to improve the documentation?

1. Check the [Contributing Guide](../CONTRIBUTING.md)
2. Make your changes
3. Test any code examples
4. Submit a pull request

## 📚 External Resources

- **Nuxt Documentation**: https://nuxt.com/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Reddit API**: https://www.reddit.com/dev/api
- **Sentiment.js**: https://github.com/thisandagain/sentiment

---

**Last Updated**: November 10, 2025  
**Documentation Version**: 1.0.0
