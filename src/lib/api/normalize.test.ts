import { describe, expect, it } from 'vitest';

import { createHttpError, OllamaApiError } from './errors';
import { normalizeApiError } from './normalize';

describe('normalizeApiError', () => {
  it('maps http errors', () => {
    const normalized = normalizeApiError(new OllamaApiError(createHttpError(500, 'Server Error', 'boom')));
    expect(normalized.kind).toBe('http');
    expect(normalized.title).toContain('500');
  });

  it('maps unknown errors', () => {
    const normalized = normalizeApiError(new Error('nope'));
    expect(normalized.kind).toBe('unknown');
    expect(normalized.message).toBe('nope');
  });
});
