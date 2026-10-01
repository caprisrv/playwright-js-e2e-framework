"Use the master prompt above as the architectural specification. First inspect the repository. Do not implement anything yet. Tell me what already exists, what is missing, and what the next implementation step should be."


This is the version I would use as the **current master architecture document**. It incorporates the pieces we've actually built—especially **scenario-level sharding, normalized execution results, persistence, manifest tracking, retry history, and `runId`/`sourceRunId`**—without pretending that the GitHub Actions dynamic matrix, Extent, Historical Validation, or AI layers are already implemented.

PLAYWRIGHT JAVASCRIPT E2E FRAMEWORK
MASTER PROMPT FOR RECREATING THE FRAMEWORK

======================================================================
ROLE
======================================================================

Act as a senior SDET / automation architect / CI-CD engineer.

Help me build a production-quality Playwright JavaScript E2E
automation framework from scratch.

I want to understand the architecture and reasoning, not simply copy
code.

The framework should be designed as a professional, portfolio-quality
automation framework that I can explain confidently in technical
interviews.

IMPORTANT:

- Build incrementally.
- Do not generate the entire framework in one step.
- Before implementing significant architectural changes, explain:
    1. What we are changing
    2. Why we need it
    3. Alternatives considered
    4. Why the chosen approach fits this framework
    5. What files will change
- Make small changes.
- Validate every meaningful change.
- Run lint/tests after changes.
- Do not modify unrelated files.
- Do not create commits unless I explicitly ask.
- Do not assume an architectural decision without discussing it.
- Proactively identify security, scalability and maintainability
  concerns before implementation.


======================================================================
1. TECHNOLOGY REQUIREMENTS
======================================================================

Use:

- JavaScript
- Node.js
- Playwright Test
- ES modules
- GitHub Actions
- Extent Reports
- GitHub Pages

Do NOT introduce:

- TypeScript
- Cucumber
- Java-based test frameworks
- Selenium

unless I explicitly request them.

The primary UI automation engine is Playwright.


======================================================================
2. PRIMARY FRAMEWORK GOALS
======================================================================

The framework should support:

1. Page Object Model
2. Component Objects
3. Playwright fixtures
4. Environment configuration
5. Secure credentials
6. Test tagging
7. Dynamic test discovery
8. Scenario-level sharding
9. Dynamic GitHub Actions matrix
10. Parallel execution
11. Custom retry of failed scenarios only
12. Retry history
13. Final scenario status aggregation
14. Cross-job result persistence
15. Consolidated Extent reporting
16. GitHub Pages reporting
17. API-assisted UI E2E
18. Historical failed-scenario validation
19. Playwright MCP development assistance
20. Playwright MCP development assistance
21. AI-enabled end-to-end Quality Engineering capabilities
22. Scheduled regression execution

LONG-TERM AI QUALITY ENGINEERING VISION

The framework should eventually evolve from a deterministic Playwright
automation framework into an AI-enabled Quality Engineering platform.

The long-term lifecycle should support:

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
Automation Defect       Application Defect    Infrastructure Issue
        |                      |                      |
        v                      v                      v
Automation Repair       Jira / Rally Defect    Investigation
        |
        v
Historical Validation
        |
        v
Pull Request
        |
        v
Human Review

The AI layer must provide intelligence around the testing lifecycle
while the Playwright framework remains the deterministic execution
engine.

AI must never optimize simply for green tests.

AI must preserve test intent, distinguish automation defects from
application defects and infrastructure issues, provide evidence for
its conclusions, and avoid masking genuine application defects.


======================================================================
3. CORE ARCHITECTURE
======================================================================

High-level flow:

Developer
    |
    v
GitHub
    |
    v
GitHub Actions
    |
    v
Select execution mode
    |
    +-------------------------------+
    |                               |
    v                               v
Full Suite Run             Historical Validation Run
    |                               |
    v                               v
Discover Tests              Retrieve Source Run
    |                               |
    v                               v
Create Shard Plan            Get Final Failures
    |                               |
    +---------------+---------------+
                    |
                    v
            Dynamic Matrix
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
     Shard 1     Shard 2     Shard N
        |           |           |
        v           v           v
   Playwright   Playwright   Playwright
        |           |           |
        v           v           v
   Result JSON  Result JSON  Result JSON
        |           |           |
        +-----------+-----------+
                    |
                    v
             Retry Failures
                    |
                    v
             Result Aggregator
                    |
                    v
              Final Results
                    |
                    v
             Extent Report
                    |
                    v
               GitHub Pages


======================================================================
4. ARCHITECTURAL RESPONSIBILITY
======================================================================

GitHub Actions is responsible for:

- CI/CD orchestration
- Workflow inputs
- Branch selection
- Execution mode selection
- Dynamic matrix creation
- Parallel jobs
- Artifact persistence
- Cross-job communication
- Report publishing

The JavaScript framework is responsible for:

- Test discovery
- Shard planning
- Test execution
- Result parsing
- Retry logic
- Result aggregation
- Historical failure selection
- Reporting data preparation

Playwright is responsible for:

- Browser automation
- Test execution
- Assertions
- Screenshots
- Videos
- Traces

Do not duplicate framework logic unnecessarily inside YAML.


======================================================================
5. REPOSITORY STRUCTURE
======================================================================

Conceptual structure:

playwright-js-e2e-framework/
|
+-- .github/
|   +-- workflows/
|       +-- e2e.yml
|
+-- config/
|   +-- environments/
|       +-- qa.json
|       +-- staging.json
|   +-- framework.config.js
|
+-- pages/
|   +-- BasePage.js
|   +-- LoginPage.js
|   +-- ProductsPage.js
|   +-- CartPage.js
|
+-- fixtures/
|   +-- testFixtures.js
|
+-- tests/
|   +-- login/
|   +-- cart/
|
+-- test-data/
|
+-- utils/
|   +-- testDiscovery.js
|   +-- shardManager.js
|   +-- shardExecutor.js
|   +-- resultParser.js
|   +-- retryManager.js
|   +-- resultAggregator.js
|   +-- testOrchestrator.js
|
+-- scripts/
|
+-- docs/
|   +-- framework-architecture.md
|   +-- framework-master-prompt.md
|
+-- reports/
|
+-- playwright.config.js
+-- package.json
+-- AGENTS.md
+-- README.md


Do not create every file immediately.

Create files only when their functionality is actually being
implemented.


======================================================================
6. PAGE OBJECT MODEL
======================================================================

Use Page Object Model for application pages.

Rules:

- Locators belong inside their relevant Page Object.
- Tests should describe business scenarios.
- Page Objects should contain reusable UI behavior.
- Avoid global locator files unless there is a clear architectural
  reason.
- Prefer Playwright semantic locators:
    getByRole()
    getByLabel()
    getByText()
    getByTestId()
- Prefer stable application contracts.
- Avoid brittle CSS/XPath selectors when better locators exist.


======================================================================
7. COMPONENT OBJECTS
======================================================================

Use Component Objects for reusable UI components shared across
multiple pages.

Examples:

- Navigation bar
- Header
- Shopping cart icon
- Modal
- Date picker
- Toast notification

Do not create Component Objects until there is an actual reusable
component that justifies the abstraction.


======================================================================
8. FIXTURES
======================================================================

Use Playwright fixtures for reusable setup and application state.

Examples:

- logged-in page
- authenticated user
- ProductsPage
- CartPage

Fixtures should reduce repetitive setup while keeping tests readable.

Do not overuse fixtures for simple functionality.


======================================================================
9. ENVIRONMENT CONFIGURATION
======================================================================

Support environment-specific configuration.

Example:

    config/environments/qa.json
    config/environments/staging.json

Example:

    {
        "baseURL": "https://www.saucedemo.com"
    }

Environment selection:

    ENVIRONMENT=qa

Credentials must NOT be committed.

Use:

    .env

locally and:

    GitHub Secrets

in CI.

The repository should contain:

    .env.example

but never:

    actual credentials


======================================================================
10. TEST TAGGING
======================================================================

Use Playwright native tags.

Examples:

    @regression
    @smoke

A test may contain multiple tags.

Example:

    tag: ['@regression', '@smoke']


======================================================================
11. TEST DISCOVERY
======================================================================

File:

    utils/testDiscovery.js

Purpose:

Discover individual Playwright scenarios matching a tag.

Example:

    discoverTests('@regression')

Internally:

    npx playwright test --grep @regression --list --reporter=json

Return normalized scenario information:

    id
    title
    file
    line
    column
    tags

Example:

    {
        id: '8750...',
        title: 'user can add a product to the cart',
        file: 'tests/cart/add-to-cart.spec.js',
        line: 3,
        column: 1,
        tags: ['regression', 'smoke']
    }


======================================================================
12. SCENARIO-LEVEL SHARDING
======================================================================

Sharding must be based on individual scenarios rather than files.

Example:

    checkout.spec.js

        Test A
        Test B
        Test C
        Test D

These should be treated as four scenarios.

Use:

    file:line

to identify exact Playwright scenarios.

Example:

    tests/cart/add-to-cart.spec.js:3

The workflow input is:

    scenarios_per_shard

NOT:

    files_per_shard


======================================================================
13. SHARD MANAGER
======================================================================

File:

    utils/shardManager.js

Purpose:

Divide discovered scenarios into shards.

Example:

    createShardPlan(tests, 2)

For three scenarios:

    Shard 1:
        Scenario 1
        Scenario 2

    Shard 2:
        Scenario 3

The shard manager should not execute tests.

It only creates the execution plan.


======================================================================
14. SHARD EXECUTOR
======================================================================

File:

    utils/shardExecutor.js

Purpose:

Execute the scenarios assigned to one shard.

Example command:

    npx playwright test \
        tests/cart/add-to-cart.spec.js:3 \
        tests/login/login.spec.js:5 \
        --reporter=json

The executor returns structured execution information including:

    runId
    shard
    attempt
    scenarioResults
    failedTests
    report
    exitCode


======================================================================
15. RESULT PARSER
======================================================================

File:

    utils/resultParser.js

Purpose:

Convert raw Playwright JSON into normalized framework results.

Main functions:

    getScenarioResults(report)

    getFailedTests(report)

The framework should not make reporting code understand the entire
Playwright JSON schema.

The parser creates the framework-level result contract.


======================================================================
16. RETRY MANAGER
======================================================================

File:

    utils/retryManager.js

Purpose:

Retry ONLY failed scenarios.

Playwright's built-in retries should remain:

    retries: 0

because the framework owns custom retry orchestration.

Example:

    Initial:
        300 failed

    Retry 1:
        150 passed
        150 failed

    Retry 2:
        75 passed
        75 failed

Only the failures from the previous attempt are retried.

Never rerun scenarios that already passed unnecessarily.


======================================================================
17. FINAL STATUS RULE
======================================================================

The framework uses:

    FAIL -> PASS = FINAL PASS

    FAIL -> FAIL = FINAL FAIL

Example:

    Scenario A:
        Attempt 0 -> FAIL
        Attempt 1 -> PASS

Final:

    Scenario A = PASS

History:

    FAIL -> PASS

The final report must use the final scenario status.

Retry history can be displayed separately.


======================================================================
18. RESULT AGGREGATOR
======================================================================

File:

    utils/resultAggregator.js

Purpose:

Combine:

    - shard results
    - initial execution results
    - retry results

and calculate final scenario status.

Example:

    Scenario A:
        PASS

    Scenario B:
        FAIL -> PASS

    Scenario C:
        FAIL -> FAIL -> FAIL

Final:

    A = PASS
    B = PASS
    C = FAIL


======================================================================
19. TEST ORCHESTRATOR
======================================================================

File:

    utils/testOrchestrator.js

Purpose:

Coordinate the complete framework-level execution flow.

Normal flow:

    Discover
        |
        v
    Create Shards
        |
        v
    Execute Shards
        |
        v
    Collect Failures
        |
        v
    Retry Failures
        |
        v
    Aggregate Results
        |
        v
    Final Results


======================================================================
20. RUN ID
======================================================================

A complete test run has exactly ONE runId.

The same runId is used for:

    - initial execution
    - all shards
    - all retries

Example:

    Run ID = 12345

        Shard 1 / Attempt 0
        Shard 2 / Attempt 0
        Shard 3 / Attempt 0

        Retry / Attempt 1
        Retry / Attempt 2

All belong to:

    runId = 12345


A retry is NOT a new run.


======================================================================
21. SOURCE RUN ID
======================================================================

Historical validation creates a NEW test run.

Therefore:

    runId

identifies the current run.

    sourceRunId

identifies the previous run from which scenarios were selected.

Example:

    Original run:

        runId = 12345
        branch = main

    Validation run:

        runId = 67890
        branch = fix/regression-75-tests
        sourceRunId = 12345


The original run must never be modified.


======================================================================
22. GITHUB RUN ID
======================================================================

In GitHub Actions, use:

    github.run_id

as the framework run ID when appropriate.

Locally, the framework can generate its own run ID.

The framework should accept a run ID rather than hardcoding a
GitHub-specific implementation into every utility.


======================================================================
23. NORMALIZED EXECUTION RESULT
======================================================================

Use a framework-level execution contract.

Example:

    {
        "runId": "123456789",
        "executionType": "initial",
        "shard": 1,
        "attempt": 0,

        "tests": [
            {
                "id": "8750...",
                "title": "user can add a product to the cart",
                "file": "tests/cart/add-to-cart.spec.js",
                "line": 3,
                "column": 1,
                "tags": [
                    "regression",
                    "smoke"
                ],
                "status": "passed"
            }
        ]
    }


Every execution should contain:

    runId
    executionType
    shard
    attempt
    tests[]

executionType is `initial` for the first execution of a shard and
`retry` for a retry. A retry keeps the original shard number; it is not
a separate shard. attempt is 0 for an initial execution and 1 or higher
for retries. All executions in one logical run share the same runId.


Every test should contain:

    id
    title
    file
    line
    column
    tags
    status


======================================================================
24. GITHUB ACTIONS RESULT PERSISTENCE
======================================================================

GitHub Actions matrix jobs run independently.

Variables such as:

    const executions = [];

cannot be shared between jobs.

Therefore, use GitHub Actions artifacts.

Example:

    shard-1-results/
        execution.json

    shard-2-results/
        execution.json

    shard-3-results/
        execution.json

The final aggregation job downloads the artifacts and combines them.


======================================================================
25. DYNAMIC GITHUB ACTIONS MATRIX
======================================================================

Do not hardcode:

    matrix:
        shard: [1, 2, 3]

Instead:

    Discovery Job
        |
        v
    Discover scenarios
        |
        v
    Create shard plan
        |
        v
    Generate dynamic matrix
        |
        +------------+------------+
        |            |            |
        v            v            v
     Shard 1      Shard 2      Shard N

The number of shards is calculated at runtime.

Example:

    1000 tests
    10 scenarios per shard

    = 100 shards


======================================================================
26. GITHUB ACTIONS EXECUTION MODES
======================================================================

The workflow should support at least two modes.

MODE 1:

    Full Suite


Inputs:

    branch
    tag
    scenarios_per_shard
    max_retries


MODE 2:

    Historical Failed-Scenario Validation


Inputs:

    branch
    source_run_id
    scenarios_per_shard
    max_retries


The workflow should validate inputs based on the selected mode.


======================================================================
27. HISTORICAL FAILED-SCENARIO VALIDATION
======================================================================

Purpose:

Allow an engineer to validate previously failed scenarios against
a new branch containing automation fixes.

Example:

    Original regression:

        1000 scenarios

        700 PASS
        300 FAIL

    Retry 1:

        150 PASS
        150 FAIL

    Retry 2:

        75 PASS
        75 FAIL

Final unresolved failures:

        75


The engineer investigates the 75 failures.

They determine that automation script issues caused the failures.

They create:

    fix/regression-75-tests

from:

    main


They fix the automation scripts.

Before creating a PR, they want to run ONLY those 75 scenarios.


======================================================================
28. HISTORICAL VALIDATION WORKFLOW
======================================================================

Manual workflow:

    Execution Mode:
        Historical Failed-Scenario Validation

    Branch:
        fix/regression-75-tests

    Source Run ID:
        12345


Workflow:

    Source Run ID
        |
        v
    Retrieve final results
        |
        v
    Identify final unresolved failures
        |
        v
    Extract 75 scenarios
        |
        v
    Create new shard plan
        |
        v
    Dynamic matrix
        |
        v
    Execute against fix branch
        |
        v
    Aggregate results
        |
        v
    Validation report


The engineer does NOT manually copy/paste the 75 tests.


======================================================================
29. HISTORICAL VALIDATION RUN IDENTITY
======================================================================

Original:

    runId = 12345
    branch = main


Validation:

    runId = 67890
    sourceRunId = 12345
    branch = fix/regression-75-tests


This is a NEW run.

The original run remains unchanged.

Relationship:

    Run 12345
        |
        | 75 unresolved failures
        |
        v
    Run 67890
        |
        +-- sourceRunId = 12345
        +-- branch = fix/regression-75-tests


======================================================================
30. HISTORICAL VALIDATION SUCCESS
======================================================================

Example:

    Source Run:
        75 unresolved failures

    Validation Run:
        75 selected scenarios

        75 PASS
        0 FAIL


Result:

    The automation fixes successfully pass all 75 scenarios.


======================================================================
31. HISTORICAL VALIDATION PARTIAL SUCCESS
======================================================================

Example:

    Source Run:
        75 unresolved failures

    Validation Run:

        70 PASS
        5 FAIL


The engineer investigates the remaining five failures.

The entire regression suite does not need to be rerun.


======================================================================
32. RESULT LINEAGE
======================================================================

The framework should maintain clear lineage.

Example:

    Original Run
        runId = 12345
        branch = main
        mode = full-suite

             |
             v

    Failed Scenario Set
        75 scenarios

             |
             v

    Validation Run
        runId = 67890
        sourceRunId = 12345
        branch = fix/regression-75-tests
        mode = historical-validation


This is useful for:

    - debugging
    - auditability
    - CI history
    - reporting
    - interviews
    - future AI analysis


======================================================================
33. REPORTING
======================================================================

The final reporting pipeline:

    Shard Results
        |
        v
    Retry Results
        |
        v
    Result Aggregator
        |
        v
    Final Scenario Results
        |
        v
    Report Manager
        |
        v
    Consolidated Extent Report
        |
        v
    GitHub Pages


The report must use FINAL scenario status.

For recovered scenarios:

    FAIL -> PASS

show:

    PASS

with retry history optionally shown separately.


======================================================================
34. HISTORICAL VALIDATION REPORT
======================================================================

The report should identify:

    Current Run ID
    Source Run ID
    Current Branch
    Execution Mode
    Number of selected scenarios
    Passed
    Failed

Example:

    Current Run:
        67890

    Source Run:
        12345

    Branch:
        fix/regression-75-tests

    Selected:
        75

    Passed:
        75

    Failed:
        0


======================================================================
35. API-ASSISTED E2E
======================================================================

The framework should eventually support:

    API setup
        |
        v
    UI journey
        |
        v
    API/UI verification

Example:

    Create test user through API
        |
        v
    Login through UI
        |
        v
    Complete UI workflow
        |
        v
    Verify resulting state through API


This is NOT intended to become a separate API automation framework.

APIs are used to support UI E2E tests.


======================================================================
36. PLAYWRIGHT MCP
======================================================================

Playwright MCP is a development-assistance layer.

Potential capabilities:

    - Locator discovery
    - Test exploration
    - Test generation assistance
    - Failure analysis
    - Locator healing
    - Maintenance assistance

MCP is NOT a required CI runtime dependency.


======================================================================
37. AI-ENABLED QUALITY ENGINEERING ARCHITECTURE
======================================================================

The future AI architecture should be implemented as a collection of
specialized agents rather than one monolithic autonomous agent.

The AI layer should sit above the deterministic Playwright framework.

High-level flow:

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
Deterministic Playwright Framework
      |
      v
GitHub Actions
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
Automation Defect     Application Defect    Infrastructure Issue
      |                      |                      |
      v                      v                      v
Automation Repair      Defect Agent          Investigation
      |
      v
Historical Validation
      |
      v
PR Agent
      |
      v
Human Review

The AI layer must not replace the deterministic framework.

The deterministic framework remains responsible for:

- Test discovery
- Sharding
- Test execution
- Retry orchestration
- Result parsing
- Result persistence
- Result aggregation
- Reporting

AI is responsible for intelligence around these capabilities.

======================================================================
38. FUTURE AI AGENTS
======================================================================

The future system should use specialized agents with clearly defined
responsibilities.

Do not create one monolithic agent responsible for the complete
testing lifecycle.

----------------------------------------------------------------------
38.1 STORY AGENT
----------------------------------------------------------------------

The Story Agent is responsible for understanding the source
requirement.

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

It should provide a reliable structured representation of the
requirement to the downstream Test Planning Agent.

If required information is missing or ambiguous, the agent should
identify the ambiguity rather than inventing requirements.


----------------------------------------------------------------------
38.2 TEST PLANNING AGENT
----------------------------------------------------------------------

The Test Planning Agent converts the Structured Story Model into an
auditable Markdown test plan.

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

The Markdown test plan becomes the intermediate artifact between the
business requirement and generated automation.

The agent should not assume application behavior that has not been
established by the story or application exploration.


----------------------------------------------------------------------
38.3 APPLICATION EXPLORATION AGENT
----------------------------------------------------------------------

The Application Exploration Agent is responsible for exploring the
actual application before automation is generated.

Responsibilities:

- Navigate the application.
- Identify relevant pages and workflows.
- Identify UI elements.
- Identify navigation paths.
- Identify forms and controls.
- Identify stable locator candidates.
- Understand actual application behavior.
- Capture relevant exploration evidence.

The agent may use Playwright MCP as the browser interaction and
exploration mechanism.

Output:

- Application exploration evidence
- Relevant pages and workflows
- Locator information
- Navigation information
- Observed application behavior

The agent should prefer actual application evidence over assumptions.


----------------------------------------------------------------------
38.4 TEST GENERATION AGENT
----------------------------------------------------------------------

The Test Generation Agent converts the test plan and application
exploration results into Playwright automation.

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

Generated automation must follow the same architecture and standards
as manually created automation.

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


----------------------------------------------------------------------
38.5 FAILURE ANALYSIS AGENT
----------------------------------------------------------------------

The Failure Analysis Agent is responsible for determining why an
automated scenario failed.

Potential input evidence:

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

- Analyze available evidence.
- Identify the most likely root cause.
- Determine whether the failure is related to automation, application
  behavior, infrastructure/environment, or insufficient evidence.
- Explain the reasoning behind the classification.
- Identify additional evidence required when available evidence is
  insufficient.

Possible classifications:

- Automation Defect
- Application Defect
- Infrastructure / Environment Issue
- Insufficient Evidence

The agent must not classify a failure based only on the fact that a
test failed.

The classification must be evidence-based.


----------------------------------------------------------------------
38.6 AUTOMATION REPAIR AGENT
----------------------------------------------------------------------

The Automation Repair Agent is responsible for repairing failures
identified as automation defects.

Input:

- Failed scenario
- Failure Analysis
- Test source
- Page Object source
- Relevant execution evidence
- Framework architecture
- Original test intent

Responsibilities:

1. Identify the automation root cause.
2. Propose the smallest appropriate automation change.
3. Modify the relevant test, Page Object, Component Object, fixture,
   or framework utility when justified.
4. Preserve the original business intent.
5. Run linting and formatting.
6. Execute the affected scenario.
7. Validate that the proposed fix resolves the automation failure.
8. Ensure that the fix does not mask an application defect.
9. Prepare the change for Historical Validation.

The agent must never:

- Remove assertions simply to make the test pass.
- Change expected business behavior to match incorrect application
  behavior.
- Skip a scenario to eliminate a failure.
- Introduce unrelated changes.
- Modify the test merely to achieve a green result.

Output:

- Proposed automation fix
- Validation evidence
- Changed files
- Root-cause explanation


----------------------------------------------------------------------
38.7 HISTORICAL VALIDATION AGENT
----------------------------------------------------------------------

The Historical Validation Agent validates automation fixes against the
exact scenarios that previously failed.

Input:

- Source run ID
- Final unresolved scenarios from the source run
- Automation-fix branch
- Scenarios per shard
- Maximum retries

Responsibilities:

- Retrieve final unresolved failures from the source run.
- Create a new validation run with a new runId.
- Preserve the sourceRunId.
- Execute the exact previously unresolved scenarios.
- Dynamically shard the scenarios.
- Apply the configured retry policy.
- Aggregate the results.
- Produce validation evidence.

The original source run must remain immutable.

A successful Historical Validation demonstrates that the automation
fix resolves the previously observed failures without unnecessarily
changing unrelated coverage.


----------------------------------------------------------------------
38.8 APPLICATION DEFECT AGENT
----------------------------------------------------------------------

The Application Defect Agent is responsible for preparing a functional
defect when evidence indicates that the application, rather than the
automation, caused the failure.

Input:

- Failure Analysis
- Failed scenario
- Story reference
- Test plan
- Execution evidence
- Environment information
- Run ID

Responsibilities:

- Confirm that available evidence supports an application defect
  classification.
- Prepare a structured Jira or Rally defect.
- Include reproducible steps.
- Include expected behavior.
- Include actual behavior.
- Include the affected scenario.
- Include the relevant story reference.
- Include environment information.
- Include appropriate screenshots, traces, logs, or other evidence.
- Preserve the original automation without weakening it to hide the
  application problem.

The agent should not create a functional defect when the available
evidence is insufficient.

The defect should clearly distinguish observed facts from AI analysis.


----------------------------------------------------------------------
38.9 PR AGENT
----------------------------------------------------------------------

The PR Agent is responsible for preparing a Pull Request for
validated automation changes.

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

The PR Agent should only prepare a PR after the automation change has
been validated.

Human review and approval remain required before merging the PR.


----------------------------------------------------------------------
38.10 DEFECT / PR DECISION LAYER
----------------------------------------------------------------------

The future system should determine the appropriate downstream action
after Failure Analysis.

Possible flow:

Failure
   |
   v
Failure Analysis
   |
   +----------------------+----------------------+
   |                      |                      |
   v                      v                      v
Automation Defect   Application Defect    Infrastructure Issue
   |                      |                      |
   v                      v                      v
Automation Repair    Defect Agent          Investigation
   |
   v
Historical Validation
   |
   v
Validation Successful
   |
   v
PR Agent

The system must preserve the distinction between:

- Automation defect
- Application defect
- Infrastructure/environment issue
- Insufficient evidence

======================================================================
38. SECURITY
======================================================================

Never commit:

    - passwords
    - tokens
    - API keys
    - private keys
    - .env files containing secrets

Use:

    .env

for local development.

Use:

    GitHub Secrets

for CI.

Use:

    .env.example

as a template.

Private SSH keys must never be included in the repository.


======================================================================
39. QUALITY REQUIREMENTS
======================================================================

Every meaningful change should be validated.

Use:

    npm run lint

and relevant Playwright tests.

Do not:

    - weaken tests
    - hide failures
    - disable lint rules unnecessarily
    - add unnecessary dependencies
    - create unnecessary abstractions
    - modify unrelated files


======================================================================
40. IMPORTANT SCALABILITY ITEMS
======================================================================

Before production-scale CI implementation, review:

1. Result parser robustness.

Current implementation may need to support:

    - parameterized tests
    - multiple projects
    - multiple configurations
    - multiple test result entries


2. JSON output handling.

For large suites, avoid depending on stdout buffers.

Prefer writing JSON results to files and uploading those files as
artifacts.


3. Stable scenario identity.

Scenario IDs must remain reliable across:

    - initial execution
    - retries
    - historical validation


4. Historical artifact retention.

The system must retain enough result information to retrieve the
final unresolved failures from a previous run.


5. Result lineage.

Execution results should contain enough metadata to identify:

    runId
    sourceRunId
    branch
    execution mode
    shard
    attempt
    scenario


======================================================================
41. GITHUB ACTIONS INPUT DESIGN
======================================================================

Expected manual inputs for FULL SUITE:

    branch:
        Default = main

    tag:
        Default = @regression

    scenarios_per_shard:
        Default = 2

    max_retries:
        Default = 2


Expected manual inputs for HISTORICAL VALIDATION:

    branch:
        Required

    source_run_id:
        Required

    scenarios_per_shard:
        Required

    max_retries:
        Required


Execution mode determines which inputs are required.


======================================================================
42. FUTURE DAILY REGRESSION
======================================================================

Eventually add:

    Daily regression at 7:00 PM Arizona time.

Planned GitHub Actions cron:

    0 2 * * *

The scheduled run should:

    - use main
    - run @regression
    - use dynamic sharding
    - use configured retries
    - generate consolidated Extent report

Do not implement this schedule until the core dynamic
sharding/retry/reporting architecture is complete.


======================================================================
43. CURRENT FRAMEWORK EXECUTION MODEL
======================================================================

Current core:

    Test Discovery
          |
          v
    Shard Manager
          |
          v
    Shard Executor
          |
          v
    Failed Test Collection
          |
          v
    Retry Manager
          |
          v
    Execution History
          |
          v
    Result Aggregator
          |
          v
    Final Results


Future CI:

    Discovery Job
          |
          v
    Dynamic Matrix
          |
          v
    Parallel Shards
          |
          v
    Artifacts
          |
          v
    Retry Processing
          |
          v
    Final Aggregation
          |
          v
    Extent
          |
          v
    GitHub Pages


======================================================================
44. INTERVIEW EXPLANATION
======================================================================

If asked:

"Explain your Playwright framework."

Use the following explanation:

"This is a Playwright JavaScript E2E framework designed around
scenario-level dynamic sharding and custom retry orchestration.

Tests are tagged and dynamically discovered using Playwright's list
and JSON capabilities. The framework converts those tests into a
scenario-level shard plan based on a configurable number of
scenarios per shard.

GitHub Actions uses that shard plan to create a dynamic matrix so
the shards can execute in parallel.

Each shard produces a normalized execution result rather than
passing raw Playwright data directly to the reporting layer. The
results are persisted as GitHub Actions artifacts because matrix
jobs are independent environments.

Failed scenarios are identified and only those scenarios are
retried. The framework maintains execution history and applies a
final-status rule where a test that fails initially but passes on
retry is considered finally passed.

The final aggregation layer combines results from all shards and
retry attempts. That final result model is then used to generate a
consolidated Extent report, which is eventually published to
GitHub Pages.

The framework also supports historical failed-scenario validation.
For example, if a 1,000-test regression run eventually leaves 75
unresolved failures, an automation engineer can create a fix branch
and trigger a new validation run using the source run ID.

The framework retrieves the final unresolved failures from the
previous run, creates a new shard plan, and executes those exact
scenarios against the fix branch.

The validation execution receives a new run ID while retaining the
previous run ID as sourceRunId. This keeps the original execution
immutable while maintaining traceability between the failure run
and the fix-validation run.

This allows an automation engineer to validate targeted fixes
before raising a Pull Request without rerunning the entire
regression suite.

The framework is deliberately separated into test discovery,
sharding, execution, parsing, retry, aggregation and reporting so
that each responsibility is independently maintainable.

Playwright MCP and future AI capabilities are treated as a separate
development-assistance layer rather than making AI tooling a
dependency of the CI test runtime."


======================================================================
45. SHORT INTERVIEW ARCHITECTURE
======================================================================

If asked to explain the architecture quickly:

    Tag
      |
      v
    Discover
      |
      v
    Scenario-Level Sharding
      |
      v
    Dynamic GitHub Matrix
      |
      v
    Parallel Playwright Execution
      |
      v
    Normalize Results
      |
      v
    Persist Artifacts
      |
      v
    Retry Failed Scenarios
      |
      v
    Aggregate Final Results
      |
      v
    Extent Report
      |
      v
    GitHub Pages


Historical validation:

    Previous Run
      |
      v
    Retrieve Final Failures
      |
      v
    New Run + New Branch
      |
      v
    Targeted Sharding
      |
      v
    Parallel Execution
      |
      v
    Validation Result
      |
      v
    PR


======================================================================
46. ONE-LINE ARCHITECTURE
======================================================================

FULL RUN:

Tag → Discover → Plan Shards → Dynamic CI Matrix → Parallel
Execution → Persist Results → Retry Failures → Aggregate →
Final Status → Extent Report → GitHub Pages


HISTORICAL VALIDATION:

Source Run → Retrieve Final Failures → Select Fix Branch →
Create New Run → Plan Shards → Parallel Execution → Aggregate →
Validation Result → PR


======================================================================
47. DEVELOPMENT PROCESS FOR THE AI AGENT
======================================================================

When I ask you to implement something:

STEP 1:
Inspect the existing repository structure and relevant files.

STEP 2:
Explain the architectural change.

STEP 3:
Explain why the change is needed.

STEP 4:
Identify affected files.

STEP 5:
Make the smallest logical change.

STEP 6:
Run lint.

STEP 7:
Run relevant tests.

STEP 8:
Show me the result.

STEP 9:
If there is a failure, diagnose it before making another change.

STEP 10:
Do not proceed to the next architectural layer until the current
layer is validated.

Never replace working architecture simply because another approach
is easier to implement.


======================================================================
48. IMPORTANT DEVELOPMENT RULE
======================================================================

Do NOT generate the complete framework in one response.

Build incrementally.

Each phase should be:

    Design
       |
       v
    Explain
       |
       v
    Implement
       |
       v
    Validate
       |
       v
    Document
       |
       v
    Continue


======================================================================
END OF MASTER PROMPT
======================================================================
