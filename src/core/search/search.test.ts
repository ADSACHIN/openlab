import { describe, expect, it } from 'vitest';
import { defineLab, defineLesson, defineModule, defineSimulator } from '@core/model/helpers';
import { createRegistry } from '@core/registry/registry';
import { buildSearchIndex, search, tokenize } from './search';

const sim = defineSimulator<number>({
  domainId: 'networking',
  slug: 'sim',
  title: 'Sim',
  description: '',
  engine: { init: () => 0, step: (s) => s + 1, describe: () => '' },
  View: () => null,
});

const registry = createRegistry([
  defineModule({
    id: 'networking',
    simulators: [sim],
    lessons: [
      defineLesson({
        slug: 'tcp-handshake',
        domainId: 'networking',
        title: 'TCP three-way handshake',
        summary: 'How SYN, SYN-ACK and ACK establish a connection.',
        estimatedMinutes: 8,
        prerequisites: [],
        outcomes: ['explain the handshake'],
        tags: ['tcp', 'transport'],
        blocks: [],
      }),
      defineLesson({
        slug: 'dns',
        domainId: 'networking',
        title: 'DNS resolution',
        summary: 'Recursive and iterative lookups.',
        estimatedMinutes: 6,
        prerequisites: [],
        outcomes: ['trace a lookup'],
        tags: ['dns'],
        blocks: [],
      }),
    ],
    labs: [
      defineLab({
        slug: 'subnet-lab',
        domainId: 'networking',
        title: 'Subnet a network',
        summary: 'Split an address block.',
        estimatedMinutes: 10,
        prerequisites: [],
        simulatorId: 'networking/sim',
        goal: 'Fit all hosts',
        instructions: [],
        check: () => ({ passed: true, message: '' }),
      }),
    ],
  }),
]);

describe('search', () => {
  it('tokenizes', () => {
    expect(tokenize('TCP/IP, three-way C# c++!')).toEqual([
      'tcp',
      'ip',
      'three',
      'way',
      'c#',
      'c++',
    ]);
  });

  it('ranks title matches above summary matches and supports prefixes', () => {
    const index = buildSearchIndex(registry);
    const hits = search(index, 'hand');
    expect(hits.map((h) => h.id)).toEqual(['networking/tcp-handshake']);
    expect(search(index, 'tcp')[0]?.path).toBe('/domains/networking/lessons/tcp-handshake');
    expect(search(index, 'subnet')[0]?.kind).toBe('lab');
  });

  it('requires every token to match and returns nothing for empty queries', () => {
    const index = buildSearchIndex(registry);
    expect(search(index, 'dns handshake')).toEqual([]);
    expect(search(index, 'dns lookups').map((h) => h.id)).toEqual(['networking/dns']);
    expect(search(index, '  ')).toEqual([]);
  });
});
