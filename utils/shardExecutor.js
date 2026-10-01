/*
 * PURPOSE:
 * Executes all test scenarios assigned to one shard.
 *
 * INPUT:
 * A shard containing individual test scenarios.
 *
 * SAMPLE INPUT:
 *
 * {
 *   shard: 1,
 *   tests: [
 *     {
 *       file: 'cart/add-to-cart.spec.js',
 *       line: 3
 *     },
 *     {
 *       file: 'login/login.spec.js',
 *       line: 5
 *     }
 *   ]
 * }
 *
 * INTERNALLY RUNS:
 *
 * npx playwright test \
 *   cart/add-to-cart.spec.js:3 \
 *   login/login.spec.js:5 \
 *   --reporter=json
 *
 * WHY FILE:LINE:
 * The framework shards individual scenarios rather than complete files.
 * Playwright supports executing an exact test location using file:line.
 *
 * OUTPUT:
 * Returns a normalized execution result:
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
 * TEST RESULT:
 * Each entry in tests contains normalized scenario information:
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
 * EXECUTION IDENTITY:
 *
 * runId + executionType + shard + attempt
 *
 * runId:
 * Identifies the overall test run.
 *
 * shard:
 * Identifies the shard execution.
 *
 * executionType identifies initial or retry execution. attempt is 0
 * for initial execution and 1+ for retries.
 *
 * IMPORTANT:
 * The executor returns normalized framework data rather than exposing
 * the raw Playwright JSON report to the rest of the framework.
 *
 * ARCHITECTURE:
 *
 * Shard
 *   ↓
 * Playwright Execution
 *   ↓
 * Playwright JSON
 *   ↓
 * Result Parser
 *   ↓
 * Normalized Execution Result
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  getScenarioResults,
} from './resultParser.js';

const execFileAsync = promisify(execFile);

// npx playwright test tests/cart/add-to-cart.spec.js:3 tests/login/login.spec.js:5 --reporter=json

export async function executeShard(shard, runId, executionType, attempt) {
  if (!shard || !Array.isArray(shard.tests) || shard.tests.length === 0) {
    throw new Error('Shard must contain at least one test');
  }

  if (!runId) {
    throw new Error('runId is required');
  }

  if (!['initial', 'retry'].includes(executionType)) {
    throw new Error("executionType must be 'initial' or 'retry'");
  }

  if (!Number.isInteger(attempt) || attempt < 0) {
    throw new Error('attempt must be a non-negative integer');
  }

  const testLocations = shard.tests.map(
    (test) => `${test.file}:${test.line}`,
  );

  try {
    const { stdout } = await execFileAsync(
      'npx',
      [
        'playwright',
        'test',
        ...testLocations,
        '--reporter=json',
      ],
      {
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    const report = JSON.parse(stdout);
    const scenarioResults = getScenarioResults(report);

    return {
      runId,
      executionType,
      shard: shard.shard,
      attempt,
      exitCode: 0,
      tests: scenarioResults,
    };
  } catch (error) {
    const report = error.stdout ? JSON.parse(error.stdout) : null;
    const scenarioResults = getScenarioResults(report);

    return {
      runId,
      executionType,
      shard: shard.shard,
      attempt,
      exitCode: error.code,
      tests: scenarioResults,
    };
  }
}
