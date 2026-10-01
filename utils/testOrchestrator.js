/*
 * PURPOSE:
 * Coordinates the complete framework-level test execution flow.
 *
 * This is the local framework orchestrator that connects:
 *
 *   Discovery
 *   Sharding
 *   Execution
 *   Retry
 *   Persistence
 *   Manifest Tracking
 *   Result Aggregation
 *
 * SAMPLE INPUT:
 *
 * runTestSuite('@regression', 2, 2)
 *
 * MEANING:
 *
 *   Tag = @regression
 *   Scenarios per shard = 2
 *   Maximum retry attempts = 2
 *
 * EXECUTION FLOW:
 *
 * 1. Generate a unique runId.
 *
 * 2. Create the run manifest.
 *
 * 3. Discover scenarios matching the requested tag.
 *
 * 4. Create a dynamic scenario-level shard plan.
 *
 * 5. Execute each initial shard.
 *
 * 6. Persist each execution result.
 *
 * 7. Record each completed execution in the run manifest.
 *
 * 8. Collect failed scenarios.
 *
 * 9. Retry only the scenarios that failed.
 *
 * 10. Persist each retry execution.
 *
 * 11. Record each retry execution in the manifest.
 *
 * 12. Aggregate all execution history.
 *
 * 13. Calculate the final scenario-level summary.
 *
 * RUN ID:
 *
 * One runId represents one complete framework execution.
 *
 * The same runId is shared by:
 *
 *   Initial shard executions
 *   Retry executions
 *
 * This allows all executions to be reconstructed as one logical run.
 *
 * PERSISTENCE:
 *
 * artifacts/
 *   <runId>/
 *     manifest.json
 *     shard-1-attempt-0.json
 *     shard-2-attempt-0.json
 *     ...
 *
 * IMPORTANT ARCHITECTURE BOUNDARY:
 *
 * The orchestrator currently coordinates execution locally.
 *
 * GitHub Actions will later provide CI-level orchestration and
 * parallel execution across dynamic matrix jobs.
 *
 * The framework's normalized execution result and persisted artifacts
 * provide the contract required for those CI jobs to communicate.
 *
 * CURRENT ARCHITECTURE:
 *
 * Test Discovery
 *      ↓
 * Shard Manager
 *      ↓
 * Shard Executor
 *      ↓
 * Result Parser
 *      ↓
 * Execution Result
 *      ├──────────────→ Result Store
 *      └──────────────→ Run Manifest
 *      ↓
 * Failed Scenario Collection
 *      ↓
 * Retry Manager
 *      ↓
 * Retry Execution
 *      ├──────────────→ Result Store
 *      └──────────────→ Run Manifest
 *      ↓
 * Result Aggregator
 *      ↓
 * Final Scenario Results
 *
 * FUTURE:
 *
 * This orchestrator will eventually support additional execution modes,
 * including historical validation, while preserving the same normalized
 * execution-result contract.
 */

import { randomUUID } from 'node:crypto';
import { discoverTests } from './testDiscovery.js';
import { createShardPlan } from './shardManager.js';
import { executeShard } from './shardExecutor.js';
import { retryFailedTests } from './retryManager.js';
import { aggregateScenarioResults } from './resultAggregator.js';
import { getFailedScenarioResults } from './resultParser.js';
import { saveExecutionResult } from './resultStore.js';
import {
  createRunManifest,
  recordExecution,
} from './runManifest.js';

export async function runTestSuite(tag, scenariosPerShard, maxRetries) {
  const runId = randomUUID();
  await createRunManifest(runId, {
    executionMode: 'full-suite',
    tag,
    scenariosPerShard,
    maxRetries,
  });
  const tests = await discoverTests(tag);

  const shards = createShardPlan(tests, scenariosPerShard);

  const executions = [];
  const failedTestsByShard = new Map();

  for (const shard of shards) {
    const result = await executeShard(shard, runId, 'initial', 0);
    const file = `${result.executionType}-shard-${result.shard}-attempt-${result.attempt}.json`;
    await saveExecutionResult(result);
    await recordExecution(runId, {
      file,
      executionType: result.executionType,
      shard: result.shard,
      attempt: result.attempt,
    });
    executions.push({
      runId: result.runId,
      executionType: result.executionType,
      shard: result.shard,
      attempt: result.attempt,
      tests: result.tests,
    });

    failedTestsByShard.set(
      shard.shard,
      getFailedScenarioResults(result.tests),
    );
  }

  let retryAttempts = 0;

  if (maxRetries > 0) {
    for (const [shard, failedTests] of failedTestsByShard) {
      if (failedTests.length === 0) {
        continue;
      }

      const retryResult = await retryFailedTests(
        failedTests,
        maxRetries,
        runId,
        shard,
      );

      retryAttempts = Math.max(retryAttempts, retryResult.attempts);

      for (const retry of retryResult.results) {
        const file = `${retry.result.executionType}-shard-${retry.result.shard}-attempt-${retry.result.attempt}.json`;
        await saveExecutionResult(retry.result);

        await recordExecution(runId, {
          file,
          executionType: retry.result.executionType,
          shard: retry.result.shard,
          attempt: retry.result.attempt,
        });

        executions.push({
          runId: retry.result.runId,
          executionType: retry.result.executionType,
          shard: retry.result.shard,
          attempt: retry.result.attempt,
          tests: retry.result.tests,
        });
      }
    }
  }

  const scenarios = aggregateScenarioResults(executions);

  const passed = scenarios.filter(
    (scenario) => scenario.finalStatus === 'passed',
  );

  const failed = scenarios.filter(
    (scenario) => scenario.finalStatus === 'failed',
  );

  const recovered = scenarios.filter(
    (scenario) =>
      scenario.finalStatus === 'passed' &&
      scenario.history.some((execution) => execution.status === 'failed'),
  );

  return {
    runId,
    summary: {
      total: scenarios.length,
      passed: passed.length,
      failed: failed.length,
      recovered: recovered.length,
      shards: shards.length,
      retryAttempts,
    },
    scenarios,
  };
}
