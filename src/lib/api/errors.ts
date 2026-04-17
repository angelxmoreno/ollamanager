export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse';

interface ApiErrorBase {
  kind: ApiErrorKind;
  message: string;
  cause?: unknown;
}

export interface NetworkApiError extends ApiErrorBase {
  kind: 'network';
}

export interface TimeoutApiError extends ApiErrorBase {
  kind: 'timeout';
  timeoutMs: number;
}

export interface HttpApiError extends ApiErrorBase {
  kind: 'http';
  status: number;
  statusText: string;
  responseText?: string;
}

export interface ParseApiError extends ApiErrorBase {
  kind: 'parse';
  responseText?: string;
}

export type ApiError = NetworkApiError | TimeoutApiError | HttpApiError | ParseApiError;

export class OllamaApiError extends Error {
  readonly details: ApiError;

  constructor(details: ApiError) {
    super(details.message);
    this.name = 'OllamaApiError';
    this.details = details;
  }
}

export const createNetworkError = (cause: unknown, message = 'Unable to reach Ollama API'): NetworkApiError => ({
  kind: 'network',
  message,
  cause,
});

export const createTimeoutError = (timeoutMs: number, message = `Request timed out after ${timeoutMs}ms`): TimeoutApiError => ({
  kind: 'timeout',
  message,
  timeoutMs,
});

export const createHttpError = (
  status: number,
  statusText: string,
  responseText?: string,
  message = `HTTP ${status} ${statusText}`,
): HttpApiError => ({
  kind: 'http',
  message,
  status,
  statusText,
  responseText,
});

export const createParseError = (cause: unknown, responseText?: string, message = 'Failed to parse Ollama API response'): ParseApiError => ({
  kind: 'parse',
  message,
  cause,
  responseText,
});
