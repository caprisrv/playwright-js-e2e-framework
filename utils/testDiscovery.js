/*
 * PURPOSE:
 * Discovers individual Playwright test scenarios matching a tag.
 *
 * INPUT:
 * A Playwright test tag.
 *
 * EXAMPLES:
 *   @regression
 *   @smoke
 *
 * INTERNALLY RUNS:
 * npx playwright test --grep <tag> --list --reporter=json
 *
 * WHY DISCOVERY EXISTS:
 * The framework needs to know the exact scenarios that belong to a
 * requested execution before it can calculate dynamic shards.
 *
 * OUTPUT:
 * Returns an array of normalized test scenarios:
 *
 * {
 *   id,
 *   title,
 *   file,
 *   line,
 *   column,
 *   tags
 * }
 *
 * IMPORTANT:
 * Discovery does not execute tests.
 * It only identifies the scenarios that would be executed.
 *
 * ARCHITECTURE:
 *
 * Tag
 *   ↓
 * Playwright Discovery
 *   ↓
 * Scenario List
 *   ↓
 * Shard Manager
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// npx playwright test --grep @regression --list --reporter=json
export async function discoverTests(tag) {
  const normalizedTag = tag.startsWith('@') ? tag : `@${tag}`;

  const { stdout } = await execFileAsync(
    'npx',
    [
      'playwright',
      'test',
      '--grep',
      normalizedTag,
      '--list',
      '--reporter=json',
    ],
    {
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  const report = JSON.parse(stdout);

  return report.suites.flatMap((suite) =>
    suite.specs.map((spec) => ({
      id: spec.id,
      title: spec.title,
      file: spec.file,
      line: spec.line,
      column: spec.column,
      tags: spec.tags,
    })),
  );
}