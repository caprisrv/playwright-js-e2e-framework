function extractUserStory(description) {
  const lines = description.split('\n').map((line) => line.trim());
  const start = lines.findIndex((line) => /^user story:?$/i.test(line));

  if (start === -1) {
    return [];
  }

  const statements = [];

  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^(background|acceptance criteria|out of scope)\s*:?\s*$/i.test(lines[i])) {
      break;
    }

    if (lines[i]) {
      statements.push(lines[i]);
    }
  }

  if (statements.length === 0) {
    return [];
  }

  return [
    {
      id: 'REQ-1',
      description: statements.join(' '),
      sourceReference: 'description:User Story',
    },
  ];
}

function extractAcceptanceCriteria(description) {
  const lines = description.split('\n').map((line) => line.trim());
  const start = lines.findIndex((line) => /^acceptance criteria\s*:?\s*$/i.test(line));

  if (start === -1) {
    return [];
  }

  const criteria = [];
  let current = null;
  let unnumberedCount = 0;

  function saveCurrent() {
    if (!current) {
      return;
    }

    criteria.push({
      id: current.id,
      title: current.title,
      description: current.descriptionLines.join(' ').trim(),
      sourceReference: current.sourceReference,
      testability: 'not_assessed',
    });

    current = null;
  }

  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];

    if (/^out of scope\s*:?\s*$/i.test(line)) {
      break;
    }

    const numbered = line.match(/^(AC\d+)\s*:\s*(.+)$/i);

    if (numbered) {
      saveCurrent();

      current = {
        id: numbered[1].toUpperCase(),
        title: numbered[2].trim(),
        descriptionLines: [],
        sourceReference: `description:${numbered[1].toUpperCase()}`,
      };

      continue;
    }

    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);

    if (bullet) {
      saveCurrent();
      unnumberedCount += 1;

      current = {
        id: `AC-UNNUMBERED-${unnumberedCount}`,
        title: bullet[1].trim(),
        descriptionLines: [],
        sourceReference: `description:acceptance-criteria-item-${unnumberedCount}`,
      };

      continue;
    }

    if (line && current) {
      current.descriptionLines.push(line);
    }
  }

  saveCurrent();

  return criteria;
}

export class RequirementAnalyzer {
  constructor({ clock = () => new Date() } = {}) {
    this.clock = clock;
  }

  async analyze(issue) {
    if (!issue || typeof issue !== 'object' || !issue.key) {
      throw new Error('A Jira issue with a valid key is required for analysis.');
    }

    const description = typeof issue.description === 'string' ? issue.description : '';

    const requirements = extractUserStory(description);
    const acceptanceCriteria = extractAcceptanceCriteria(description);
    const missingInformation = [];

    if (!description.trim()) {
      missingInformation.push({
        id: 'MISSING-DESCRIPTION',
        message: 'The Jira issue has no description.',
        sourceReference: 'description',
      });
    } else {
      if (requirements.length === 0) {
        missingInformation.push({
          id: 'MISSING-USER-STORY',
          message: 'No User Story section was found in the description.',
          sourceReference: 'description:User Story',
        });
      }

      if (acceptanceCriteria.length === 0) {
        missingInformation.push({
          id: 'MISSING-ACCEPTANCE-CRITERIA',
          message: 'No acceptance criteria were found in the description.',
          sourceReference: 'description:Acceptance Criteria',
        });
      }
    }

    return {
      issueKey: issue.key,
      summary: issue.summary ?? '',
      issueType: issue.issueType ?? null,
      requirements,
      acceptanceCriteria,
      ambiguities: [],
      missingInformation,
      recommendations: [],
      metadata: {
        schemaVersion: '1.0',
        analyzerType: 'mock',
        analyzedAt: this.clock().toISOString(),
      },
    };
  }
}
