/*
 * PURPOSE:
 * Builds the next retry shard plan from execution results produced by
 * the current framework execution attempt.
 *
 * INPUT:
 * Execution-result JSON files from the current execution attempt and
 * the number of scenarios allowed per shard.
 *
 * Arguments:
 *
 *   --results-directory
 *   --scenarios-per-shard
 *   --attempt
 *   --output
 *
 * PROCESS:
 *
 * 1. Load all execution results from the specified results directory.
 * 2. Identify scenarios whose current execution status is FAILED.
 * 3. Create a new shard plan containing only those failed scenarios.
 * 4. Assign the next retry attempt number to the plan.
 *
 * OUTPUT:
 * A retry shard plan:
 *
 * {
 *   attempt,
 *   totalFailedScenarios,
 *   totalShards,
 *   shards: [...]
 * }
 *
 * RETRY BEHAVIOR:
 *
 * Only scenarios that failed in the current execution attempt are
 * included in the next retry plan.
 *
 * Example:
 *
 * Initial execution:
 *   Scenario A → PASSED
 *   Scenario B → FAILED
 *   Scenario C → PASSED
 *
 * Retry plan:
 *   Scenario B only
 *
 * If Scenario B passes during the retry, it is not included in the
 * following retry plan.
 *
 * IMPORTANT:
 *
 * This script creates the retry plan for the NEXT execution attempt.
 *
 * It does not determine the final status of the overall logical run.
 * Final scenario status across the complete initial/retry history is
 * handled by the Result Aggregator.
 *
 * COMMAND:
 *
 * node scripts/create-retry-plan.js \
 *   --results-directory "<RESULTS_DIRECTORY>" \
 *   --scenarios-per-shard "<SCENARIOS_PER_SHARD>" \
 *   --attempt "<NEXT_ATTEMPT>" \
 *   --output "<OUTPUT_FILE>"
 *
 * EXAMPLE:
 *
 * node scripts/create-retry-plan.js \
 *   --results-directory "artifacts/execution-results" \
 *   --scenarios-per-shard "2" \
 *   --attempt "1" \
 *   --output "artifacts/retry/retry-plan.json"
 *
 * ARCHITECTURE:
 *
 * Execution Results
 *        ↓
 * Failed Scenarios
 *        ↓
 * Retry Planner
 *        ↓
 * Retry Shard Plan
 *        ↓
 * Next Retry Execution
 */

import fs from 'node:fs/promises';

import {
  loadExecutionResults,
  getFailedScenarios,
  createRetryPlan,
} from '../utils/retryPlanner.js';

function getArgument(name) {
  const argumentIndex = process.argv.indexOf(name);

  if (argumentIndex === -1 || !process.argv[argumentIndex + 1]) {
    throw new Error(`Missing required argument: ${name}`);
  }

  return process.argv[argumentIndex + 1];
}

const resultsDirectory = getArgument('--results-directory');

const scenariosPerShard = Number(
  getArgument('--scenarios-per-shard'),
);

const attempt = Number(
  getArgument('--attempt'),
);

if (
  !Number.isInteger(scenariosPerShard) ||
  scenariosPerShard <= 0
) {
  throw new Error(
    '--scenarios-per-shard must be a positive integer',
  );
}

const executionResults = await loadExecutionResults(
  resultsDirectory,
);

const failedScenarios = getFailedScenarios(
  executionResults,
);

const retryPlan = createRetryPlan(
  failedScenarios,
  scenariosPerShard,
  attempt,
);

const outputFile = getArgument('--output');

await fs.writeFile(
  outputFile,
  JSON.stringify(retryPlan, null, 2),
  'utf-8',
);

console.log(
  `Retry plan created: ${outputFile}`,
);

console.log(
  `Failed scenarios: ${retryPlan.totalFailedScenarios}`,
);

console.log(
  `Retry shards: ${retryPlan.totalShards}`,
);
