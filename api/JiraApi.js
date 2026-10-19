import { URL } from 'node:url';

function extractAdfText(node) {
  if (!node) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(extractAdfText).join('');
  }

  if (node.type === 'text') {
    return node.text ?? '';
  }

  if (node.type === 'hardBreak') {
    return '\n';
  }

  const content = extractAdfText(node.content);

  switch (node.type) {
    case 'paragraph':
    case 'heading':
    case 'blockquote':
      return `${content}\n`;

    case 'listItem':
      return `- ${content}`;

    case 'bulletList':
    case 'orderedList':
      return `${content}\n`;

    default:
      return content;
  }
}

export class JiraApi {
  constructor({
    baseUrl = process.env.JIRA_BASE_URL,
    email = process.env.JIRA_EMAIL,
    apiToken = process.env.JIRA_API_TOKEN,
    fetchImpl = fetch,
  } = {}) {
    if (!baseUrl || !email || !apiToken) {
      throw new Error(
        'Jira configuration is incomplete. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN.',
      );
    }

    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.email = email;
    this.apiToken = apiToken;
    this.fetchImpl = fetchImpl;
  }

  async getIssue(issueKey) {
    if (!issueKey || !/^[A-Za-z][A-Za-z0-9_]*-\d+$/.test(issueKey)) {
      throw new Error(`Invalid Jira issue key: ${issueKey || '(empty)'}`);
    }

    const credentials = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');

    const url = new URL(`${this.baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}`);

    url.searchParams.set('fields', 'summary,description,issuetype');

    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve Jira issue ${issueKey}: HTTP ${response.status}`);
    }

    const issue = await response.json();
    const issueFields = issue.fields || {};

    const descriptionRaw = issueFields.description ?? null;

    return {
      key: issue.key,
      summary: issueFields.summary ?? '',
      description: descriptionRaw ? extractAdfText(descriptionRaw).trim() : null,
      descriptionRaw,
      issueType: issueFields.issuetype?.name ?? null,
    };
  }
}
