import { createParseError } from './errors';

export interface OllamaModelSummary {
  name: string;
  modifiedAt?: string;
  size?: number;
  digest?: string;
  details?: Record<string, unknown>;
}

export interface OllamaModelDetails {
  name: string;
  modelfile?: string;
  parameters?: string;
  template?: string;
  license?: string;
  details?: Record<string, unknown>;
  modelInfo?: Record<string, unknown>;
  rawPayload?: unknown;
}

export interface OllamaHealthStatus {
  ok: boolean;
  version?: string;
}

export interface OllamaPullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
  error?: string;
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return undefined;
};

export const mapModelsListResponse = (raw: unknown): OllamaModelSummary[] => {
  const root = asRecord(raw);
  const models = root?.models;

  if (!Array.isArray(models)) {
    throw createParseError(undefined, JSON.stringify(raw), 'Expected a models array in tags response');
  }

  return models
    .map((entry): OllamaModelSummary | null => {
      const model = asRecord(entry);

      if (!model) {
        return null;
      }

      const name = asString(model.name) ?? asString(model.model);
      if (!name) {
        return null;
      }

      return {
        name,
        modifiedAt: asString(model.modified_at) ?? asString(model.modifiedAt),
        size: asNumber(model.size),
        digest: asString(model.digest),
        details: asRecord(model.details) ?? undefined,
      };
    })
    .filter((entry): entry is OllamaModelSummary => entry !== null);
};

export const mapModelDetailsResponse = (modelName: string, raw: unknown): OllamaModelDetails => {
  const root = asRecord(raw);

  if (!root) {
    throw createParseError(undefined, JSON.stringify(raw), 'Expected object payload in show response');
  }

  return {
    name: asString(root.name) ?? asString(root.model) ?? modelName,
    modelfile: asString(root.modelfile),
    parameters: asString(root.parameters),
    template: asString(root.template),
    license: asString(root.license),
    details: asRecord(root.details) ?? undefined,
    modelInfo: asRecord(root.model_info) ?? asRecord(root.modelInfo) ?? undefined,
    rawPayload: raw,
  };
};

export const mapHealthResponse = (raw: unknown): OllamaHealthStatus => {
  if (typeof raw === 'string') {
    const version = raw.trim();
    return version ? { ok: true, version } : { ok: false };
  }

  const root = asRecord(raw);
  const version = asString(root?.version) ?? asString(root?.ollama_version);
  const normalizedVersion = version?.trim();

  return {
    ok: Boolean(normalizedVersion),
    version: normalizedVersion,
  };
};

export const mapPullProgressChunk = (raw: unknown): OllamaPullProgress => {
  const root = asRecord(raw);

  if (!root) {
    throw createParseError(undefined, JSON.stringify(raw), 'Expected object payload in pull progress chunk');
  }

  const status = asString(root.status) ?? 'unknown';

  return {
    status,
    digest: asString(root.digest),
    total: asNumber(root.total),
    completed: asNumber(root.completed),
    error: asString(root.error),
  };
};
