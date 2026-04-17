export const OLLAMA_API_ENDPOINTS = {
  tags: '/api/tags',
  pull: '/api/pull',
  delete: '/api/delete',
  show: '/api/show',
  version: '/api/version',
} as const;

export type OllamaApiEndpoint = (typeof OLLAMA_API_ENDPOINTS)[keyof typeof OLLAMA_API_ENDPOINTS];
