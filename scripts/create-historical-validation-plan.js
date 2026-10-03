/*
 * PURPOSE:
 * Builds a historical validation shard plan from a previous framework run.
 *
 * INPUT:
 * A source GitHub Actions workflow run ID and the number of scenarios
 * allowed per shard:
 *
 *   --source-run-id
 *   --scenarios-per-shard
 *   --output
 *
 * The source run represents the original logical framework execution.
 * Its automatic-retry workflow runs are discovered and included as part
 * of the same execution history.
 *
 * PROCESS:
 *
 * 1. Locate the source workflow run.
 * 2. Locate all automatic-retry workflow runs associated with the
 *    source run.
 * 3. Retrieve execution-result artifacts from all related workflow runs.
 * 4. Aggregate all execution results at scenario level.
 * 5. Identify scenarios whose final status is still FAILED.
 * 6. Create a new shard plan containing only those unresolved failures.
 *
 * OUTPUT:
 * A historical validation shard plan:
 *
 * {
 *   executionMode,
 *   sourceRunId,
 *   sourceWorkflowRunIds,
 *   scenariosPerShard,
 *   totalScenarios,
 *   totalShards,
 *   shards: [...]
 * }
 *
 * HISTORICAL VALIDATION:
 *
 * Historical validation does not re-run the complete original suite.
 *
 * It selects only scenarios that remained FAILED after the original
 * execution and all automatic retry attempts.
 *
 * EXAMPLE:
 *
 * Initial Run:
 *   Scenario A → PASSED
 *   Scenario B → FAILED
 *   Scenario C → FAILED
 *
 * Retry 1:
 *   Scenario B → PASSED
 *   Scenario C → FAILED
 *
 * Retry 2:
 *   Scenario C → FAILED
 *
 * Historical Validation:
 *   Scenario C only
 *
 * IMPORTANT:
 *
 * Retry-plan artifacts are not used to determine the final historical
 * failure set. The complete execution-result history is reconstructed
 * from the original run and its retry workflow runs.
 *
 * This ensures that a scenario that initially fails but passes during
 * retry is not incorrectly selected for historical validation.
 *
 * ARCHITECTURE:
 *
 * GitHub Actions Source Run
 *          ↓
 * Automatic Retry Workflow Runs
 *          ↓
 * Execution Result Artifacts
 *          ↓
 * Result Aggregator
 *          ↓
 * Final Scenario Status
 *          ↓
 * Unresolved Failed Scenarios
 *          ↓
 * Dynamic Shard Plan
 *          ↓
 * Historical Validation Execution
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { aggregateScenarioResults } from '../utils/resultAggregator.js';
import { createShardPlan } from '../utils/shardManager.js';

const execFileAsync = promisify(execFile);

const WORKFLOW_FILE = '.github/workflows/e2e.yml';
const EXECUTION_ARTIFACT_PREFIX = 'execution-result-';

function getArgument(name) {
  const argumentIndex = process.argv.indexOf(name);

  if (
    argumentIndex === -1 ||
    !process.argv[argumentIndex + 1]
  ) {
    throw new Error(`Missing required argument: ${name}`);
  }

  return process.argv[argumentIndex + 1];
}

function requireEnvironment(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return process.env[name];
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function ghApi(endpoint) {
  const { stdout } = await execFileAsync(
    'gh',
    [
      'api',
      endpoint,
      '--header',
      'Accept: application/vnd.github+json',
      '--header',
      'X-GitHub-Api-Version: 2026-03-10',
    ],
    {
      env: {
        ...process.env,
        GH_TOKEN: requireEnvironment('GITHUB_TOKEN'),
      },
    },
  );

  return JSON.parse(stdout);
}

async function getSourceWorkflowRun(repository, sourceRunId) {
  return ghApi(
    `/repos/${repository}/actions/runs/${sourceRunId}`,
  );
}

async function getWorkflowRuns(repository) {
  const runs = [];
  let page = 1;

  while (true) {
    const response = await ghApi(
      `/repos/${repository}/actions/workflows/${encodeURIComponent(
        WORKFLOW_FILE,
      )}/runs?per_page=100&page=${page}`,
    );

    runs.push(...response.workflow_runs);

    if (response.workflow_runs.length < 100) {
      break;
    }

    page += 1;
  }

  return runs;
}

function findRelatedWorkflowRuns(
  workflowRuns,
  sourceRunId,
) {
  const retryPattern = new RegExp(
    `^Retry Failed Tests - Run ID ${escapeRegex(
      sourceRunId,
    )} - Attempt (\\d+)$`,
  );

  const relatedRuns = [];

  for (const workflowRun of workflowRuns) {
    if (String(workflowRun.id) === String(sourceRunId)) {
      relatedRuns.push({
        workflowRun,
        attempt: 0,
      });

      continue;
    }

    const match = workflowRun.display_title?.match(
      retryPattern,
    );

    if (!match) {
      continue;
    }

    relatedRuns.push({
      workflowRun,
      attempt: Number(match[1]),
    });
  }

  return relatedRuns.sort(
    (left, right) => left.attempt - right.attempt,
  );
}

async function getExecutionArtifacts(
  repository,
  workflowRunId,
) {
  const artifacts = [];
  let page = 1;

  while (true) {
    const response = await ghApi(
      `/repos/${repository}/actions/runs/${workflowRunId}/artifacts?per_page=100&page=${page}`,
    );

    artifacts.push(...response.artifacts);

    if (response.artifacts.length < 100) {
      break;
    }

    page += 1;
  }

  return artifacts.filter(
    (artifact) =>
      !artifact.expired &&
      artifact.name.startsWith(
        EXECUTION_ARTIFACT_PREFIX,
      ),
  );
}

async function downloadArtifact(
  repository,
  artifact,
  destinationDirectory,
) {
  const extractionDirectory = path.join(
    destinationDirectory,
    String(artifact.id),
  );

  await fs.mkdir(extractionDirectory, {
    recursive: true,
  });

  await execFileAsync(
    'gh',
    [
      'run',
      'download',
      String(artifact.workflow_run.id),
      '--repo',
      repository,
      '--name',
      artifact.name,
      '--dir',
      extractionDirectory,
    ],
    {
      env: {
        ...process.env,
        GH_TOKEN:
          process.env.GITHUB_TOKEN ||
          process.env.GH_TOKEN,
      },
    },
  );

  return extractionDirectory;
}

async function loadExecutionResults(
  repository,
  relatedRuns,
  temporaryDirectory,
) {
  const executions = [];

  for (const relatedRun of relatedRuns) {
    const workflowRunId = relatedRun.workflowRun.id;

    console.log(
      `Inspecting workflow run ${workflowRunId} (attempt ${relatedRun.attempt})`,
    );

    const artifacts = await getExecutionArtifacts(
      repository,
      workflowRunId,
    );

    if (artifacts.length === 0) {
      console.log(
        `No execution-result artifacts found for workflow run ${workflowRunId}`,
      );

      continue;
    }

    for (const artifact of artifacts) {
      console.log(
        `Downloading artifact: ${artifact.name}`,
      );

      const extractionDirectory =
        await downloadArtifact(
          repository,
          artifact,
          temporaryDirectory,
        );

      const entries = await fs.readdir(
        extractionDirectory,
        {
          withFileTypes: true,
        },
      );

      for (const entry of entries) {
        if (
          !entry.isFile() ||
          !entry.name.endsWith('.json')
        ) {
          continue;
        }

        const resultFile = path.join(
          extractionDirectory,
          entry.name,
        );

        const result = JSON.parse(
          await fs.readFile(resultFile, 'utf-8'),
        );

        executions.push(result);
      }
    }
  }

  return executions;
}

async function main() {
  const sourceRunId = getArgument(
    '--source-run-id',
  );

  const scenariosPerShard = Number(
    getArgument('--scenarios-per-shard'),
  );

  const outputFile = getArgument('--output');

  if (
    !Number.isInteger(scenariosPerShard) ||
    scenariosPerShard <= 0
  ) {
    throw new Error(
      '--scenarios-per-shard must be a positive integer',
    );
  }

  const repository = requireEnvironment(
    'GITHUB_REPOSITORY',
  );

  console.log(
    `Building historical validation plan from source run ${sourceRunId}`,
  );

  const sourceWorkflowRun =
    await getSourceWorkflowRun(
      repository,
      sourceRunId,
    );

  console.log(
    `Source workflow: ${sourceWorkflowRun.name}`,
  );

  console.log(
    `Source branch: ${sourceWorkflowRun.head_branch}`,
  );

  const workflowRuns =
    await getWorkflowRuns(repository);

  const relatedRuns =
    findRelatedWorkflowRuns(
      workflowRuns,
      sourceRunId,
    );

  if (relatedRuns.length === 0) {
    throw new Error(
      `No workflow runs found for source run ${sourceRunId}`,
    );
  }

  console.log(
    `Found ${relatedRuns.length} related workflow run(s)`,
  );

  for (const relatedRun of relatedRuns) {
    console.log(
      `- workflow run ${relatedRun.workflowRun.id}, attempt ${relatedRun.attempt}, title: ${relatedRun.workflowRun.display_title}`,
    );
  }

  const temporaryDirectory =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        'historical-validation-',
      ),
    );

  try {
    const executions =
      await loadExecutionResults(
        repository,
        relatedRuns,
        temporaryDirectory,
      );

    if (executions.length === 0) {
      throw new Error(
        `No execution results were found for source run ${sourceRunId}`,
      );
    }

    console.log(
      `Loaded ${executions.length} execution result(s)`,
    );

    const scenarios =
      aggregateScenarioResults(executions);

    const failedScenarios =
      scenarios.filter(
        (scenario) =>
          scenario.finalStatus === 'failed',
      );

    console.log(
      `Total scenarios found: ${scenarios.length}`,
    );

    console.log(
      `Final unresolved failures: ${failedScenarios.length}`,
    );

    if (failedScenarios.length === 0) {
      throw new Error(
        `No unresolved failed scenarios found in source run ${sourceRunId}`,
      );
    }

    for (const scenario of failedScenarios) {
      console.log(
        `Historical scenario: ${scenario.file}:${scenario.line} - ${scenario.title}`,
      );
    }

    const shards = createShardPlan(
      failedScenarios,
      scenariosPerShard,
    );

    const historicalPlan = {
      executionMode: 'historical-validation',
      sourceRunId,
      sourceWorkflowRunIds:
        relatedRuns.map(
          (relatedRun) =>
            relatedRun.workflowRun.id,
        ),
      scenariosPerShard,
      totalScenarios:
        failedScenarios.length,
      totalShards: shards.length,
      shards,
    };

    await fs.mkdir(
      path.dirname(outputFile),
      {
        recursive: true,
      },
    );

    await fs.writeFile(
      outputFile,
      `${JSON.stringify(
        historicalPlan,
        null,
        2,
      )}\n`,
      'utf-8',
    );

    console.log(
      `Historical validation plan written to ${outputFile}`,
    );
  } finally {
    await fs.rm(
      temporaryDirectory,
      {
        recursive: true,
        force: true,
      },
    );
  }
}

await main();
