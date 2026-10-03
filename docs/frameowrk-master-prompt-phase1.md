# PLAYWRIGHT JAVASCRIPT E2E FRAMEWORK
# PHASE 1 — COMPLETE RECREATION PROMPT

## ROLE

Act as a Senior SDET, Automation Architect, JavaScript Engineer, and CI/CD Engineer.

Build a professional, maintainable, portfolio-quality Playwright JavaScript E2E automation framework from scratch.

This is a learning project as well as an engineering project.

I want to understand the architecture and reasoning behind the implementation, not simply receive code.

The goal is to recreate a complete Phase 1 framework that can be confidently explained in technical interviews.

---

# 1. IMPORTANT WORKING RULES

Follow these rules throughout the entire implementation.

## Incremental Implementation

Do NOT generate the entire framework in one step.

Build the framework incrementally.

Before every significant architectural change, explain:

1. What we are changing.
2. Why we need it.
3. The alternatives considered.
4. Why the selected approach fits this framework.
5. Which files will change.
6. How the change will be validated.

Then implement the change.

Keep changes small and logically grouped.

---

## Repository Inspection

Before implementing anything:

1. Inspect the repository.
2. Inspect the existing package.json.
3. Inspect the existing Playwright configuration.
4. Inspect existing tests.
5. Inspect existing pages.
6. Inspect fixtures.
7. Inspect utilities.
8. Inspect GitHub Actions workflows.
9. Inspect AGENTS.md if present.
10. Inspect documentation if present.

Do not overwrite existing work blindly.

First determine:

- What already exists.
- What is correct.
- What is incomplete.
- What conflicts with the Phase 1 architecture.
- What needs to be added.
- What should remain unchanged.

Then provide a concise implementation plan.

Do not start implementation until the repository inspection is complete.

---

# 2. TECHNOLOGY REQUIREMENTS

Use:

- JavaScript
- Node.js
- Playwright Test
- ES Modules
- GitHub Actions
- ESLint
- eslint-plugin-playwright
- Prettier
- dotenv where appropriate

Do NOT introduce:

- TypeScript
- Cucumber
- Selenium
- Java-based test frameworks

unless explicitly requested.

The primary automation engine is Playwright Test.

---

# 3. PHASE 1 SCOPE

This prompt covers ONLY Phase 1.

Phase 1 is:

## Core Playwright Framework + CI/CD

The completed Phase 1 framework must support:

1. Page Object Model
2. Component Object architecture
3. Playwright fixtures
4. Environment configuration
5. Secure credential handling
6. Native Playwright test tagging
7. Scenario-level test discovery
8. Dynamic scenario-level sharding
9. GitHub Actions dynamic matrix execution
10. Parallel execution
11. Retry-only-failed-scenarios
12. Retry history
13. Persistent execution results
14. Run-level execution tracking
15. Cross-workflow execution-result discovery
16. Historical Validation
17. Final scenario-status aggregation
18. Consolidated scenario reporting
19. GitHub Actions artifact reporting
20. Daily scheduled regression
21. Security and maintainability controls
22. Local validation of all important workflows

Do NOT implement Phase 2, Phase 3, or Phase 4.

---

# 4. OUT OF SCOPE

Do NOT implement:

## Phase 2

- API-assisted E2E
- API setup/cleanup
- API verification

## Phase 3

- Playwright MCP
- AI-assisted exploration
- AI locator discovery
- AI test generation

## Phase 4

- Jira story ingestion
- AI test-plan generation
- AI-generated Playwright tests
- AI failure classification
- AI automation repair
- AI-created Jira defects
- AI-generated Pull Requests
- Autonomous AI agents

These are future phases and must not be implemented as part of this task.

You may preserve extension points where appropriate, but do not build the future system now.

---

# 5. REPORTING DECISION

The Phase 1 reporting architecture is intentionally simple.

Current reporting consists of:

1. Playwright HTML report for individual execution jobs.
2. Framework-generated consolidated scenario report.
3. GitHub Actions artifact containing the consolidated report.

DO NOT implement GitHub Pages.

The repository may be private, and GitHub Pages is intentionally excluded from this architecture.

DO NOT make genuine ExtentReports a Phase 1 dependency.

A future ExtentReports integration may be considered later, but Phase 1 should use the consolidated scenario report based on normalized execution results.

Do not falsely describe the current report as an ExtentReports implementation.

---

# 6. ARCHITECTURAL PRINCIPLES

Follow these principles:

1. Keep tests focused on business behavior.
2. Keep locators inside Page Objects or Component Objects.
3. Prefer Playwright-native capabilities.
4. Treat individual scenarios as the execution unit.
5. Keep framework execution logic separate from CI orchestration.
6. Retry only scenarios that failed in the previous attempt.
7. Preserve complete execution history.
8. Use a runId to identify a logical execution.
9. Never modify historical source runs.
10. Use a new run ID for Historical Validation.
11. Keep framework artifacts separate from Playwright-managed artifacts.
12. Treat normalized execution results as the framework contract.
13. Keep CI jobs independently executable.
14. Build reporting from persisted execution evidence.
15. Never weaken tests to make them pass.
16. Prefer maintainability and observability over clever abstractions.
17. Introduce complexity incrementally.
18. Prefer Playwright-native functionality before custom functionality.
19. Keep CI orchestration in GitHub Actions.
20. Keep reusable execution logic in JavaScript.
21. Do not duplicate framework behavior unnecessarily inside YAML.
22. Preserve retry history.
23. Determine final scenario status from complete execution history.
24. Historical Validation must never modify the original source run.
25. Do not introduce abstractions only for theoretical future requirements.

---

# 7. PAGE OBJECT MODEL

Use Page Object Model.

Rules:

- Locators belong inside the relevant Page Object.
- Tests describe business scenarios.
- Page Objects contain reusable UI behavior.
- Avoid global locator files unless there is a clear architectural reason.
- Prefer semantic Playwright locators.
- Prefer stable application contracts.
- Avoid brittle CSS/XPath selectors when better locators exist.

Preferred locator order:

- getByRole()
- getByLabel()
- getByText()
- getByTestId()

Stable IDs or application-specific attributes may be used when appropriate.

---

# 8. COMPONENT OBJECTS

Support Component Objects for reusable UI components shared across multiple pages.

Examples:

- Navigation
- Header
- Cart icon
- Modal
- Toast
- Date picker

Do not create Component Objects unless there is a real reusable component that justifies the abstraction.

---

# 9. FIXTURES

Use Playwright fixtures for reusable application setup and state.

Examples:

- loggedInPage
- ProductsPage
- CartPage

Fixtures should:

- Reduce repetitive setup.
- Keep tests readable.
- Provide commonly required application state.
- Avoid unnecessary abstraction.

Do not use fixtures for trivial functionality.

---

# 10. ENVIRONMENT CONFIGURATION

Support environment-specific configuration.

Expected structure:

```text
config/
└── environments/
    ├── qa.json
    └── staging.json