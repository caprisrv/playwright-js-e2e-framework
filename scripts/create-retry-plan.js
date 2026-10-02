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
