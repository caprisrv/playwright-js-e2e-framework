/*
 * PURPOSE:
 * Discovers Playwright test scenarios matching the requested tag and
 * creates a dynamic shard plan for framework execution.
 *
 * INPUT:
 * A Playwright test tag and the number of scenarios allowed per shard.
 *
 * Arguments:
 *
 *   --tag
 *   --scenarios-per-shard
 *
 * PROCESS:
 *
 * 1. Discover Playwright test scenarios matching the requested tag.
 * 2. Calculate the required number of shards based on the configured
 *    scenarios-per-shard value.
 * 3. Distribute scenarios across the generated shards.
 * 4. Output the complete shard plan as JSON.
 *
 * OUTPUT:
 * A shard plan:
 *
 * {
 *   tag,
 *   scenariosPerShard,
 *   totalScenarios,
 *   totalShards,
 *   shards: [...]
 * }
 *
 * DYNAMIC SHARDING:
 *
 * The number of shards is determined at runtime from:
 *
 *   total scenarios ÷ scenarios per shard
 *
 * Example:
 *
 * 5 scenarios
 * scenariosPerShard = 2
 *
 * Result:
 *
 *   Shard 1 → 2 scenarios
 *   Shard 2 → 2 scenarios
 *   Shard 3 → 1 scenario
 *
 * IMPORTANT:
 *
 * This script performs discovery and planning only.
 *
 * It does not execute tests.
 *
 * The generated shard plan is consumed by GitHub Actions to dynamically
 * create the execution matrix.
 *
 * COMMAND:
 *
 * node scripts/discover-tests.js \
 *   --tag "<TAG>" \
 *   --scenarios-per-shard "<SCENARIOS_PER_SHARD>"
 *
 * EXAMPLE:
 *
 * node scripts/discover-tests.js \
 *   --tag "@regression" \
 *   --scenarios-per-shard "2"
 *
 * ARCHITECTURE:
 *
 * Playwright Test Discovery
 *          ↓
 * Filter by Tag
 *          ↓
 * Discovered Scenarios
 *          ↓
 * Shard Manager
 *          ↓
 * Dynamic Shard Plan
 *          ↓
 * GitHub Actions Matrix
 *          ↓
 * Parallel Shard Execution
 */

import { discoverTests } from '../utils/testDiscovery.js';
import { createShardPlan } from '../utils/shardManager.js';

function getArgument(name) {
  const argumentIndex = process.argv.indexOf(name);

  if (
    argumentIndex === -1 ||
    argumentIndex === process.argv.length - 1 ||
    process.argv[argumentIndex + 1] === undefined
  ) {
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