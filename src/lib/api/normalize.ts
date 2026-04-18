import { OllamaApiError, type ApiError } from './errors';

export interface NormalizedApiError {
  title: string;
  message: string;
  detail?: string;
  kind: ApiError['kind'] | 'unknown';
}

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  if (error instanceof OllamaApiError) {
    const details = error.details;

    if (details.kind === 'http') {
      return {
        kind: 'http',
        title: `Request failed (${details.status})`,
        message: details.statusText || 'Unexpected HTTP error',
        detail: details.responseText,
      };
    }

    if (details.kind === 'timeout') {
      return {
        kind: 'timeout',
        title: 'Request timed out',
        message: `No response in ${details.timeoutMs}ms`,
      };
    }

    if (details.kind === 'parse') {
      return {
        kind: 'parse',
        title: 'Response parse error',
        message: details.message,
        detail: details.responseText,
      };
    }

    return {
      kind: 'network',
      title: 'Network error',
      message: details.message,
    };
  }

  return {
    kind: 'unknown',
    title: 'Unexpected error',
    message: error instanceof Error ? error.message : 'Something went wrong',
  };
};
