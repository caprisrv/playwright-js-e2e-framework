import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { aggregateScenarioResults } from '../utils/resultAggregator.js';
import {
  findRelatedWorkflowRuns,
  getWorkflowRuns,
  loadExecutionResults,
} from '../utils/githubExecutionResults.js';

function getArgument(name) {
  const index = process.argv.indexOf(name);

  if (index === -1 || !process.argv[index + 1]) {
    throw new Error(`Missing required argument: ${name}`);
  }

  return process.argv[index + 1];
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatStatus(status) {
  return String(status || 'unknown')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .toUpperCase();
}

function statusClass(status) {
  if (status === 'passed') return 'passed';
  if (status === 'failed' || status === 'timedOut') return 'failed';
  if (status === 'skipped') return 'skipped';
  return 'other';
}

function renderScenario(scenario) {
  const history = scenario.history
    .map((execution) => {
      const attemptLabel = execution.attempt === 0
        ? 'Initial execution'
        : `Retry ${execution.attempt}`;

      return `<li>
        <span class="attempt-name">${escapeHtml(attemptLabel)}</span>
        <span class="badge ${statusClass(execution.status)}">${escapeHtml(formatStatus(execution.status))}</span>
        <span class="attempt-meta">Shard ${escapeHtml(execution.shard)} · ${escapeHtml(execution.executionType)} · Run ${escapeHtml(execution.runId)}</span>
      </li>`;
    })
    .join('');

  const title = escapeHtml(scenario.title);
  const location = `${escapeHtml(scenario.file)}:${escapeHtml(scenario.line)}`;
  const attemptCount = scenario.history.length;
  const recovered = scenario.finalStatus === 'passed'
    && scenario.history.some((execution) => execution.status === 'failed');

  return `<tr data-status="${escapeHtml(scenario.finalStatus)}" data-search="${escapeHtml(`${scenario.title} ${scenario.file}`.toLowerCase())}">
    <td>
      <div class="scenario-title">${title}</div>
      <div class="scenario-location">${location}</div>
    </td>
    <td><span class="badge ${statusClass(scenario.finalStatus)}">${escapeHtml(formatStatus(scenario.finalStatus))}</span>${recovered ? '<span class="recovered-label">Recovered on retry</span>' : ''}</td>
    <td>
      <details>
        <summary>${attemptCount} ${attemptCount === 1 ? 'attempt' : 'attempts'}</summary>
        <ol class="history">${history}</ol>
      </details>
    </td>
  </tr>`;
}

function renderReport(scenarios, runId) {
  const passed = scenarios.filter((scenario) => scenario.finalStatus === 'passed').length;
  const failed = scenarios.filter((scenario) => scenario.finalStatus === 'failed').length;
  const recovered = scenarios.filter((scenario) =>
    scenario.finalStatus === 'passed'
    && scenario.history.some((execution) => execution.status === 'failed'),
  ).length;
  const generatedAt = new Date().toISOString();
  const rows = scenarios.map(renderScenario).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Consolidated E2E Report · Run ${escapeHtml(runId)}</title>
  <style>
    :root { color-scheme: light; --ink: #26364a; --muted: #718096; --line: #e5eaf0; --navy: #172b4d; --blue: #3976c5; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4f7fb; color: var(--ink); font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header { padding: 28px max(24px, calc((100% - 1180px) / 2)); background: var(--navy); color: white; }
    header h1 { margin: 0 0 6px; font-size: 24px; font-weight: 650; }
    header p { margin: 0; color: #c8d3e1; }
    main { max-width: 1180px; margin: 26px auto; padding: 0 24px; }
    .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 22px; }
    .metric, .panel { background: white; border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 2px 5px #182b4510; }
    .metric { padding: 16px 18px; }
    .metric-label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
    .metric-value { display: block; margin-top: 4px; font-size: 25px; font-weight: 700; }
    .panel { overflow: hidden; }
    .panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; border-bottom: 1px solid var(--line); }
    .panel-heading h2 { margin: 0; font-size: 16px; }
    input { width: min(310px, 50vw); padding: 9px 11px; border: 1px solid #cbd5e0; border-radius: 5px; font: inherit; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 11px 16px; color: var(--muted); background: #f8fafc; font-size: 11px; letter-spacing: .06em; text-align: left; text-transform: uppercase; }
    td { padding: 14px 16px; border-top: 1px solid var(--line); vertical-align: top; }
    .scenario-title { font-weight: 600; }
    .scenario-location, .attempt-meta { color: var(--muted); font-size: 12px; overflow-wrap: anywhere; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: .025em; white-space: nowrap; }
    .badge.passed { color: #176b42; background: #e2f5e9; }
    .badge.failed { color: #a52b35; background: #fde7e8; }
    .badge.skipped { color: #725a16; background: #fff4cc; }
    .badge.other { color: #526276; background: #e9eef4; }
    .recovered-label { display: block; margin-top: 5px; color: #39704e; font-size: 11px; }
    details summary { color: var(--blue); cursor: pointer; }
    .history { display: grid; gap: 8px; min-width: 280px; margin: 10px 0 0; padding: 0; list-style: none; }
    .history li { display: grid; grid-template-columns: 130px auto; gap: 4px 8px; align-items: center; }
    .attempt-name { font-weight: 600; }
    .attempt-meta { grid-column: 1 / -1; }
    .empty { padding: 28px; color: var(--muted); text-align: center; }
    footer { padding: 18px 0 30px; color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) { .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); } .panel-heading { align-items: flex-start; flex-direction: column; } input { width: 100%; } table, tbody, tr, td { display: block; } thead { display: none; } td { border-top: 0; padding-top: 8px; padding-bottom: 8px; } tr { padding: 10px 0; border-top: 1px solid var(--line); } }
  </style>
</head>
<body>
  <header>
    <h1>Consolidated E2E Test Report</h1>
    <p>Run ID ${escapeHtml(runId)} · Generated ${escapeHtml(generatedAt)}</p>
  </header>
  <main>
    <section class="summary" aria-label="Execution summary">
      <div class="metric"><span class="metric-label">Scenarios</span><span class="metric-value">${scenarios.length}</span></div>
      <div class="metric"><span class="metric-label">Passed</span><span class="metric-value">${passed}</span></div>
      <div class="metric"><span class="metric-label">Failed</span><span class="metric-value">${failed}</span></div>
      <div class="metric"><span class="metric-label">Recovered</span><span class="metric-value">${recovered}</span></div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Scenario Results</h2><input id="scenario-search" type="search" placeholder="Search scenarios…" aria-label="Search scenarios"></div>
      ${scenarios.length === 0 ? '<div class="empty">No scenario results were found for this run.</div>' : `<table>
        <thead><tr><th>Scenario</th><th>Final status</th><th>Attempt history</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`}
    </section>
    <footer>Final statuses come from the latest recorded execution. Retry attempts remain available in each scenario’s history.</footer>
  </main>
  <script>
    document.getElementById('scenario-search')?.addEventListener('input', (event) => {
      const query = event.target.value.toLowerCase();
      document.querySelectorAll('tbody tr').forEach((row) => {
        row.hidden = !row.dataset.search.includes(query);
      });
    });
  </script>
</body>
</html>`;
}

async function main() {
  const runId = getArgument('--run-id');
  const outputFile = path.resolve(getArgument('--output'));
  const repository = process.env.GITHUB_REPOSITORY;

  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required');
  }

  const workflowRuns = await getWorkflowRuns(repository);
  const relatedRuns = findRelatedWorkflowRuns(workflowRuns, runId);

  if (relatedRuns.length === 0) {
    throw new Error(`No workflow runs found for logical run ${runId}`);
  }

  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'extent-style-report-'),
  );

  try {
    const executions = await loadExecutionResults(
      repository,
      relatedRuns,
      temporaryDirectory,
    );

    if (executions.length === 0) {
      throw new Error(`No execution results found for logical run ${runId}`);
    }

    const scenarios = aggregateScenarioResults(executions);
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, renderReport(scenarios, runId), 'utf-8');

    console.log(`Consolidated report created: ${outputFile}`);
    console.log(`Scenarios: ${scenarios.length}`);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
