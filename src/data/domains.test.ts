import { describe, expect, it } from 'vitest';
import { DOMAINS, findDomain } from './domains';

describe('domain catalogue', () => {
  it('lists exactly the eight planned domains with unique ids', () => {
    expect(DOMAINS).toHaveLength(8);
    expect(new Set(DOMAINS.map((d) => d.id)).size).toBe(8);
  });

  it('gives every domain copy and at least three topics', () => {
    for (const d of DOMAINS) {
      expect(d.title.length).toBeGreaterThan(0);
      expect(d.tagline.length).toBeGreaterThan(0);
      expect(d.description.length).toBeGreaterThan(40);
      expect(d.topics.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('finds by id and returns undefined otherwise', () => {
    expect(findDomain('networking')?.title).toBe('Networking');
    expect(findDomain('nope')).toBeUndefined();
  });
});
