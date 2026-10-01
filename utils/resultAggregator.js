/*
 * PURPOSE:
 * Combines normalized execution results from initial executions and
 * retries into one scenario-level history.
 *
 * INPUT:
 * An array of normalized execution results:
 *
 * {
 *   runId,
 *   executionType,
 *   shard,
 *   attempt,
 *   tests: [...]
 * }
 *
 * OUTPUT:
 * One aggregated record per scenario:
 *
 * {
 *   id,
 *   title,
 *   file,
 *   line,
 *   column,
 *   tags,
 *   history: [...],
 *   finalStatus
 * }
 *
 * HISTORY:
 * Each execution contributes one history entry:
 *
 * {
 *   runId,
 *   executionType,
 *   shard,
 *   attempt,
 *   status
 * }
 *
 * FINAL STATUS:
 * The latest execution status for the scenario becomes its
 * finalStatus.
 *
 * IMPORTANT:
 * A scenario that initially fails but passes during retry is ultimately
 * represented as PASSED while its failure history remains available.
 *
 * EXAMPLE:
 *
 * FAIL → PASS
 *
 * finalStatus = passed
 *
 * history:
 *   attempt 0 → failed
 *   attempt 1 → passed
 *
 * ARCHITECTURE:
 *
 * Execution Results
 *      ↓
 * Result Aggregator
 *      ↓
 * Scenario History
 *      ↓
 * Final Scenario Status
 */

export function aggregateScenarioResults(executions) {
  if (!Array.isArray(executions)) {
    throw new Error('executions must be an array');
  }

  const scenarios = new Map();

  for (const execution of executions) {
    if (!execution || !Array.isArray(execution.tests)) {
      throw new Error('Each execution must contain a tests array');
    }

    for (const test of execution.tests) {
      const key = test.id || `${test.file}:${test.line}`;

      if (!scenarios.has(key)) {
        scenarios.set(key, {
          id: test.id,
          title: test.title,
          file: test.file,
          line: test.line,
          column: test.column,
          tags: test.tags,
          history: [],
          finalStatus: null,
        });
      }

      const scenario = scenarios.get(key);

      scenario.history.push({
        runId: execution.runId,
        executionType: execution.executionType,
        shard: execution.shard,
        attempt: execution.attempt,
        status: test.status,
      });

      scenario.finalStatus = test.status;
    }
  }

  return [...scenarios.values()];
}
