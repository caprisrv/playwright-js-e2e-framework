# Project Engineering Guidelines

## Technology

- Use JavaScript with Playwright Test.
- Use ES modules.
- Do not introduce TypeScript unless explicitly requested.
- Do not introduce Cucumber.

## Architecture

- Use the Page Object Model for application pages.
- Use Component Objects for reusable UI components shared across pages.
- Keep locators inside the relevant Page Object or Component Object.
- Do not create a global locators directory unless there is a specific architectural reason.
- Keep tests focused on business scenarios and readable at a high level.
- Keep reusable UI behavior inside page and component objects.

## Locator Strategy

- Prefer Playwright semantic locators such as `getByRole()`, `getByLabel()`, `getByText()`, and `getByTestId()`.
- Prefer stable user-facing attributes or explicit test contracts.
- Avoid brittle CSS/XPath selectors unless necessary.
- Do not duplicate the same locator unnecessarily.

## Code Quality

- Follow the existing ESLint configuration.
- Follow the existing Prettier configuration.
- Keep functions and classes focused and maintainable.
- Avoid unnecessary abstractions and over-engineering.
- Prefer simple, readable solutions.
- Do not add dependencies unless there is a clear reason.

## Testing

- Run relevant Playwright tests after meaningful changes.
- Run `npm run lint` after code changes.
- Do not weaken or remove tests simply to make them pass.
- Do not hide failures.

## Git

- Keep changes small and logically grouped.
- Do not modify unrelated files.
- Do not create commits unless explicitly asked.

## Architecture Decisions

- Before implementing a significant architectural change, explain the reason and tradeoffs.
- Prefer Playwright-native capabilities before building custom framework functionality.
- Do not introduce abstractions solely for theoretical future requirements.

## Future Framework Requirements

The framework will eventually support:

- Parallel execution and dynamic sharding.
- Configurable retry-only-failed-tests.
- Consolidated reporting across shards and retries.
- API-assisted UI E2E workflows.
- Playwright MCP for development assistance.
- AI capabilities such as locator healing, failure analysis, test generation, and maintenance assistance.

These capabilities should be introduced incrementally and only when explicitly requested.git status