import type { SimulatorEngine } from '@core/model';

export interface Wrap {
  label: string;
  header: string;
  layer: string;
}

/** Headers added on the way down (sender), then removed on the way up (receiver). */
export const WRAPS: readonly Wrap[] = [
  {
    label: 'Segment',
    header: 'TCP: src port 51234 → dst port 443, seq, flags',
    layer: 'Transport',
  },
  { label: 'Packet', header: 'IP: 192.168.1.20 → 93.184.216.34, TTL 64', layer: 'Network' },
  {
    label: 'Frame',
    header: 'Ethernet: 3c:22:… → router MAC, type 0x0800, FCS',
    layer: 'Data Link',
  },
];

export interface EncapsulationState {
  /** 0 = plain data; 1..3 = wrapped; 4 = on the wire; 5..7 = unwrapped at the receiver; 8 = delivered. */
  stage: number;
}

export const STAGE_COUNT = 9;

export const encapsulationEngine: SimulatorEngine<EncapsulationState> = {
  init: () => ({ stage: 0 }),
  step: (s) => ({ stage: Math.min(s.stage + 1, STAGE_COUNT - 1) }),
  isDone: (s) => s.stage >= STAGE_COUNT - 1,
  describe: (s) => describeStage(s.stage),
};

export function wrapsAt(stage: number): number {
  if (stage <= 3) return stage;
  if (stage === 4) return 3;
  return Math.max(0, 8 - stage);
}

export function describeStage(stage: number): string {
  if (stage === 0) return 'The application hands "GET /index.html" to the transport layer.';
  if (stage <= 3) {
    const w = WRAPS[stage - 1];
    return w ? `${w.layer} layer adds a header: now a ${w.label}.` : '';
  }
  if (stage === 4) return 'Bits travel across the physical medium to the receiver.';
  if (stage <= 7) {
    const w = WRAPS[7 - stage];
    return w ? `Receiver's ${w.layer} layer reads and removes its header.` : '';
  }
  return 'The receiving application gets the original data.';
}
