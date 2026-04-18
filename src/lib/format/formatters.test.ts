import { describe, expect, it } from 'vitest';

import { formatBytes, formatDateTime } from './formatters';

describe('formatters', () => {
  it('formats bytes', () => {
    expect(formatBytes(1024)).toContain('KB');
    expect(formatBytes(undefined)).toBe('—');
  });

  it('formats dates', () => {
    expect(formatDateTime('2024-01-01T00:00:00.000Z')).toBeTruthy();
    expect(formatDateTime('bad')).toBe('—');
  });
});
