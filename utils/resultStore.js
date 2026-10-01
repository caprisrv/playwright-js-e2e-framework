/*
 * PURPOSE:
 * Persists normalized execution results to disk.
 *
 * WHY THIS EXISTS:
 * Framework execution state cannot remain only in memory because
 * GitHub Actions shards will eventually execute in separate jobs.
 *
 * STORAGE:
 *
 * artifacts/
 *   <runId>/
 *     initial-shard-1-attempt-0.json
 *     retry-shard-1-attempt-1.json
 *     ...
 *
 * RUN ISOLATION:
 * Each run receives its own directory.
 *
 * This prevents executions from different runs from overwriting
 * or being confused with one another.
 *
 * RESPONSIBILITIES:
 *
 * saveExecutionResult()
 *   Persists one normalized execution result.
 *
 * loadExecutionResult()
 *   Loads a previously persisted execution result.
 *
 * IMPORTANT:
 * This utility knows nothing about Playwright.
 *
 * It stores the framework's normalized ExecutionResult contract.
 *
 * ARCHITECTURE:
 *
 * ExecutionResult
 *      ↓
 * Result Store
 *      ↓
 * JSON Artifact
 *
 * The persisted artifact can later be consumed by:
 *
 * - Result aggregation
 * - GitHub Actions
 * - Historical validation
 * - Reporting
 * - AI analysis
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const artifactsDirectory = path.resolve('artifacts');

export async function saveExecutionResult(result) {
  if (!result || !result.runId) {
    throw new Error('A valid execution result with runId is required');
  }

  const resultsDirectory = path.join(
    artifactsDirectory,
    result.runId,
  );

  await fs.mkdir(resultsDirectory, { recursive: true });

  const fileName = `${result.executionType}-shard-${result.shard}-attempt-${result.attempt}.json`;
  const filePath = path.join(resultsDirectory, fileName);

  await fs.writeFile(
    filePath,
    JSON.stringify(result, null, 2),
    'utf-8',
  );

  return filePath;
}

export async function loadExecutionResult(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');

  return JSON.parse(content);
}
