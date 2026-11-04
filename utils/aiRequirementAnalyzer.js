import { LocalAiClient } from '../api/LocalAiClient.js';

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    criterionId: { type: 'string' },
    summary: { type: 'string' },
    testability: {
      type: 'string',
      enum: ['testable', 'partially_testable', 'not_testable', 'uncertain'],
    },
    testScenarios: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['positive', 'negative', 'boundary'] },
          expectedResult: { type: 'string' },
        },
        required: ['name', 'type', 'expectedResult'],
      },
    },
    ambiguities: { type: 'array', items: { type: 'string' } },
    missingInformation: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'criterionId',
    'summary',
    'testability',
    'testScenarios',
    'ambiguities',
    'missingInformation',
  ],
};

const VALID_TESTABILITY = ['testable', 'partially_testable', 'not_testable', 'uncertain'];

const VALID_SCENARIO_TYPES = ['positive', 'negative', 'boundary'];

function validateNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`AI response validation failed: ${fieldName} must be a non-empty string.`);
  }
}

function validateStringArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`AI response validation failed: ${fieldName} must be an array.`);
  }

  value.forEach((item, index) => {
    if (typeof item !== 'string') {
      throw new Error(`AI response validation failed: ${fieldName}[${index}] must be a string.`);
    }
  });
}

function validateAiAnalysisResult(result) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('AI response validation failed: response must be an object.');
  }

  validateNonEmptyString(result.criterionId, 'criterionId');
  validateNonEmptyString(result.summary, 'summary');

  if (!VALID_TESTABILITY.includes(result.testability)) {
    throw new Error(
      `AI response validation failed: invalid testability value "${result.testability}".`,
    );
  }

  if (!Array.isArray(result.testScenarios)) {
    throw new Error('AI response validation failed: testScenarios must be an array.');
  }

  result.testScenarios.forEach((scenario, index) => {
    if (!scenario || typeof scenario !== 'object' || Array.isArray(scenario)) {
      throw new Error(`AI response validation failed: testScenarios[${index}] must be an object.`);
    }

    validateNonEmptyString(scenario.name, `testScenarios[${index}].name`);
    validateNonEmptyString(scenario.expectedResult, `testScenarios[${index}].expectedResult`);

    if (!VALID_SCENARIO_TYPES.includes(scenario.type)) {
      throw new Error(
        `AI response validation failed: invalid test scenario type at index ${index}.`,
      );
    }
  });

  validateStringArray(result.ambiguities, 'ambiguities');
  validateStringArray(result.missingInformation, 'missingInformation');
}

export class AiRequirementAnalyzer {
  constructor({ aiClient = new LocalAiClient() } = {}) {
    this.aiClient = aiClient;
  }

  async analyze(requirementAnalysis) {
    if (
      !requirementAnalysis ||
      typeof requirementAnalysis !== 'object' ||
      !Array.isArray(requirementAnalysis.acceptanceCriteria)
    ) {
      throw new Error('A deterministic requirement analysis with acceptance criteria is required.');
    }

    const criteriaResults = [];

    for (const criterion of requirementAnalysis.acceptanceCriteria) {
      const prompt = [
        'You are a cautious software quality engineering assistant.',
        'Analyze the supplied Jira acceptance criterion.',
        'Return only the JSON object matching the supplied schema.',
        'Preserve the criterion ID exactly.',
        'Do not invent requirements or claim tests have been executed.',
        'Propose only scenarios justified by the criterion.',
        'Use ambiguities and missingInformation to identify genuine gaps.',
        'If evidence is insufficient, use uncertain for testability.',
        'Classify testability based on whether observable behavior can be verified.',
        'Use testable when at least one meaningful scenario can be verified from the criterion.',
        'Use partially_testable when some behavior is verifiable but important details are missing.',
        'Use not_testable only when no meaningful behavior can be verified from the supplied evidence.',
        'Use uncertain only when the available information is insufficient to make a reliable classification.',
        'Do not generate scenarios that belong to other acceptance criteria.',
        'Do not invent technical requirements, formats, validation rules, or implementation details.',
        'When a detail is unspecified, record it as an ambiguity or missing information instead of inventing a scenario.',
        'Keep every proposed scenario directly traceable to the supplied acceptance criterion.',
        '',
        'Jira issue:',
        JSON.stringify({
          issueKey: requirementAnalysis.issueKey,
          summary: requirementAnalysis.summary,
          issueType: requirementAnalysis.issueType,
          requirements: requirementAnalysis.requirements,
        }),
        '',
        'Acceptance criterion:',
        JSON.stringify(criterion),
      ].join('\n');

      const result = await this.aiClient.generateJson(prompt, ANALYSIS_SCHEMA);

      validateAiAnalysisResult(result);

      if (result.criterionId !== criterion.id) {
        throw new Error(`AI result criterion ID mismatch: expected ${criterion.id}.`);
      }

      criteriaResults.push({
        criterionId: criterion.id,
        sourceReference: criterion.sourceReference,
        originalTitle: criterion.title,
        originalDescription: criterion.description,
        aiAnalysis: result,
        reviewStatus: 'pending',
      });
    }

    return {
      issueKey: requirementAnalysis.issueKey,
      summary: requirementAnalysis.summary,
      deterministicAnalysis: requirementAnalysis,
      criteriaResults,
      metadata: {
        analyzerType: 'local-ai',
        model: this.aiClient.model ?? 'injected-client',
        reviewRequired: true,
      },
    };
  }
}
