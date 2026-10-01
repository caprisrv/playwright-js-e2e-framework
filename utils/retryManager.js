/*
 * PURPOSE:
 * Retries ONLY scenarios that failed during the previous execution.
 *
 * INPUT:
 *   - Failed scenarios
 *   - Maximum number of retry attempts
 *   - Overall runId
 *
 * RETRY BEHAVIOR:
 *
 * Example:
 *
 * Initial:
 *   10 scenarios
 *   7 passed
 *   3 failed
 *
 * Retry 1:
 *   3 failed scenarios executed
 *   2 passed
 *   1 failed
 *
 * Retry 2:
 *   1 failed scenario executed
 *   1 passed
 *
 * Final:
 *   All 10 scenarios passed
 *
 * IMPORTANT:
 * Passed scenarios are never re-executed.
 *
 * ONLY THE CURRENT FAILURES MOVE FORWARD:
 *
 * Initial failures
 *      ↓
 * Retry 1
 *      ↓
 * Remaining failures
 *      ↓
 * Retry 2
 *      ↓
 * Remaining failures
 *
 * FINAL STATUS RULE:
 *
 * FAIL → PASS
 *   = final PASSED
 *
 * FAIL → FAIL
 *   = final FAILED
 *
 * RETRY HISTORY:
 * Every retry execution is retained separately so the result aggregator
 * can reconstruct the complete scenario history.
 *
 * RUN ID:
 * All initial and retry executions belonging to the same overall run
 * use the same runId.
 *
 * ARCHITECTURE:
 *
 * Failed Scenarios
 *      ↓
 * Retry Manager
 *      ↓
 * Retry Execution
 *      ↓
 * Normalized Results
 */

import { executeShard } from './shardExecutor.js';
import { getFailedScenarioResults } from './resultParser.js';

// Retry only failed scenarios, up to maxRetries attempts.

export async function retryFailedTests(failedTests, maxRetries, runId, shard) {
  if (!Array.isArray(failedTests)) {
    throw new Error('failedTests must be an array');
  }

  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new Error('maxRetries must be a non-negative integer');
  }

  if (!Number.isInteger(shard) || shard < 1) {
    throw new Error('shard must be a positive integer');
  }

  let remainingTests = failedTests;
  let retryAttempt = 0;
  const retryResults = [];

  while (remainingTests.length > 0 && retryAttempt < maxRetries) {
    retryAttempt += 1;

    const retryShard = {
      shard,
      tests: remainingTests,
    };

    const result = await executeShard(
      retryShard,
      runId,
      'retry',
      retryAttempt,
    );

    retryResults.push({
      attempt: retryAttempt,
      result,
    });

    remainingTests = getFailedScenarioResults(result.tests);
  }

  const recoveredTests = failedTests.filter(
    (test) =>
      !remainingTests.some(
        (remainingTest) => remainingTest.id === test.id,
      ),
  );

  return {
    passed: remainingTests.length === 0,
    attempts: retryAttempt,
    recoveredTests,
    failedTests: remainingTests,
    results: retryResults,
  };
}
