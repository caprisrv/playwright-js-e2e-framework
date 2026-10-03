# Playwright JavaScript E2E Framework — Phase 1 Architecture

## 1. One-Line Architecture

A Playwright JavaScript E2E framework that discovers individual test scenarios, dynamically shards them, executes them in parallel through GitHub Actions, retries only unresolved failures, persists execution history, aggregates final scenario status, performs historical validation, and publishes a consolidated report as a GitHub Actions artifact.

---

## 2. Phase 1 Objective

Phase 1 establishes the core Playwright automation framework and CI/CD execution architecture.

The objective is to build a scalable, maintainable, portfolio-quality Playwright JavaScript E2E framework that supports:

- Page Object Model
- Component Object architecture
- Playwright fixtures
- Environment-aware execution
- Secure credential handling
- Native Playwright test tagging
- Scenario-level test discovery
- Dynamic scenario-level sharding
- Parallel execution
- GitHub Actions dynamic matrix execution
- Retry-only-failed-scenarios
- Persistent execution results
- Retry history
- Run-level execution tracking
- Historical validation of previously unresolved scenarios
- Final scenario-status aggregation
- Consolidated reporting
- Daily scheduled regression execution

The framework separates:

- Business/test logic
- Framework execution logic
- CI/CD orchestration
- Result persistence
- Result aggregation
- Reporting

The framework is designed so that GitHub Actions orchestrates the execution while reusable JavaScript utilities provide the framework-level execution and result-processing logic.

---

# 3. Phase 1 Status

Phase 1 is complete.

The following capabilities have been implemented and validated:

| Capability | Status |
|---|---|
| Playwright JavaScript | Complete |
| Page Object Model | Complete |
| Component Object architecture | Established |
| Playwright fixtures | Complete |
| Environment configuration | Complete |
| Secure credentials | Complete |
| Test tagging | Complete |
| Scenario discovery | Complete |
| Scenario-level sharding | Complete |
| GitHub Actions dynamic matrix | Complete |
| Parallel execution | Complete |
| Retry-only-failed-scenarios | Complete |
| Retry history | Complete |
| Execution result persistence | Complete |
| Cross-workflow result discovery | Complete |
| Historical Validation | Complete |
| Final scenario aggregation | Complete |
| Consolidated reporting | Complete |
| GitHub Actions artifact reporting | Complete |
| Daily scheduled regression | Complete |

### Reporting Decision

The current Phase 1 implementation uses:

1. Playwright HTML reporting for individual execution jobs.
2. A framework-generated consolidated scenario report based on normalized execution results.
3. GitHub Actions artifacts for report persistence.

GitHub Pages is intentionally **not part of the Phase 1 architecture**.

A genuine ExtentReports integration may be considered as a future enhancement, but it is not required for Phase 1.

---

# 4. Interview Explanation

A concise explanation of the Phase 1 architecture:

> "I designed the framework around scenario-level execution rather than file-level execution. Playwright is the test engine, while the framework owns test discovery, dynamic sharding, retry-only-failed-scenarios, result normalization, persistence, and aggregation.
>
> GitHub Actions acts as the CI orchestration layer. It dynamically creates parallel shard jobs based on the discovered scenarios. Each logical execution is associated with a run ID, and every shard persists normalized execution results.
>
> When failures occur, only the scenarios that failed in the previous execution are selected for retry. Retry executions are represented as separate workflow runs while preserving their relationship to the original source run.
>
> At the terminal state, the framework combines the execution history and determines the final status of every scenario. This consolidated result is then used to generate the final report.
>
> The architecture also supports Historical Validation, where unresolved scenarios from a previous run can be executed against an automation-fix branch without modifying the original source run.
>
> The key principle is that GitHub Actions orchestrates the CI workflow while the JavaScript framework owns reusable execution, result-processing, retry, aggregation, and validation logic."

---

# 5. Key Architectural Principles

1. Keep tests focused on business behavior.
2. Keep locators inside Page Objects or Component Objects.
3. Prefer Playwright-native capabilities.
4. Shard individual scenarios rather than entire files.
5. Keep framework execution logic separate from CI orchestration.
6. Retry only scenarios that failed in the previous attempt.
7. Preserve complete execution history.
8. Use a `runId` to identify one logical execution.
9. Never modify historical source runs.
10. Use a new run ID for Historical Validation.
11. Keep framework artifacts separate from Playwright-managed artifacts.
12. Treat normalized execution results as the framework contract.
13. Keep CI jobs independently executable.
14. Build reporting from persisted execution evidence.
15. Never weaken tests to make them pass.
16. Prefer maintainability and observability over clever abstractions.
17. Introduce complexity incrementally.
18. Prefer Playwright-native functionality before custom framework functionality.
19. Keep CI orchestration in GitHub Actions.
20. Keep reusable framework logic in JavaScript.
21. Do not duplicate framework behavior unnecessarily inside YAML.
22. Preserve execution history across retries.
23. Determine final scenario status from the complete execution history.
24. Historical Validation must never modify the original source run.

---

# 6. High-Level Architecture

```text
                         Developer
                             |
                             v
                    GitHub Repository
                             |
                             v
                    GitHub Actions
                             |
              +--------------+--------------+
              |                             |
              v                             v
        Full Suite Run              Historical Validation
              |                             |
              v                             v
       Test Discovery                Source Run Discovery
              |                             |
              v                             v
      Scenario Selection            Final Unresolved Failures
              |                             |
              v                             |
      Dynamic Shard Plan                    |
              |                             |
              +-------------+---------------+
                            |
                            v
                    Dynamic Matrix
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
          Shard 1        Shard 2        Shard N
             |              |              |
             v              v              v
        Playwright     Playwright     Playwright
             |              |              |
             v              v              v
        Result JSON     Result JSON     Result JSON
             |              |              |
             +--------------+--------------+
                            |
                            v
                 Persist Execution Results
                            |
                            v
                    Failure Detection
                            |
                            v
                Failed Scenarios Only
                            |
                            v
                     Retry Workflow
                            |
                            v
                Additional Retry Attempts
                            |
                            v
                  Result Aggregation
                            |
                            v
                 Final Scenario Status
                            |
                            v
                 Consolidated Report
                            |
                            v
              GitHub Actions Artifact