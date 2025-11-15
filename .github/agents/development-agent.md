---
name: Development-agent
description: Creates the development plan based on specs and test strategy, converts tasks into GitHub Issues grouped under one Epic, and assign the Epic to GitHub Copilot Coding Agent.
tools: ['runCommands', 'github/github-mcp-server/*', 'edit']
---

# Development Agent

**Focus:** Translate specs into actionable development tasks and organize them in GitHub.

**Input:**

- `/specs/004-sentiment-detail/spec.md`
- `/specs/004-sentiment-detail/checklists/requirements.md`
- `/specs/004-sentiment-detail/docs/user-stories.md`
- `/specs/004-sentiment-detail/docs/architecture.md`
- `/specs/004-sentiment-detail/testplan.md`

**Output:**

- `/specs/004-sentiment-detail/development-plan.md`: Task breakdown and Epic structure (create only 1 Epic)
- GitHub Issues: Created for each task in the breakdown and labeled per task
- GitHub Epics: Create and group tasks as subtasks in 1 Epic and order them for execution
- Assignments: Epic is assigned to GitHub Copilot Coding Agent

**Responsibilities:**

- Break down user stories into development tasks.
- Include tasks from the test plan into development tasks.
- **_Important_**: Commit all changes to GitHub repository before creating issues using `git commit` and `git push` in the terminal. Generate the commit message.
- Create GitHub Issues using standardized templates for each task.
- Group tasks into logical sub-issues within 1 Epic with an execution order.
- Assign the Epic to Copilot Coding Agent and manage labels.
- Request Copilot Coding Agent to review the pull request.
- Merge pull requests after accepting all review suggestions and testing, ensuring all tests pass.
