import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { log } from 'node:console';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const WORKFLOW_FILE = '.github/workflows/e2e.yml';
const EXECUTION_ARTIFACT_PREFIX = 'execution-result-';

function requireGitHubToken() {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('Missing required environment variable: GITHUB_TOKEN');
  }

  return process.env.GITHUB_TOKEN;
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
        GH_TOKEN: requireGitHubToken(),
      },
    },
  );

  return JSON.parse(stdout);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getSourceWorkflowRun(repository, sourceRunId) {
  return ghApi(
    `/repos/${repository}/actions/runs/${sourceRunId}`,
  );
}

export async function getWorkflowRuns(repository) {
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

export function findRelatedWorkflowRuns(
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

export async function getExecutionArtifacts(
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

export async function downloadArtifact(
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

export async function loadExecutionResults(
  repository,
  relatedRuns,
  temporaryDirectory,
) {
  const executions = [];

  for (const relatedRun of relatedRuns) {
    const workflowRunId = relatedRun.workflowRun.id;

    log(
      `Inspecting workflow run ${workflowRunId} (attempt ${relatedRun.attempt})`,
    );

    const artifacts = await getExecutionArtifacts(
      repository,
      workflowRunId,
    );

    if (artifacts.length === 0) {
      log(
        `No execution-result artifacts found for workflow run ${workflowRunId}`,
      );

      continue;
    }

    for (const artifact of artifacts) {
      log(
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
