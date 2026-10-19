import { test, expect } from '@playwright/test';
import { JiraApi } from '../../api/JiraApi.js';
import { URL } from 'node:url';
const mockIssue = {
  key: 'SCRUM-6',
  fields: {
    summary: 'Integrate Jira Cloud with the Playwright framework',
    description: 'Retrieve Jira issues without modifying them.',
    issuetype: {
      name: 'Story',
    },
    customfield_12345: 'The API returns the acceptance criteria.',
  },
};

test.describe('JiraApi', () => {
  test('retrieves and normalizes a Jira issue', async () => {
    console.log(
      '\nTEST 1: Retrieve and normalize a Jira issue\n' +
        'Purpose: Verify that Jira response fields are returned in a consistent structure.',
    );
    const jiraApi = new JiraApi({
      baseUrl: 'https://example.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token',
      acceptanceCriteriaField: 'customfield_12345',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => mockIssue,
      }),
    });

    const issue = await jiraApi.getIssue('SCRUM-6');
    console.log('Retrieved issue:', JSON.stringify(issue, null, 2));

    expect(issue).toEqual({
      key: 'SCRUM-6',
      summary: 'Integrate Jira Cloud with the Playwright framework',
      description: 'Retrieve Jira issues without modifying them.',
      descriptionRaw: 'Retrieve Jira issues without modifying them.',
      issueType: 'Story',
    });
  });

  test('rejects missing credentials', () => {
    console.log(
      '\nTEST 2: Reject missing credentials\n' +
        'Purpose: Verify that the client refuses to start without all required Jira settings.',
    );

    expect(
      () =>
        new JiraApi({
          baseUrl: 'https://example.atlassian.net',
          email: 'test@example.com',
          apiToken: '',
        }),
    ).toThrow(/JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN/);

    console.log('Expected configuration error was correctly thrown.');
  });

  test('rejects an invalid issue key before making a request', async () => {
    console.log(
      '\nTEST 3: Reject an invalid issue key\n' +
        'Purpose: Verify that malformed keys are rejected before making an API request.',
    );
    let requestCalled = false;

    const jiraApi = new JiraApi({
      baseUrl: 'https://example.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token',
      fetchImpl: async () => {
        requestCalled = true;
        throw new Error('Unexpected request');
      },
    });

    await expect(jiraApi.getIssue('invalid-key')).rejects.toThrow(/Invalid Jira issue key/);

    expect(requestCalled).toBe(false);
    console.log('Invalid key rejected. HTTP request made:', requestCalled);
  });

  test('reports HTTP errors without exposing credentials', async () => {
    console.log(
      '\nTEST 4: Handle Jira HTTP errors\n' +
        'Purpose: Verify that HTTP errors are reported without exposing credentials.',
    );
    const jiraApi = new JiraApi({
      baseUrl: 'https://example.atlassian.net',
      email: 'test@example.com',
      apiToken: 'secret-token',
      fetchImpl: async () => ({
        ok: false,
        status: 401,
      }),
    });

    await expect(jiraApi.getIssue('SCRUM-6')).rejects.toThrow(
      'Failed to retrieve Jira issue SCRUM-6: HTTP 401',
    );
    console.log('HTTP 401 handled correctly. Credentials are not included in the error.');
  });

  test('sends Basic Authentication and requests the configured fields', async () => {
    console.log(
      '\nTEST 5: Verify authentication and requested fields\n' +
        'Purpose: Check the HTTP method, authentication header, endpoint, and requested Jira fields.',
    );
    let capturedUrl;
    let capturedOptions;

    const jiraApi = new JiraApi({
      baseUrl: 'https://example.atlassian.net/',
      email: 'test@example.com',
      apiToken: 'test-token',
      acceptanceCriteriaField: 'customfield_12345',
      fetchImpl: async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;

        return {
          ok: true,
          status: 200,
          json: async () => mockIssue,
        };
      },
    });

    await jiraApi.getIssue('SCRUM-6');

    const expectedCredentials = Buffer.from('test@example.com:test-token').toString('base64');

    expect(capturedOptions.method).toBe('GET');
    expect(capturedOptions.headers.Authorization).toBe(`Basic ${expectedCredentials}`);

    const requestUrl = new URL(capturedUrl);

    expect(requestUrl.origin).toBe('https://example.atlassian.net');
    expect(requestUrl.pathname).toBe('/rest/api/3/issue/SCRUM-6');
    expect(requestUrl.searchParams.get('fields')).toBe('summary,description,issuetype');
    console.log('HTTP method:', capturedOptions.method);
    console.log('Request URL:', capturedUrl);
    console.log('Requested fields:', new URL(capturedUrl).searchParams.get('fields'));
    console.log('Basic Authentication header is present.');
  });

  test('handles missing description and acceptance criteria', async () => {
    console.log(
      '\nTEST 6: Handle missing optional fields\n' +
        'Purpose: Verify that missing description and issue type become null rather than causing an error.',
    );
    const jiraApi = new JiraApi({
      baseUrl: 'https://example.atlassian.net',
      email: 'test@example.com',
      apiToken: 'test-token',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          key: 'SCRUM-6',
          fields: {
            summary: 'Example story',
            issuetype: {
              name: 'Story',
            },
          },
        }),
      }),
    });

    const issue = await jiraApi.getIssue('SCRUM-6');

    expect(issue).toEqual({
      key: 'SCRUM-6',
      summary: 'Example story',
      description: null,
      descriptionRaw: null,
      issueType: 'Story',
    });
    console.log('Description:', issue.description);
    console.log('Issue type:', issue.issueType);
    console.log('Issue retrieved successfully despite missing optional fields.');
  });

  test('converts Jira ADF descriptions into readable text', async () => {
    console.log(
      '\nTEST 7: Convert Jira ADF description\n' +
        'Purpose: Verify that structured Jira content becomes readable text while preserving the original ADF.',
    );

    const descriptionRaw = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'User Story' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'As a Quality Engineer,' },
            { type: 'hardBreak' },
            {
              type: 'text',
              text: 'I want to retrieve Jira stories.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Acceptance Criteria' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'AC1: Secure Authentication' },
            { type: 'hardBreak' },
            {
              type: 'text',
              text: 'Credentials come from environment variables.',
            },
          ],
        },
      ],
    };

    const jiraApi = new JiraApi({
      baseUrl: 'https://example.atlassian.net',
      email: 'test@example.com',
      apiToken: 'mock-token',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          key: 'SCRUM-6',
          fields: {
            summary: 'Integrate Jira Cloud with the Playwright framework',
            description: descriptionRaw,
            issuetype: { name: 'Story' },
          },
        }),
      }),
    });

    const issue = await jiraApi.getIssue('SCRUM-6');

    expect(issue.description).toContain('User Story');
    expect(issue.description).toContain('As a Quality Engineer,\nI want to retrieve Jira stories.');
    expect(issue.description).toContain('Acceptance Criteria');
    expect(issue.description).toContain('AC1: Secure Authentication');
    expect(issue.description).toContain('Credentials come from environment variables.');

    expect(issue.descriptionRaw).toEqual(descriptionRaw);

    console.log('Normalized description:\n', issue.description);
    console.log('Original ADF preserved:', issue.descriptionRaw === descriptionRaw);
  });
});
