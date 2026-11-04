import { test, expect } from '@playwright/test';
import { AiRequirementAnalyzer } from '../../utils/aiRequirementAnalyzer.js';

function createAnalysis() {
  return {
    issueKey: 'SCRUM-6',
    summary: 'Integrate Jira Cloud with Playwright framework',
    issueType: 'Story',
    requirements: [
      {
        id: 'REQ-1',
        title: 'User Story',
        description: 'As a Quality Engineer, I want Jira integration.',
        sourceReference: 'description:User Story',
      },
    ],
    acceptanceCriteria: [
      {
        id: 'AC1',
        title: 'Secure Authentication',
        description: 'Authenticate using environment variables.',
        sourceReference: 'description:AC1',
        testability: 'not_assessed',
      },
      {
        id: 'AC2',
        title: 'Retrieve an Issue',
        description: 'Retrieve a Jira issue using its issue key.',
        sourceReference: 'description:AC2',
        testability: 'not_assessed',
      },
    ],
    ambiguities: [],
    missingInformation: [],
    recommendations: [],
  };
}

function createAiResult(criterionId) {
  return {
    criterionId,
    summary: 'The criterion can be tested.',
    testability: 'testable',
    testScenarios: [
      {
        name: 'Verify expected behavior',
        type: 'positive',
        expectedResult: 'The expected behavior occurs.',
      },
    ],
    ambiguities: [],
    missingInformation: [],
  };
}

test('analyzes each criterion and preserves original source details', async () => {
  const prompts = [];

  const aiClient = {
    model: 'test-model',
    async generateJson(prompt) {
      prompts.push(prompt);
      const criterionId = prompts.length === 1 ? 'AC1' : 'AC2';
      return createAiResult(criterionId);
    },
  };

  const analysis = createAnalysis();
  const analyzer = new AiRequirementAnalyzer({ aiClient });

  const result = await analyzer.analyze(analysis);

  expect(prompts).toHaveLength(2);
  expect(result.issueKey).toBe('SCRUM-6');
  expect(result.criteriaResults).toHaveLength(2);

  expect(result.criteriaResults[0]).toMatchObject({
    criterionId: 'AC1',
    sourceReference: 'description:AC1',
    originalTitle: 'Secure Authentication',
    originalDescription: 'Authenticate using environment variables.',
    reviewStatus: 'pending',
  });

  expect(result.criteriaResults[1].criterionId).toBe('AC2');

  expect(result.metadata).toEqual({
    analyzerType: 'local-ai',
    model: 'test-model',
    reviewRequired: true,
  });

  expect(analysis.acceptanceCriteria).toHaveLength(2);
});

test('returns an empty result when there are no acceptance criteria', async () => {
  let callCount = 0;

  const aiClient = {
    async generateJson() {
      callCount += 1;
      return {};
    },
  };

  const analysis = createAnalysis();
  analysis.acceptanceCriteria = [];

  const analyzer = new AiRequirementAnalyzer({ aiClient });
  const result = await analyzer.analyze(analysis);

  expect(callCount).toBe(0);
  expect(result.criteriaResults).toEqual([]);
  expect(result.metadata.reviewRequired).toBe(true);
});

test('rejects an AI result with a mismatched criterion ID', async () => {
  const aiClient = {
    async generateJson() {
      return createAiResult('AC999');
    },
  };

  const analyzer = new AiRequirementAnalyzer({ aiClient });

  await expect(analyzer.analyze(createAnalysis())).rejects.toThrow(
    'AI result criterion ID mismatch: expected AC1.',
  );
});

test('rejects input without an acceptance criteria array', async () => {
  const analyzer = new AiRequirementAnalyzer({
    aiClient: {
      async generateJson() {
        return {};
      },
    },
  });

  await expect(
    analyzer.analyze({
      issueKey: 'SCRUM-6',
      summary: 'Test issue',
    }),
  ).rejects.toThrow(
    'A deterministic requirement analysis with acceptance criteria is required.',
  );
});


test('rejects an invalid testability enum value', async () => {
  const aiClient = {
    async generateJson() {
      return {
        ...createAiResult('AC1'),
        testability: 'maybe_testable',
      };
    },
  };

  const analyzer = new AiRequirementAnalyzer({ aiClient });

  await expect(analyzer.analyze(createAnalysis())).rejects.toThrow(
    'AI response validation failed: invalid testability value "maybe_testable".',
  );
});

test('rejects a response with missing required fields', async () => {
  const aiClient = {
    async generateJson() {
      return {
        criterionId: 'AC1',
        summary: 'Some analysis',
        testability: 'testable',
        testScenarios: [],
        ambiguities: [],
      };
    },
  };

  const analyzer = new AiRequirementAnalyzer({ aiClient });

  await expect(analyzer.analyze(createAnalysis())).rejects.toThrow(
    'AI response validation failed: missingInformation must be an array.',
  );
});

test('rejects an invalid test scenario type', async () => {
  const aiClient = {
    async generateJson() {
      return {
        ...createAiResult('AC1'),
        testScenarios: [
          {
            name: 'Verify authentication',
            type: 'exploratory',
            expectedResult: 'Authentication succeeds.',
          },
        ],
      };
    },
  };

  const analyzer = new AiRequirementAnalyzer({ aiClient });

  await expect(analyzer.analyze(createAnalysis())).rejects.toThrow(
    'AI response validation failed: invalid test scenario type at index 0.',
  );
});

test('rejects malformed test scenario entries', async () => {
  const aiClient = {
    async generateJson() {
      return {
        ...createAiResult('AC1'),
        testScenarios: [
          {
            name: 'Verify authentication',
            type: 'positive',
          },
        ],
      };
    },
  };

  const analyzer = new AiRequirementAnalyzer({ aiClient });

  await expect(analyzer.analyze(createAnalysis())).rejects.toThrow(
    'AI response validation failed: testScenarios[0].expectedResult must be a non-empty string.',
  );
});
