import { defineSimulator } from '@core/model';
import { adderEngine } from './adder/engine';
import { AdderView } from './adder/AdderView';
import { binaryEngine } from './binary/engine';
import { BinaryView } from './binary/BinaryView';
import { cpuEngine } from './cpu/engine';
import { CpuView } from './cpu/CpuView';
import { dfaEngine } from './dfa/engine';
import { DfaView } from './dfa/DfaView';
import { gatesEngine } from './gates/engine';
import { GatesView } from './gates/GatesView';

const domainId = 'computer-science' as const;

export const binary = defineSimulator({
  domainId,
  slug: 'binary',
  title: '8-bit register',
  description: 'Toggle bits and read the value as unsigned, signed and hex.',
  engine: binaryEngine,
  View: BinaryView,
  tickRate: 4,
});
export const gates = defineSimulator({
  domainId,
  slug: 'logic-gates',
  title: 'Logic gates',
  description: 'Flip inputs and watch the output and truth table.',
  engine: gatesEngine,
  View: GatesView,
  tickRate: 1,
});
export const adder = defineSimulator({
  domainId,
  slug: 'ripple-adder',
  title: '4-bit ripple-carry adder',
  description: 'Four full adders chained by their carries.',
  engine: adderEngine,
  View: AdderView,
  tickRate: 1,
});
export const cpu = defineSimulator({
  domainId,
  slug: 'tiny-cpu',
  title: 'Tiny CPU',
  description: 'An accumulator machine running fetch, decode, execute.',
  engine: cpuEngine,
  View: CpuView,
  tickRate: 3,
});
export const dfa = defineSimulator({
  domainId,
  slug: 'dfa-mod3',
  title: 'Finite automaton',
  description: 'A three-state machine that recognises multiples of 3 in binary.',
  engine: dfaEngine,
  View: DfaView,
  tickRate: 1.5,
});

export const simulators = [binary, gates, adder, cpu, dfa];
