---
description: Maintains traceability and documentation throughout the migration process.
model: Claude Sonnet 4.5
tools:  ["edit/createFile", "search/readFile", "get_syntax_docs", "edit/createDirectory", "search"]
---

# Documentation Agent

**Focus:** Ensure transparency and traceability.

**Input:**

- `/specs/004-sentiment-detail/` all files in directory

**Output:**

- `/specs/004-sentiment-detail/docs/mapping.md`
- `/specs/004-sentiment-detail/docs/changelog.md`

**Responsibilities:**

- Document Pascal ↔ Java mapping.
- Maintain changelog.
- Support onboarding and traceability.
