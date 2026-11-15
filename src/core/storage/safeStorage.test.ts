import { afterEach, describe, expect, it, vi } from 'vitest';
import { isStorageAvailable, readJson, removeKey, writeJson } from './safeStorage';

const isNumber = (v: unknown): v is number => typeof v === 'number';

describe('safeStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips a JSON value under the openlab: prefix', () => {
    expect(writeJson('n', 42)).toBe(true);
    expect(window.localStorage.getItem('openlab:n')).toBe('42');
    expect(readJson('n', isNumber)).toBe(42);
  });

  it('returns null for missing keys', () => {
    expect(readJson('missing', isNumber)).toBeNull();
  });

  it('returns null when the stored value fails the guard', () => {
    window.localStorage.setItem('openlab:bad', '"a string"');
    expect(readJson('bad', isNumber)).toBeNull();
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    window.localStorage.setItem('openlab:corrupt', '{not json');
    expect(readJson('corrupt', isNumber)).toBeNull();
  });

  it('removes keys', () => {
    writeJson('gone', 1);
    removeKey('gone');
    expect(readJson('gone', isNumber)).toBeNull();
  });

  it('degrades gracefully when storage throws (quota / private mode)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(isStorageAvailable()).toBe(false);
    expect(writeJson('x', 1)).toBe(false);
    expect(readJson('x', isNumber)).toBeNull();
  });
});
