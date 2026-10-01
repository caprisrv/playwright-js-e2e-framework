/*
 * PURPOSE:
 * Converts Playwright JSON reporter output into the framework's
 * normalized scenario result format.
 *
 * INPUT:
 * Raw Playwright JSON reporter output.
 *
 * PLAYWRIGHT STRUCTURE:
 *
 * suites
 *   ↓
 * specs
 *   ↓
 * tests
 *   ↓
 * results
 *
 * OUTPUT:
 * Normalized scenario results:
 *
 * {
 *   id,
 *   title,
 *   file,
 *   line,
 *   column,
 *   tags,
 *   status
 * }
 *
 * IMPORTANT:
 * The parser preserves the actual Playwright status.
 *
 * Examples:
 *   passed
 *   failed
 *   skipped
 *   timedOut
 *   interrupted
 *
 * The parser does not decide which statuses are retryable.
 * That decision belongs to the retry layer.
 *
 * HELPER FUNCTIONS:
 *
 * getScenarioResults()
 *   Converts raw Playwright output into normalized results.
 *
 * getFailedTests()
 *   Returns scenarios whose status is 'failed'.
 *
 * getFailedScenarioResults()
 *   Filters an already-normalized scenario list for failed scenarios.
 *
 * ARCHITECTURE:
 *
 * Playwright JSON
 *      ↓
 * Result Parser
 *      ↓
 * Normalized Scenario Results
 *      ↓
 * Retry / Aggregation / Reporting
 */

export function getScenarioResults(report) {
  if (!report || !Array.isArray(report.suites)) {
    return [];
  }

  const scenarios = [];

  for (const suite of report.suites) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results?.at(-1);

        if (!result) {
          continue;
        }

        scenarios.push({
          id: spec.id,
          title: spec.title,
          file: spec.file,
          line: spec.line,
          column: spec.column,
          tags: spec.tags,
          status: result.status,
        });
      }
    }
  }

  return scenarios;
}

export function getFailedTests(report) {
  return getScenarioResults(report).filter(
    (test) => test.status === 'failed',
  );
}

export function getFailedScenarioResults(scenarios) {
  if (!Array.isArray(scenarios)) {
    throw new Error('scenarios must be an array');
  }

  return scenarios.filter(
    (scenario) => scenario.status === 'failed',
  );
}