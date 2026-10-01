One-Line Architecture
## One-Line Architecture

A Playwright JavaScript E2E framework that discovers individual scenarios, dynamically shards them, executes them in parallel through CI, retries only unresolved failures, persists complete execution history, aggregates final scenario status, publishes consolidated reports, and eventually evolves into an AI-enabled Quality Engineering platform that can understand Jira/Rally stories, generate auditable test plans and Playwright automation, analyze failures, repair automation defects, validate fixes, and identify genuine application defects without masking them.

Interview Explanation
A concise explanation of the architecture:
## Interview Explanation

A concise explanation of the architecture:

"I designed the framework around scenario-level execution rather than file-level execution. Playwright is used as the test engine, while the framework owns discovery, dynamic sharding, retry-only-failed-tests, result normalization, persistence, and aggregation. GitHub Actions acts as the orchestration layer and dynamically creates parallel shard jobs. Every logical run has a runId, and retries remain part of that run while preserving execution history.

The architecture also supports a second Historical Validation mode, where unresolved failures from a previous run can be executed against an automation-fix branch.

The long-term vision is to evolve this into an AI-enabled Quality Engineering platform. An AI agent could take a Jira or Rally story, understand its acceptance criteria, explore the application, create a Markdown test plan, generate Playwright JavaScript tests and Page Objects, execute them through the deterministic framework, analyze failures, repair automation issues, validate those fixes, and identify genuine application defects when the problem is in the application rather than the automation.

The key architectural principle is that AI provides intelligence around the testing lifecycle, while the Playwright framework remains the deterministic execution engine. AI must preserve test intent and must never modify automation simply to make a test pass or mask a genuine application defect."

Key Architectural Principles
1. Keep tests focused on business behavior.
2. Keep locators inside Page Objects or Components.
3. Prefer Playwright-native capabilities.
4. Shard individual scenarios, not files.
5. Keep framework execution logic separate from CI orchestration.
6. Retry only scenarios that failed in the previous attempt.
7. Preserve complete execution history.
8. Use one runId for one logical run.
9. Never modify historical source runs.
10. Use a new runId for Historical Validation.
11. Keep framework artifacts separate from Playwright-managed artifacts.
12. Treat normalized execution results as the framework contract.
13. Keep CI jobs independently executable.
14. Build reporting from persisted execution evidence.
15. Never weaken tests to make them pass.
16. AI must preserve test intent.
17. AI must distinguish automation failures from application defects.
18. Human review remains required for important automation changes.
19. Introduce complexity incrementally.
20. Prefer maintainability and observability over clever abstractions.
21. AI is an intelligence layer around the deterministic Playwright execution engine.
22. AI-generated automation must follow the same framework architecture and coding standards as manually created automation.
23. AI must preserve the intent of the original story, acceptance criteria, and test plan.
24. AI must distinguish automation defects, application defects, and infrastructure/environment issues using available evidence.
25. AI must never weaken assertions or remove coverage simply to make tests pass.
26. AI-generated changes must be validated through the deterministic framework before being considered successful.
27. AI-generated automation fixes should be validated against the exact scenarios that originally failed.
28. AI actions and decisions should preserve traceability back to the originating Jira/Rally story and execution run.
29. Human review remains required for consequential changes such as merging automation fixes or accepting significant defect classifications.
30. AI capabilities should be introduced incrementally as specialized agents rather than as one monolithic autonomous system.

# Playwright JavaScript E2E Framework — Architecture

## 1. Objective

# 1. Objective

Build a scalable, maintainable, portfolio-quality Playwright JavaScript E2E automation framework that supports:

- Page Object Model
- Component Objects
- Environment-aware execution
- Scenario-level test discovery
- Dynamic scenario-based sharding
- Parallel execution
- Retry-only-failed-tests
- Consolidated reporting
- Persistent execution artifacts
- Run-level execution tracking
- Historical validation of previously failed scenarios
- API-assisted E2E workflows
- Playwright MCP for development assistance
- GitHub Actions CI/CD
- GitHub Pages reporting

The framework should separate:

- Test/business logic
- Framework execution logic
- CI/CD orchestration
- Result persistence
- Reporting
- AI capabilities

The goal is to create a framework that can scale from local development to large regression suites executed across multiple CI jobs.

## Long-Term AI Quality Engineering Vision

The framework should eventually evolve into an AI-enabled Quality Engineering platform capable of supporting the complete lifecycle from requirement to validated automation.

The long-term workflow is:

```text
Jira / Rally Story
        |
        v
Story Understanding
        |
        v
Markdown Test Plan
        |
        v
Application Exploration
        |
        v
Playwright Test + Page Object Generation
        |
        v
Deterministic Framework Execution
        |
        v
Failure Analysis
        |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
Automation Defect       Application Defect     Infrastructure Issue
        |                      |                      |
        v                      v                      v
Automation Repair       Jira / Rally Defect     Investigation
        |
        v
Historical Validation
        |
        v
Pull Request
        |
        v
Human Review

---

# 2. Technology Stack

## Core

- JavaScript
- Node.js
- Playwright Test
- ES Modules

## Code Quality

- ESLint
- eslint-plugin-playwright
- Prettier

## CI/CD

- GitHub
- GitHub Actions
- GitHub Actions dynamic matrix

## Reporting

Current:
- Playwright HTML report

Future:
- Consolidated Extent Report
- GitHub Pages deployment

## AI / Development Assistance

Future:
- Playwright MCP
- AI-assisted failure analysis
- Locator healing
- Test generation
- Automation maintenance

---

# 3. High-Level Architecture

```text
Developer
    |
    v
GitHub Repository
    |
    v
GitHub Actions
    |
    +------------------------------+
    |                              |
    | Full Suite                   | Historical Validation
    |                              |
    v                              v
Test Discovery              Load Source Run
    |                              |
    v                              v
Scenario Selection          Final Unresolved Failures
    |                              |
    v                              |
Dynamic Shard Planning             |
    |                              |
    +--------------+---------------+
                   |
                   v
          Scenario Execution
                   |
                   v
             Playwright
                   |
                   v
          Normalized Results
                   |
          +--------+--------+
          |                 |
          v                 v
     Persistence        Retry Manager
          |                 |
          |                 v
          |          Failed Scenarios Only
          |                 |
          |                 v
          |          Retry Execution
          |                 |
          +--------+--------+
                   |
                   v
          Result Aggregation
                   |
                   v
          Final Scenario Status
                   |
                   v
          Consolidated Reporting
                   |
                   v
             GitHub Pages


---

# 5. Add this section after your High-Level Architecture

Your existing architecture diagram is already good for the **deterministic framework**.

I would **not replace it**.

Instead, add this immediately after it:

```markdown
---

# 4. Future AI-Enabled Architecture

The deterministic Playwright framework is the foundation of the future AI architecture.

The AI layer should interact with the framework rather than replace it.

```text
                         Jira / Rally
                              |
                              v
                         Story Agent
                              |
                              v
                    Structured Story Model
                              |
                              v
                    Test Planning Agent
                              |
                              v
                     Markdown Test Plan
                              |
                              v
              Application Exploration Agent
                              |
                              v
                       Playwright MCP
                              |
                              v
                  Application Evidence
                              |
                              v
                   Test Generation Agent
                              |
                              v
              Playwright JS + Page Objects
                              |
                              v
                 Deterministic Framework
                              |
                              v
                    GitHub Actions / CI
                              |
                              v
                       Test Execution
                              |
                              v
                    Failure Analysis Agent
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
        Automation       Application     Infrastructure
          Defect            Defect           Issue
              |               |               |
              v               v               v
       Repair Agent       Jira/Rally      Investigation
              |
              v
       Historical Validation
              |
              v
              PR
              |
              v
        Human Review


---

# 6. Add the AI agents section

After that, add:

```markdown
---

# 5. Future AI Agents

The long-term architecture should use specialized agents rather than one monolithic AI agent.

## Story Agent

The Story Agent is responsible for understanding the source requirement.

Input:

- Jira Story ID
- Rally Story ID

Responsibilities:

- Retrieve the relevant story.
- Understand the story description.
- Extract acceptance criteria.
- Identify business rules.
- Identify functional requirements.
- Identify testable conditions.
- Identify relevant linked information or attachments where accessible.
- Preserve traceability to the original story.

Output:

- Structured Story Model

The Story Agent should not generate Playwright code directly.

It should provide a reliable structured representation of the requirement to the downstream Test Planning Agent.

If required information is missing or ambiguous, the agent should identify the ambiguity rather than inventing requirements.

---

## Test Planning Agent

The Test Planning Agent converts the Structured Story Model into an auditable Markdown test plan.

Responsibilities:

- Analyze acceptance criteria.
- Identify positive scenarios.
- Identify negative scenarios where appropriate.
- Identify boundary and validation scenarios where applicable.
- Define preconditions.
- Define test steps.
- Define expected results.
- Identify required test data.
- Maintain traceability between scenarios and acceptance criteria.

Output:

- Markdown test plan

The Markdown test plan becomes the intermediate artifact between the business requirement and the generated automation.

The agent should not assume application behavior that has not been established by the story or application exploration.

---

## Application Exploration Agent

The Application Exploration Agent is responsible for exploring the actual application before automation is generated.

Responsibilities:

- Navigate the application.
- Identify relevant pages and workflows.
- Identify UI elements.
- Identify navigation paths.
- Identify forms and controls.
- Identify possible stable locators.
- Understand the actual application behavior.
- Capture relevant exploration evidence.

The agent may use Playwright MCP as the browser interaction and exploration mechanism.

Output:

- Application exploration evidence
- Relevant pages and workflows
- Locator information
- Navigation information
- Observed application behavior

The agent should prefer evidence from the actual application over assumptions.

---

## Test Generation Agent

The Test Generation Agent converts the test plan and application exploration results into Playwright automation.

Input:

- Structured Story Model
- Markdown Test Plan
- Application Exploration Evidence
- Existing Framework Architecture

Responsibilities:

- Generate Playwright JavaScript test files.
- Generate Page Objects where required.
- Generate Component Objects where appropriate.
- Reuse existing framework utilities and fixtures.
- Follow the established locator strategy.
- Follow existing coding standards.
- Preserve the intent of the Markdown test plan.
- Maintain traceability to the originating story and test-plan scenario.

The generated automation must follow the same architecture and standards as manually created automation.

The agent must not:

- Remove important assertions.
- Weaken expected results.
- Introduce unnecessary abstractions.
- Duplicate existing framework functionality.
- Modify unrelated automation.
- Introduce unnecessary dependencies.

Output:

- Playwright JavaScript tests
- Page Objects
- Component Objects where appropriate

---

## Failure Analysis Agent

The Failure Analysis Agent is responsible for determining why an automated scenario failed.

Input may include:

- Test source
- Page Object source
- Error message
- Stack trace
- Playwright trace
- Screenshot
- Video
- Console logs
- Network information
- API responses
- Execution history
- Environment information
- Git changes
- Run ID
- Retry history

Responsibilities:

- Analyze the available evidence.
- Identify the most likely root cause.
- Determine whether the failure is related to automation, application behavior, infrastructure/environment, or insufficient evidence.
- Explain the reasoning behind the classification.
- Identify additional evidence required when the available evidence is insufficient.

Possible classifications:

- Automation Defect
- Application Defect
- Infrastructure / Environment Issue
- Insufficient Evidence

The agent must not classify a failure based only on the fact that a test failed.

The classification should be evidence-based.

---

## Automation Repair Agent

The Automation Repair Agent is responsible for repairing failures that have been identified as automation defects.

Input:

- Failed scenario
- Failure Analysis
- Test source
- Page Object source
- Relevant execution evidence
- Framework architecture
- Original test intent

Responsibilities:

- Identify the automation root cause.
- Propose the smallest appropriate automation change.
- Modify the relevant test, Page Object, Component Object, fixture, or framework utility when justified.
- Preserve the original business intent.
- Run linting and formatting.
- Execute the affected scenario.
- Validate that the proposed fix resolves the automation failure.
- Ensure that the fix does not mask an application defect.
- Prepare the change for Historical Validation.

The agent must never:

- Remove assertions simply to make the test pass.
- Change expected business behavior to match an incorrect application behavior.
- Skip a scenario to eliminate a failure.
- Introduce unrelated changes.
- Modify the test merely to achieve a green result.

Output:

- Proposed automation fix
- Validation evidence
- Changed files
- Explanation of the root cause and fix

---

## Historical Validation Agent

The Historical Validation Agent is responsible for validating automation fixes against the exact scenarios that previously failed.

Input:

- Source run ID
- Final unresolved scenarios from the source run
- Automation-fix branch
- Scenarios-per-shard
- Maximum retries

Responsibilities:

- Retrieve the final unresolved failures from the source run.
- Create a new validation run with a new runId.
- Preserve the sourceRunId.
- Execute the exact previously unresolved scenarios.
- Dynamically shard the scenarios.
- Apply the configured retry policy.
- Aggregate the results.
- Produce validation evidence.

The original source run must remain immutable.

A successful Historical Validation demonstrates that the automation fix resolves the previously observed failures without unnecessarily changing unrelated coverage.

---

## Application Defect Agent

The Application Defect Agent is responsible for preparing a functional defect when evidence indicates that the application, rather than the automation, is responsible for the failure.

Input:

- Failure Analysis
- Failed scenario
- Story reference
- Test plan
- Execution evidence
- Environment information
- Run ID

Responsibilities:

- Confirm that available evidence supports an application defect classification.
- Prepare a structured Jira or Rally defect.
- Include reproducible steps.
- Include expected behavior.
- Include actual behavior.
- Include the affected scenario.
- Include the relevant story reference.
- Include environment information.
- Include appropriate screenshots, traces, logs, or other evidence.
- Preserve the original automation without weakening it to hide the application problem.

The agent should not create a functional defect when the available evidence is insufficient.

The defect should clearly distinguish observed facts from AI analysis or interpretation.

---

## PR Agent

The PR Agent is responsible for preparing a Pull Request for validated automation changes.

Input:

- Automation fix
- Failure Analysis
- Historical Validation results
- Source run ID
- Validation run ID
- Story reference
- Changed files

Responsibilities:

- Create or prepare a fix branch.
- Summarize the original automation failure.
- Explain the identified root cause.
- Describe the automation change.
- Include validation results.
- Include Historical Validation results.
- Maintain traceability to the originating story.
- Prepare a clear Pull Request description.
- Provide relevant execution evidence.

The PR Agent should only prepare a PR after the automation change has been validated.

Human review and approval remain required before merging the Pull Request.

---

## Defect / PR Decision Agent

The Defect / PR Decision Agent coordinates the outcome of Failure Analysis.

Possible flow:

Failure
    |
    v
Failure Analysis
    |
    +----------------------+----------------------+
    |                      |                      |
    v                      v                      v
Automation Defect    Application Defect    Infrastructure Issue
    |                      |                      |
    v                      v                      v
Automation Repair    Application Defect     Investigation
    |                  Agent
    v
Historical Validation
    |
    +------------------+
    |
    v
Validation Successful
    |
    v
PR Agent

The purpose of this decision layer is to ensure that an automation failure is not automatically treated as an automation problem.

The system must preserve the distinction between:

- A defect in the automation.
- A defect in the application.
- An infrastructure/environment problem.
- A situation where there is not enough evidence to determine the cause.

---

## End-to-End AI Agent Flow

The complete future flow is:

Jira / Rally Story
        |
        v
Story Agent
        |
        v
Structured Story Model
        |
        v
Test Planning Agent
        |
        v
Markdown Test Plan
        |
        v
Application Exploration Agent
        |
        v
Application Evidence
        |
        v
Test Generation Agent
        |
        v
Playwright Tests + Page Objects
        |
        v
Deterministic Playwright Framework
        |
        v
Test Execution
        |
        v
Failure Analysis Agent
        |
        +----------------------+----------------------+
        |                      |                      |
        v                      v                      v
Automation Defect    Application Defect    Infrastructure Issue
        |                      |                      |
        v                      v                      v
Automation Repair    Application Defect     Investigation
        |                  Agent
        v
Historical Validation
        |
        v
PR Agent
        |
        v
Human Review