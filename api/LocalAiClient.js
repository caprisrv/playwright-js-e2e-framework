
export class LocalAiClient {
  constructor({
    baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model = process.env.OLLAMA_MODEL || 'qwen2.5:7b',
    fetchImpl = fetch,
    timeoutMs = 120000,
  } = {}) {
    if (!baseUrl || !model) {
      throw new Error('Ollama base URL and model are required.');
    }

    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async generateJson(prompt, schema) {
    if (typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('A non-empty prompt is required.');
    }

    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      throw new Error('A JSON schema object is required.');
    }

    const response = await this.fetchImpl(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        format: schema,
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: HTTP ${response.status}`);
    }

    const payload = await response.json();

    if (typeof payload.response !== 'string' || !payload.response.trim()) {
      throw new Error('Ollama returned an empty response.');
    }

    let result;

    try {
      result = JSON.parse(payload.response);
    } catch {
      throw new Error('Ollama returned invalid JSON.');
    }

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('Ollama response must be a JSON object.');
    }

    return result;
  }
}