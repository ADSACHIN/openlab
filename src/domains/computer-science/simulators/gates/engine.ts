import type { SimulatorEngine } from '@core/model';

export type Gate = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';
export const GATES: readonly Gate[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];

export function evaluate(gate: Gate, a: boolean, b: boolean): boolean {
  switch (gate) {
    case 'AND':
      return a && b;
    case 'OR':
      return a || b;
    case 'NOT':
      return !a;
    case 'NAND':
      return !(a && b);
    case 'NOR':
      return !(a || b);
    case 'XOR':
      return a !== b;
  }
}

export interface GatesState {
  gate: Gate;
  a: boolean;
  b: boolean;
}
export type GatesAction = { type: 'set-gate'; gate: Gate } | { type: 'toggle'; input: 'a' | 'b' };

const bit = (x: boolean) => (x ? '1' : '0');

export const gatesEngine: SimulatorEngine<GatesState, GatesAction> = {
  init: () => ({ gate: 'AND', a: false, b: false }),
  // Playing walks the truth table: 00 → 01 → 10 → 11 → 00.
  step: (s) => {
    const n = ((s.a ? 2 : 0) + (s.b ? 1 : 0) + 1) % 4;
    return { ...s, a: n >= 2, b: n % 2 === 1 };
  },
  isDone: () => false,
  apply: (s, a) =>
    a.type === 'set-gate' ? { ...s, gate: a.gate } : { ...s, [a.input]: !s[a.input] },
  describe: (s) =>
    s.gate === 'NOT'
      ? `NOT ${bit(s.a)} = ${bit(evaluate('NOT', s.a, s.b))}.`
      : `${bit(s.a)} ${s.gate} ${bit(s.b)} = ${bit(evaluate(s.gate, s.a, s.b))}.`,
};
