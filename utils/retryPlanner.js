import fs from 'node:fs/promises';
import path from 'node:path';

import { createShardPlan } from './shardManager.js';

export async function loadExecutionResults(resultsDirectory) {
  const entries = await fs.readdir(resultsDirectory, {
    withFileTypes: true,
  });

  const resultFilePattern =
    /^(initial|retry)-shard-.+-attempt-\d+\.json$/;

  const resultFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        resultFilePattern.test(entry.name),
    )
    .map((entry) => path.join(resultsDirectory, entry.name))
    .sort();

  const results = [];

  for (const resultFile of resultFiles) {
    const content = await fs.readFile(resultFile, 'utf-8');
    results.push(JSON.parse(content));
  }

  return results;
}

export function getFailedScenarios(executionResults) {
  const failedScenarios = new Map();

  for (const execution of executionResults) {
    if (!execution || !Array.isArray(execution.tests)) {
      throw new Error(
        'Each execution result must contain a tests array',
      );
    }

    for (const test of execution.tests) {
      if (test.status !== 'failed') {
        continue;
      }

      const key = test.id || `${test.file}:${test.line}`;

      if (!failedScenarios.has(key)) {
        failedScenarios.set(key, test);
      }
    }
  }

  return [...failedScenarios.values()];
}

export function createRetryPlan(
  failedScenarios,
  scenariosPerShard,
  attempt,
) {
  if (!Number.isInteger(attempt) || attempt <= 0) {
    throw new Error('attempt must be a positive integer');
  }

  const shards = createShardPlan(
    failedScenarios,
    scenariosPerShard,
  );

  return {
    attempt,
    totalFailedScenarios: failedScenarios.length,
    totalShards: shards.length,
    shards,
  };
}
