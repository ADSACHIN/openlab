import { describe, expect, it } from 'vitest';
import { defineLesson, defineModule } from '@core/model/helpers';
import { createRegistry } from '@core/registry/registry';
import { learningPath, prerequisiteClosure, suggestedGoals, summarizePath } from './paths';

const lesson = (
  domainId: 'networking' | 'linux-os',
  slug: string,
  prerequisites: string[] = [],
  minutes = 5,
) =>
  defineLesson({
    slug,
    domainId,
    title: slug,
    summary: '',
    estimatedMinutes: minutes,
    prerequisites,
    outcomes: [],
    tags: [],
    blocks: [],
  });

// shell → processes ← (cross-domain) sockets → tcp; osi → tcp; unrelated: dns
const registry = createRegistry([
  defineModule({
    id: 'linux-os',
    lessons: [lesson('linux-os', 'shell'), lesson('linux-os', 'processes', ['linux-os/shell'], 9)],
    labs: [],
    simulators: [],
  }),
  defineModule({
    id: 'networking',
    lessons: [
      lesson('networking', 'tcp', ['networking/osi', 'networking/sockets']),
      lesson('networking', 'sockets', ['linux-os/processes']),
      lesson('networking', 'osi'),
      lesson('networking', 'dns'),
    ],
    labs: [],
    simulators: [],
  }),
]);

describe('learning paths', () => {
  it('collects the transitive closure across domains', () => {
    expect([...prerequisiteClosure(registry, 'networking/tcp')].sort()).toEqual([
      'linux-os/processes',
      'linux-os/shell',
      'networking/osi',
      'networking/sockets',
      'networking/tcp',
    ]);
    expect(prerequisiteClosure(registry, 'nope/x').size).toBe(0);
  });

  it('orders every lesson after its prerequisites and ends at the goal', () => {
    const path = learningPath(registry, 'networking/tcp').map((l) => l.id);
    expect(path.at(-1)).toBe('networking/tcp');
    const pos = (id: string) => path.indexOf(id);
    expect(pos('linux-os/shell')).toBeLessThan(pos('linux-os/processes'));
    expect(pos('linux-os/processes')).toBeLessThan(pos('networking/sockets'));
    expect(path).not.toContain('networking/dns');
    expect(learningPath(registry, 'networking/dns').map((l) => l.id)).toEqual(['networking/dns']);
  });

  it('summarises progress and the next step', () => {
    const path = learningPath(registry, 'networking/tcp');
    const s = summarizePath(path, new Set(['linux-os/shell']));
    expect(s).toMatchObject({ lessons: 5, domains: 2, minutes: 5 + 9 + 5 + 5 + 5, done: 1 });
    expect(s.next?.id).toBe(path.find((l) => l.id !== 'linux-os/shell')?.id);
    expect(summarizePath(path, new Set(path.map((l) => l.id))).next).toBeUndefined();
  });

  it('suggests cross-domain goals, longest first', () => {
    expect(suggestedGoals(registry).map((l) => l.id)).toEqual([
      'networking/tcp',
      'networking/sockets',
    ]);
  });
});
