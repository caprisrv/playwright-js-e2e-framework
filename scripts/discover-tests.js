import { discoverTests } from '../utils/testDiscovery.js';
import { createShardPlan } from '../utils/shardManager.js';

function getArgument(name) {
  const argumentIndex = process.argv.indexOf(name);

  if (argumentIndex === -1 || !process.argv[argumentIndex + 1]) {
    throw new Error(`Missing required argument: ${name}`);
  }

  return process.argv[argumentIndex + 1];
}

const tag = getArgument('--tag');
const scenariosPerShard = Number(
  getArgument('--scenarios-per-shard'),
);

if (!Number.isInteger(scenariosPerShard) || scenariosPerShard <= 0) {
  throw new Error(
    '--scenarios-per-shard must be a positive integer',
  );
}

const tests = await discoverTests(tag);
const shards = createShardPlan(
  tests,
  scenariosPerShard,
);

const shardPlan = {
  tag,
  scenariosPerShard,
  totalScenarios: tests.length,
  totalShards: shards.length,
  shards,
};

console.log(JSON.stringify(shardPlan, null, 2));