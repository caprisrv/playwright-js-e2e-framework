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
