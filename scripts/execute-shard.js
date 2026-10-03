/*
 * PURPOSE:
 * Executes the scenarios assigned to a single framework shard and
 * persists the normalized execution result for downstream processing.
 *
 * INPUT:
 * A shard definition, logical run ID, execution type, and attempt number.
 *
 * Arguments:
 *
 *   --shard-file
 *   --run-id
 *   --execution-type
 *   --attempt
 *
 * PROCESS:
 *
 * 1. Load the assigned shard definition.
 * 2. Validate the execution context.
 * 3. Execute only the scenarios assigned to the shard.
 * 4. Capture the Playwright execution outcome.
 * 5. Normalize the results into the framework execution-result contract.
 * 6. Persist the execution result under the logical run directory.
 * 7. Return a non-zero process exit code when the shard contains failures.
 *
 * OUTPUT:
 * A normalized execution result:
 *
 * {
 *   runId,
 *   executionType,
 *   shard,
 *   attempt,
 *   exitCode,
 *   tests: [...]
 * }
 *
 * EXECUTION TYPES:
 *
 * initial
 *   Represents the first execution of the scenarios.
 *
 * retry
 *   Represents execution of scenarios selected by the retry planner.
 *
 * RETRY BEHAVIOR:
 *
 * The script itself does not decide which scenarios should be retried.
 *
 * Scenario selection is handled by the Retry Planner.
 *
 * This script is responsible only for executing the shard it receives
 * and producing normalized results.
 *
 * IMPORTANT:
 *
 * Test execution and result persistence are intentionally separated.
 *
 * Playwright produces the raw execution information.
 *
 * The framework converts that information into a normalized execution
 * result that can be consumed by retry planning, historical validation,
 * aggregation, and reporting.
 *
 * COMMAND:
 *
 * node scripts/execute-shard.js \
 *   --shard-file "<SHARD_FILE>" \
 *   --run-id "<RUN_ID>" \
 *   --execution-type "<EXECUTION_TYPE>" \
 *   --attempt "<ATTEMPT>"
 *
 * EXAMPLE:
 *
 * node scripts/execute-shard.js \
 *   --shard-file "artifacts/shard-1.json" \
 *   --run-id "37082255394" \
 *   --execution-type "initial" \
 *   --attempt "0"
 *
 * ARCHITECTURE:
 *
 * Shard Plan
 *      ↓
 * Shard Executor
 *      ↓
 * Playwright Test Execution
 *      ↓
 * Normalized Execution Result
 *      ↓
 * Result Store
 *      ↓
 * Retry / Aggregation / Historical Validation / Reporting
 */

import fs from 'node:fs/promises';

import { executeShard } from '../utils/shardExecutor.js';
import { saveExecutionResult } from '../utils/resultStore.js';

function getArgument(name) {
  const argumentIndex = process.argv.indexOf(name);

  if (argumentIndex === -1 || !process.argv[argumentIndex + 1]) {
    throw new Error(`Missing required argument: ${name}`);
  }

  return process.argv[argumentIndex + 1];
}

const shardFile = getArgument('--shard-file');
const runId = getArgument('--run-id');
const executionType = getArgument('--execution-type');
const attempt = Number(getArgument('--attempt'));

if (!Number.isInteger(attempt) || attempt < 0) {
  throw new Error('--attempt must be a non-negative integer');
}

const shardContent = await fs.readFile(shardFile, 'utf-8');
const shard = JSON.parse(shardContent);

const result = await executeShard(
  shard,
  runId,
  executionType,
  attempt,
);

const resultFile = await saveExecutionResult(result);

console.log(`Execution result saved: ${resultFile}`);

if (result.exitCode !== 0) {
  process.exitCode = 1;
}
