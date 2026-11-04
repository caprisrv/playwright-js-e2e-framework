import { test, expect } from '@playwright/test';
import { RequirementAnalyzer } from '../../utils/requirementAnalyzer.js';

test.describe('RequirementAnalyzer', () => {
  test('extracts the user story and numbered acceptance criteria', async () => {
    const analyzer = new RequirementAnalyzer({
      clock: () => new Date('2026-10-21T12:00:00.000Z'),
    });

    const result = await analyzer.analyze({
      key: 'SCRUM-7',
      summary: 'Analyze Jira stories using AI',
      issueType: 'Story',
      description: [
        'User Story',
        'As a tester,',
        'I want to analyze requirements,',
        'so that test cases can be proposed.',
        'Background',
        'Additional context.',
        'Acceptance Criteria',
        'AC1: Preserve source text',
        'The original criterion wording is retained.',
        'AC2: Do not invent requirements',
        'Uncertain information is flagged.',
        'Out of Scope',
        'Creating test cases.',
      ].join('\n'),
    });

    expect(result.issueKey).toBe('SCRUM-7');
    expect(result.summary).toBe('Analyze Jira stories using AI');
    expect(result.issueType).toBe('Story');

    expect(result.requirements).toEqual([
      {
        id: 'REQ-1',
        description:
          'As a tester, I want to analyze requirements, so that test cases can be proposed.',
        sourceReference: 'description:User Story',
      },
    ]);

    expect(result.acceptanceCriteria).toHaveLength(2);
    expect(result.acceptanceCriteria[0]).toEqual({
      id: 'AC1',
      title: 'Preserve source text',
      description: 'The original criterion wording is retained.',
      sourceReference: 'description:AC1',
      testability: 'not_assessed',
    });

    expect(result.acceptanceCriteria[1].id).toBe('AC2');
    expect(result.acceptanceCriteria[1].description).toBe('Uncertain information is flagged.');

    expect(result.metadata).toEqual({
      schemaVersion: '1.0',
      analyzerType: 'mock',
      analyzedAt: '2026-10-21T12:00:00.000Z',
    });
  });

  test('assigns stable IDs to explicitly listed unnumbered criteria', async () => {
    const analyzer = new RequirementAnalyzer();

    const issue = {
      key: 'SCRUM-7',
      summary: 'Example story',
      issueType: 'Story',
      description: [
        'Acceptance Criteria',
        '- Preserve the original requirement.',
        '- Report missing information.',
      ].join('\n'),
    };

    const first = await analyzer.analyze(issue);
    const second = await analyzer.analyze(issue);

    expect(first.acceptanceCriteria.map((criterion) => criterion.id)).toEqual([
      'AC-UNNUMBERED-1',
      'AC-UNNUMBERED-2',
    ]);

    expect(second.acceptanceCriteria.map((criterion) => criterion.id)).toEqual(
      first.acceptanceCriteria.map((criterion) => criterion.id),
    );
  });

  test('does not invent criteria when the acceptance criteria section is absent', async () => {
    const analyzer = new RequirementAnalyzer();

    const result = await analyzer.analyze({
      key: 'SCRUM-7',
      summary: 'Story without acceptance criteria',
      issueType: 'Story',
      description: 'User Story\nAs a tester, I want clear requirements.',
    });

    expect(result.requirements).toHaveLength(1);
    expect(result.acceptanceCriteria).toEqual([]);
    expect(result.ambiguities).toEqual([]);
    expect(result.recommendations).toEqual([]);
  });

  test('handles a missing description without inventing requirements', async () => {
    const analyzer = new RequirementAnalyzer();

    const result = await analyzer.analyze({
      key: 'SCRUM-7',
      summary: 'Story with no description',
      issueType: 'Story',
      description: null,
    });

    expect(result.requirements).toEqual([]);
    expect(result.acceptanceCriteria).toEqual([]);
  });

  test('rejects an issue without a key', async () => {
    const analyzer = new RequirementAnalyzer();

    await expect(
      analyzer.analyze({
        summary: 'Missing key',
        description: 'Some description',
      }),
    ).rejects.toThrow('A Jira issue with a valid key is required for analysis.');
  });

  test('preserves all nine acceptance criteria from the SCRUM-6 story structure', async () => {
    const analyzer = new RequirementAnalyzer();

    const description = [
      'User Story',
      'As a Quality Engineer,',
      'I want the Playwright framework to retrieve Jira user stories and their acceptance criteria,',
      'so that requirements can be analyzed and converted into test cases for human approval.',
      'Acceptance Criteria',
      'AC1: Secure Authentication',
      'The framework authenticates with Jira Cloud using credentials supplied through environment variables.',
      'AC2: Retrieve an Issue',
      'The framework retrieves a Jira issue using its issue key.',
      'AC3: Extract Requirement Details',
      'The retrieved issue includes its key, summary, description, issue type, and available acceptance criteria.',
      'AC4: Handle Missing Credentials',
      'If required credentials are missing, the framework reports a clear error without exposing secrets.',
      'AC5: Handle Invalid Issues',
      'If an issue does not exist or cannot be accessed, the framework reports a meaningful error.',
      'AC6: Read-Only Behavior',
      'The integration does not create, modify, or delete Jira issues.',
      'AC7: Secure Configuration',
      'Credentials are excluded from source control and are never printed in logs.',
      'AC8: Automated Validation',
      'Tests verify successful retrieval, missing credentials, and issue retrieval failures.',
      'AC9: Preserve Existing Framework Behavior',
      'The integration does not disrupt existing Playwright discovery, sharding, retry, or reporting functionality.',
      'Out of Scope',
      'Creating test cases automatically.',
    ].join('\n');

    const result = await analyzer.analyze({
      key: 'SCRUM-6',
      summary: 'Integrate Jira Cloud with the Playwright framework',
      issueType: 'Story',
      description,
    });

    expect(result.acceptanceCriteria).toHaveLength(9);

    expect(result.acceptanceCriteria.map((criterion) => criterion.id)).toEqual([
      'AC1',
      'AC2',
      'AC3',
      'AC4',
      'AC5',
      'AC6',
      'AC7',
      'AC8',
      'AC9',
    ]);

    expect(result.acceptanceCriteria[0]).toMatchObject({
      id: 'AC1',
      title: 'Secure Authentication',
      description:
        'The framework authenticates with Jira Cloud using credentials supplied through environment variables.',
      sourceReference: 'description:AC1',
    });

    expect(result.acceptanceCriteria[8]).toMatchObject({
      id: 'AC9',
      title: 'Preserve Existing Framework Behavior',
      sourceReference: 'description:AC9',
    });
  });

  test('stops extracting acceptance criteria at the Out of Scope section', async () => {
    const analyzer = new RequirementAnalyzer();

    const result = await analyzer.analyze({
      key: 'SCRUM-6',
      summary: 'Example story',
      issueType: 'Story',
      description: [
        'Acceptance Criteria',
        'AC1: Read-only behavior',
        'The integration must not modify Jira issues.',
        'Out of Scope',
        'AC10: Create Jira issues automatically',
        'This must not be treated as an acceptance criterion.',
      ].join('\n'),
    });

    expect(result.acceptanceCriteria).toHaveLength(1);
    expect(result.acceptanceCriteria[0].id).toBe('AC1');
  });

  test('flags a missing description without adding redundant findings', async () => {
    const analyzer = new RequirementAnalyzer();

    const result = await analyzer.analyze({
      key: 'SCRUM-7',
      summary: 'Story without a description',
      issueType: 'Story',
      description: null,
    });

    expect(result.missingInformation).toEqual([
      {
        id: 'MISSING-DESCRIPTION',
        message: 'The Jira issue has no description.',
        sourceReference: 'description',
      },
    ]);
  });

  test('flags missing user story and acceptance criteria sections', async () => {
    const analyzer = new RequirementAnalyzer();

    const result = await analyzer.analyze({
      key: 'SCRUM-7',
      summary: 'Story with unstructured description',
      issueType: 'Story',
      description: 'This description has general context only.',
    });

    expect(result.missingInformation).toEqual([
      {
        id: 'MISSING-USER-STORY',
        message: 'No User Story section was found in the description.',
        sourceReference: 'description:User Story',
      },
      {
        id: 'MISSING-ACCEPTANCE-CRITERIA',
        message: 'No acceptance criteria were found in the description.',
        sourceReference: 'description:Acceptance Criteria',
      },
    ]);
  });

  test('does not flag missing information when both sections are present', async () => {
    const analyzer = new RequirementAnalyzer();

    const result = await analyzer.analyze({
      key: 'SCRUM-7',
      summary: 'Complete story',
      issueType: 'Story',
      description: [
        'User Story',
        'As a tester, I want clear requirements.',
        'Acceptance Criteria',
        'AC1: Preserve source text',
        'The criterion wording is retained.',
      ].join('\n'),
    });

    expect(result.missingInformation).toEqual([]);
  });
});
