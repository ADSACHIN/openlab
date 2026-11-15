import { describe, expect, it } from 'vitest';
import { createRegistry } from '@core/registry';
import { buildSearchIndex, search } from '@core/search';
import { networkingModule } from './index';
import { subnetPlannerEngine } from './simulators/subnet-planner/engine';
import { applyTcp, tcpHandshakeEngine } from './simulators/tcp-handshake/engine';

describe('networking module', () => {
  const registry = createRegistry([networkingModule]);

  it('registers cleanly with lessons in prerequisite order', () => {
    expect(registry.lessonsFor('networking').map((l) => l.slug)).toEqual([
      'osi-model',
      'packet-journey',
      'ip-addressing',
      'dns-resolution',
      'tcp-handshake',
      'tls-handshake',
    ]);
    expect(registry.labsFor('networking')).toHaveLength(2);
    expect(registry.routes()).toHaveLength(1 + 6 + 2);
    expect(registry.hasContent('networking')).toBe(true);
  });

  it('every lesson has outcomes, tags and at least one interactive block', () => {
    for (const l of registry.lessonsFor('networking')) {
      expect(l.outcomes.length).toBeGreaterThan(0);
      expect(l.tags.length).toBeGreaterThan(0);
      expect(l.blocks.some((b) => b.type === 'interactive')).toBe(true);
    }
  });

  it('is searchable', () => {
    const index = buildSearchIndex(registry);
    expect(search(index, 'handshake').map((h) => h.id)).toContain('networking/tcp-handshake');
    expect(search(index, 'subnet')[0]?.kind).toBeDefined();
  });

  it('grades the subnet lab', () => {
    const lab = registry.getLab('networking/size-a-subnet');
    const base = subnetPlannerEngine.init(1);
    expect(lab?.check({ ...base, prefix: 27 })).toMatchObject({ passed: false, score: 20 });
    expect(lab?.check({ ...base, prefix: 24 })).toMatchObject({ passed: false, score: 60 });
    expect(lab?.check({ ...base, prefix: 26 })).toMatchObject({ passed: true, score: 100 });
  });

  it('grades the handshake lab', () => {
    const lab = registry.getLab('networking/complete-the-handshake');
    let s = tcpHandshakeEngine.init(3);
    expect(lab?.check(s)).toMatchObject({ passed: false, score: 0 });
    s = applyTcp(s, 'send-ack'); // mistake
    s = applyTcp(s, 'send-syn');
    s = applyTcp(s, 'send-syn-ack');
    s = applyTcp(s, 'send-ack');
    expect(lab?.check(s)).toMatchObject({ passed: false, score: 70 });
    s = applyTcp(s, 'send-data');
    expect(lab?.check(s)).toMatchObject({ passed: true, score: 85 });
  });
});
