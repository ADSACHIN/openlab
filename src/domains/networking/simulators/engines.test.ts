import { describe, expect, it } from 'vitest';
import { DNS_MESSAGES, dnsLookupEngine } from './dns-lookup/engine';
import { STAGE_COUNT, encapsulationEngine, wrapsAt } from './encapsulation/engine';
import { LAYERS, layerExplorerEngine } from './layer-explorer/engine';
import { subnetPlannerEngine } from './subnet-planner/engine';
import { applyTcp, tcpHandshakeEngine } from './tcp-handshake/engine';
import { TLS_MESSAGES, tlsHandshakeEngine } from './tls-handshake/engine';

function run<S>(
  engine: { init: (seed: number) => S; step: (s: S) => S; isDone?: (s: S) => boolean },
  maxSteps: number,
  seed = 1,
): S {
  let s = engine.init(seed);
  for (let i = 0; i < maxSteps; i++) s = engine.step(s);
  return s;
}

describe('networking engines', () => {
  it('layer explorer cycles and selects', () => {
    expect(LAYERS).toHaveLength(7);
    expect(run(layerExplorerEngine, 7).selected).toBe(0);
    expect(layerExplorerEngine.apply?.({ selected: 0 }, { type: 'select', index: 3 })).toEqual({
      selected: 3,
    });
    expect(layerExplorerEngine.apply?.({ selected: 0 }, { type: 'select', index: 99 })).toEqual({
      selected: 0,
    });
    expect(layerExplorerEngine.describe({ selected: 3 })).toMatch(/Layer 4, Transport/);
  });

  it('encapsulation wraps then unwraps and finishes', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].map(wrapsAt)).toEqual([0, 1, 2, 3, 3, 3, 2, 1, 0]);
    const end = run(encapsulationEngine, 50);
    expect(end.stage).toBe(STAGE_COUNT - 1);
    expect(encapsulationEngine.isDone?.(end)).toBe(true);
    expect(encapsulationEngine.describe({ stage: 2 })).toMatch(/Network layer adds a header/);
  });

  it('dns lookup walks the referral chain', () => {
    const end = run(dnsLookupEngine, 100);
    expect(end.sent).toBe(DNS_MESSAGES.length);
    expect(dnsLookupEngine.describe(end)).toMatch(/Lookup complete/);
    expect(dnsLookupEngine.describe({ sent: 3 })).toMatch(/Root → Resolver/);
  });

  it('tcp handshake is deterministic per seed, enforces order and counts mistakes', () => {
    const a = tcpHandshakeEngine.init(7);
    const b = tcpHandshakeEngine.init(7);
    const c = tcpHandshakeEngine.init(8);
    expect(a.clientIsn).toBe(b.clientIsn);
    expect(a.clientIsn).not.toBe(c.clientIsn);

    const wrong = applyTcp(a, 'send-ack');
    expect(wrong.step).toBe(0);
    expect(wrong.mistakes).toBe(1);

    let s = applyTcp(a, 'send-syn');
    expect(s.clientState).toBe('SYN-SENT');
    s = applyTcp(s, 'send-syn-ack');
    expect(s.serverState).toBe('SYN-RECEIVED');
    expect(s.log[1]?.text).toContain(`ack=${String(a.clientIsn + 1)}`);
    s = applyTcp(s, 'send-ack');
    expect(s.clientState).toBe('ESTABLISHED');
    expect(tcpHandshakeEngine.isDone?.(s)).toBe(true);
    expect(applyTcp(s, 'send-data').log).toHaveLength(4);
    expect(run(tcpHandshakeEngine, 10).step).toBe(3);
  });

  it('tls handshake sends all messages and marks encryption', () => {
    const end = run(tlsHandshakeEngine, 20);
    expect(end.sent).toBe(TLS_MESSAGES.length);
    expect(TLS_MESSAGES.filter((m) => !m.encrypted).map((m) => m.text)).toEqual([
      'ClientHello',
      'ServerHello',
    ]);
    expect(tlsHandshakeEngine.describe({ sent: 1 })).toMatch(/ClientHello/);
  });

  it('subnet planner validates prefixes and describes the block', () => {
    const s = subnetPlannerEngine.init(1);
    expect(subnetPlannerEngine.step(s)).toBe(s);
    expect(subnetPlannerEngine.apply?.(s, { type: 'set-prefix', prefix: 26 }).prefix).toBe(26);
    expect(subnetPlannerEngine.apply?.(s, { type: 'set-prefix', prefix: 3 }).prefix).toBe(24);
    expect(subnetPlannerEngine.describe({ ...s, prefix: 26 })).toBe(
      '10.20.0.0/26: 62 usable hosts, broadcast 10.20.0.63. Need 50.',
    );
  });
});
