import { test, expect } from '@playwright/test';
import { LocalAiClient } from '../../api/LocalAiClient.js';

const schema = {
  type: 'object',
  properties: {
    criterionId: { type: 'string' },
    ambiguities: { type: 'array', items: { type: 'string' } },
  },
  required: ['criterionId', 'ambiguities'],
};

test.describe('LocalAiClient', () => {
  test('sends a JSON generation request and parses the response', async () => {
    let capturedUrl;
    let capturedOptions;

    const client = new LocalAiClient({
      baseUrl: 'http://localhost:11434/',
      model: 'qwen2.5:7b',
      fetchImpl: async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;

        return {
          ok: true,
          json: async () => ({
            response: JSON.stringify({
              criterionId: 'AC1',
              ambiguities: [],
            }),
          }),
        };
      },
    });

    const result = await client.generateJson('Analyze AC1', schema);

    expect(capturedUrl).toBe('http://localhost:11434/api/generate');
    expect(capturedOptions.method).toBe('POST');
    expect(capturedOptions.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(capturedOptions.body);
    expect(body.model).toBe('qwen2.5:7b');
    expect(body.prompt).toBe('Analyze AC1');
    expect(body.stream).toBe(false);
    expect(body.format).toEqual(schema);

    expect(result).toEqual({
      criterionId: 'AC1',
      ambiguities: [],
    });
  });

  test('rejects an empty prompt', async () => {
    const client = new LocalAiClient({
      fetchImpl: async () => {
        throw new Error('Fetch should not be called');
      },
    });

    await expect(client.generateJson('  ', schema)).rejects.toThrow(
      'A non-empty prompt is required.',
    );
  });

  test('rejects a missing or invalid schema', async () => {
    const client = new LocalAiClient();

    await expect(client.generateJson('Analyze AC1', null)).rejects.toThrow(
      'A JSON schema object is required.',
    );

    await expect(client.generateJson('Analyze AC1', [])).rejects.toThrow(
      'A JSON schema object is required.',
    );
  });

  test('reports HTTP errors without exposing response details', async () => {
    const client = new LocalAiClient({
      fetchImpl: async () => ({
        ok: false,
        status: 500,
      }),
    });

    await expect(client.generateJson('Analyze AC1', schema)).rejects.toThrow(
      'Ollama request failed: HTTP 500',
    );
  });

  test('rejects malformed JSON returned by the model', async () => {
    const client = new LocalAiClient({
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({
          response: '{not valid JSON}',
        }),
      }),
    });

    await expect(client.generateJson('Analyze AC1', schema)).rejects.toThrow(
      'Ollama returned invalid JSON.',
    );
  });

  test('rejects an empty model response', async () => {
    const client = new LocalAiClient({
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({
          response: '  ',
        }),
      }),
    });

    await expect(client.generateJson('Analyze AC1', schema)).rejects.toThrow(
      'Ollama returned an empty response.',
    );
  });

  test('propagates network errors when Ollama is unavailable', async () => {
    const client = new LocalAiClient({
      fetchImpl: async () => {
        throw new Error('Connection refused');
      },
    });

    await expect(client.generateJson('Analyze AC1', schema)).rejects.toThrow('Connection refused');
  });

  test('uses an abort signal configured with the requested timeout', async () => {
    let capturedSignal;

    const client = new LocalAiClient({
      timeoutMs: 5000,
      fetchImpl: async (_url, options) => {
        capturedSignal = options.signal;

        return {
          ok: true,
          json: async () => ({
            response: JSON.stringify({
              criterionId: 'AC1',
              ambiguities: [],
            }),
          }),
        };
      },
    });

    await client.generateJson('Analyze AC1', schema);

    expect(capturedSignal).toBeDefined();
    expect(capturedSignal.aborted).toBe(false);
  });
});
