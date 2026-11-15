import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins truthy class names', () => {
    expect(cx('a', undefined, 'b', false, null, '')).toBe('a b');
  });
  it('returns an empty string for nothing', () => {
    expect(cx()).toBe('');
  });
});
