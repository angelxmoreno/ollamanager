import {
  OllamaApiError,
  createHttpError,
  createNetworkError,
  createParseError,
  createTimeoutError,
} from './errors';
import { OLLAMA_API_ENDPOINTS } from './endpoints';
import {
  mapHealthResponse,
  mapModelDetailsResponse,
  mapModelsListResponse,
  mapPullProgressChunk,
  type OllamaHealthStatus,
  type OllamaModelDetails,
  type OllamaModelSummary,
  type OllamaPullProgress,
} from './mappers';

export interface OllamaClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

interface TimeoutContext {
  signal: AbortSignal;
  reset: () => void;
  clear: () => void;
}

export class OllamaClient {
  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  constructor(options: OllamaClientOptions = {}) {
    this.baseUrl = stripTrailingSlash(options.baseUrl ?? '');
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async listModels(): Promise<OllamaModelSummary[]> {
    const payload = await this.requestJson(OLLAMA_API_ENDPOINTS.tags);
    return mapModelsListResponse(payload);
  }

  async pullModel(modelName: string, onProgress?: (progress: OllamaPullProgress) => void): Promise<OllamaPullProgress[]> {
    const timeout = this.createTimeoutContext();

    try {
      const response = await this.fetchWithHandling(OLLAMA_API_ENDPOINTS.pull, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName, stream: true }),
      }, timeout.signal);

      const events: OllamaPullProgress[] = [];
      const reader = response.body?.getReader();

      if (!reader) {
        return events;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        timeout.reset();
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          let parsed: unknown;
          try {
            parsed = JSON.parse(trimmed);
          } catch (error) {
            throw new OllamaApiError(createParseError(error, trimmed, 'Failed to parse pull progress line'));
          }

          const progress = mapPullProgressChunk(parsed);
          events.push(progress);
          onProgress?.(progress);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer.trim());
          const progress = mapPullProgressChunk(parsed);
          events.push(progress);
          onProgress?.(progress);
        } catch (error) {
          throw new OllamaApiError(createParseError(error, buffer.trim(), 'Failed to parse trailing pull progress line'));
        }
      }

      return events;
    } catch (error) {
      this.rethrowAsApiError(error);
    } finally {
      timeout.clear();
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    await this.request(OLLAMA_API_ENDPOINTS.delete, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: modelName }),
    });
  }

  async getModelDetails(modelName: string): Promise<OllamaModelDetails> {
    const payload = await this.requestJson(OLLAMA_API_ENDPOINTS.show, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: modelName }),
    });

    return mapModelDetailsResponse(modelName, payload);
  }

  async checkHealth(): Promise<OllamaHealthStatus> {
    const payload = await this.requestJson(OLLAMA_API_ENDPOINTS.version);
    return mapHealthResponse(payload);
  }

  private buildUrl(path: string): string {
    if (!this.baseUrl) {
      return path;
    }

    return `${this.baseUrl}${path}`;
  }

  private async requestJson(path: string, init?: RequestInit): Promise<unknown> {
    const response = await this.request(path, init);
    const responseText = await response.text();

    if (!responseText.trim()) {
      return {};
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new OllamaApiError(createParseError(error, responseText));
    }
  }

  private async request(path: string, init?: RequestInit): Promise<Response> {
    const timeout = this.createTimeoutContext();

    try {
      const response = await this.fetchWithHandling(path, init, timeout.signal);

      if (!response.ok) {
        const responseText = await response.text().catch(() => undefined);
        throw new OllamaApiError(createHttpError(response.status, response.statusText, responseText));
      }

      return response;
    } catch (error) {
      this.rethrowAsApiError(error);
    } finally {
      timeout.clear();
    }
  }

  private createTimeoutContext(): TimeoutContext {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const reset = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    };

    const clear = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    reset();

    return {
      signal: controller.signal,
      reset,
      clear,
    };
  }

  private async fetchWithHandling(path: string, init: RequestInit | undefined, signal: AbortSignal): Promise<Response> {
    return fetch(this.buildUrl(path), {
      ...init,
      signal,
    });
  }

  private rethrowAsApiError(error: unknown): never {
    if (error instanceof OllamaApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new OllamaApiError(createTimeoutError(this.timeoutMs));
    }

    throw new OllamaApiError(createNetworkError(error));
  }
}

export const ollamaClient = new OllamaClient();
