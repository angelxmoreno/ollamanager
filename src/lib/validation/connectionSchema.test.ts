import { describe, expect, it } from 'vitest';

import { validateConnection } from './connectionSchema';

describe('validateConnection', () => {
  it('accepts a valid connection', () => {
    const result = validateConnection({ name: 'Local', host: 'localhost', port: 11434, protocol: 'http', notes: '' });
    expect(result.success).toBe(true);
  });

  it('returns issues for invalid fields', () => {
    const result = validateConnection({ name: 'a', host: 'bad host', port: 70000, protocol: 'http', notes: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.map((item) => item.field)).toEqual(expect.arrayContaining(['name', 'host', 'port']));
    }
  });
});
