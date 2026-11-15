import { describe, expect, it } from 'vitest';
import { contentId, defineLesson, isSlug, splitContentId } from './helpers';

describe('model helpers', () => {
  it('validates kebab-case slugs', () => {
    expect(isSlug('tcp-handshake')).toBe(true);
    expect(isSlug('osi7')).toBe(true);
    expect(isSlug('Bad Slug')).toBe(false);
    expect(isSlug('-leading')).toBe(false);
    expect(isSlug('double--dash')).toBe(false);
  });

  it('builds and splits content ids', () => {
    expect(contentId('networking', 'dns')).toBe('networking/dns');
    expect(splitContentId('networking/dns')).toEqual({ domainId: 'networking', slug: 'dns' });
    expect(splitContentId('nodomain')).toBeNull();
    expect(splitContentId('trailing/')).toBeNull();
  });

  it('defineLesson derives the id', () => {
    const l = defineLesson({
      slug: 'intro',
      domainId: 'programming',
      title: 'Intro',
      summary: 's',
      estimatedMinutes: 5,
      prerequisites: [],
      outcomes: [],
      tags: [],
      blocks: [],
    });
    expect(l.id).toBe('programming/intro');
  });
});
