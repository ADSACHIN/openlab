import { describe, expect, it } from 'vitest';
import { bitDistance, sha256 } from './sha256';

describe('sha256', () => {
  it('matches the NIST FIPS 180-4 test vectors', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    // 56 bytes: padding spills into a second block
    expect(sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
    expect(sha256('a'.repeat(1000))).toHaveLength(64);
  });

  it('matches the widely published hash of "password" and handles UTF-8', () => {
    expect(sha256('password')).toBe(
      '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    );
    expect(sha256('é')).not.toBe(sha256('e'));
  });

  it('shows the avalanche effect', () => {
    const d = bitDistance(sha256('sunshine'), sha256('sunshinf'));
    // About half of 256 bits should flip for a one-character change.
    expect(d).toBeGreaterThan(96);
    expect(d).toBeLessThan(160);
    expect(bitDistance('ff', '00')).toBe(8);
  });
});
