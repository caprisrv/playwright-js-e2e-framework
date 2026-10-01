/*
 * PURPOSE:
 * Converts a discovered scenario list into a dynamic shard plan.
 *
 * INPUT:
 *   - Discovered test scenarios
 *   - Number of scenarios allowed per shard
 *
 * EXAMPLE:
 *
 * 3 scenarios + 2 scenarios per shard
 *
 *   Shard 1 → scenarios 1, 2
 *   Shard 2 → scenario 3
 *
 * OUTPUT:
 * Returns an array of shard definitions:
 *
 * {
 *   shard: 1,
 *   tests: [...]
 * }
 *
 * IMPORTANT:
 * Sharding is performed at the scenario level, not the file level.
 *
 * WHY:
 * Multiple scenarios can exist in the same spec file.
 * The framework requirement is based on scenarios per shard.
 *
 * TEST LOCATION:
 * Each scenario contains file + line information so that the executor
 * can run the exact Playwright scenario using:
 *
 *   file:line
 *
 * ARCHITECTURE:
 *
 * Discovered Scenarios
 *        ↓
 * Scenario Count
 *        ↓
 * Shard Manager
 *        ↓
 * Dynamic Shard Plan
 */

export function createShardPlan(tests, scenariosPerShard) {
  if (!Number.isInteger(scenariosPerShard) || scenariosPerShard <= 0) {
    throw new Error('scenariosPerShard must be a positive integer');
  }

  if (!Array.isArray(tests)) {
    throw new Error('tests must be an array');
  }
// 3 tests + 2 scenarios per shard → 2 shards
// Input:  tests[], scenariosPerShard
// Output: shard plan containing test assignments
  const shards = [];

  for (let index = 0; index < tests.length; index += scenariosPerShard) {
    const shardTests = tests.slice(index, index + scenariosPerShard);

    shards.push({
      shard: shards.length + 1,
      tests: shardTests,
    });
  }

  return shards;
}