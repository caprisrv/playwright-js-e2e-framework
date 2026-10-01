/*
 * PURPOSE:
 * Maintains an incremental index of all executions belonging to
 * one overall test run.
 *
 * STORAGE:
 *
 * artifacts/
 *   <runId>/
 *     manifest.json
 *     initial-shard-1-attempt-0.json
 *     retry-shard-1-attempt-1.json
 *     ...
 *
 * MANIFEST RESPONSIBILITY:
 * The manifest answers:
 *
 * "Which executions belong to this run?"
 *
 * It does not contain the complete test results.
 * Individual execution JSON files remain the source of detailed
 * execution information.
 *
 * RESPONSIBILITIES:
 *
 * createRunManifest()
 *   Creates the initial run metadata.
 *
 * recordExecution()
 *   Adds a completed execution to the manifest.
 *
 * loadRunManifest()
 *   Loads the manifest for an existing run.
 *
 * INCREMENTAL DESIGN:
 * The manifest is updated immediately after each execution completes.
 *
 * WHY:
 * If a later execution or CI job fails, completed executions remain
 * discoverable.
 *
 * CURRENT METADATA:
 *
 * {
 *   runId,
 *   executionMode,
 *   tag,
 *   scenariosPerShard,
 *   maxRetries,
 *   executions: [...]
 * }
 *
 * Each execution entry identifies executionType, shard, and attempt.
 *
 * ARCHITECTURE:
 *
 * Run
 *  ↓
 * Manifest
 *  ├── Execution 1
 *  ├── Execution 2
 *  └── Retry Execution(s)
 *
 * The manifest acts as an index; execution JSON files contain the
 * detailed results.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const artifactsDirectory = path.resolve('artifacts');

function getManifestPath(runId) {
  return path.join(
    artifactsDirectory,
    runId,
    'manifest.json',
  );
}

export async function createRunManifest(runId, metadata = {}) {
  if (!runId) {
    throw new Error('runId is required');
  }

  const runDirectory = path.join(artifactsDirectory, runId);

  await fs.mkdir(runDirectory, { recursive: true });

  const manifest = {
    runId,
    ...metadata,
    executions: [],
  };

  await fs.writeFile(
    getManifestPath(runId),
    JSON.stringify(manifest, null, 2),
    'utf-8',
  );

  return manifest;
}

export async function recordExecution(runId, execution) {
  if (!runId) {
    throw new Error('runId is required');
  }

  if (!execution) {
    throw new Error('execution is required');
  }

  const manifestPath = getManifestPath(runId);
  const content = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);

  manifest.executions.push({
    file: execution.file,
    executionType: execution.executionType,
    shard: execution.shard,
    attempt: execution.attempt,
  });

  await fs.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8',
  );

  return manifest;
}

export async function loadRunManifest(runId) {
  if (!runId) {
    throw new Error('runId is required');
  }

  const content = await fs.readFile(
    getManifestPath(runId),
    'utf-8',
  );

  return JSON.parse(content);
}
