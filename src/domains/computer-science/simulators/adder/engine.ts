import type { SimulatorEngine } from '@core/model';

export const WIDTH = 4;
export const MAX = (1 << WIDTH) - 1;

/** One full adder: sum = a XOR b XOR c; carry = majority(a, b, c). */
export function fullAdd(a: number, b: number, c: number): { sum: number; carry: number } {
  return { sum: a ^ b ^ c, carry: (a & b) | (a & c) | (b & c) };
}

/** Bit-by-bit ripple: sums[i] is bit i of the result, carries[i] is the carry into bit i (carries[WIDTH] = carry out). */
export function ripple(a: number, b: number): { sums: number[]; carries: number[] } {
  const sums: number[] = [];
  const carries: number[] = [0];
  for (let i = 0; i < WIDTH; i++) {
    const r = fullAdd((a >> i) & 1, (b >> i) & 1, carries[i] ?? 0);
    sums.push(r.sum);
    carries.push(r.carry);
  }
  return { sums, carries };
}

export interface AdderState {
  a: number;
  b: number;
  /** How many bit positions the carry has rippled through (0–4). */
  stage: number;
}
export type AdderAction = { type: 'set-a'; value: number } | { type: 'set-b'; value: number };

const clamp = (v: number) => (Number.isInteger(v) && v >= 0 && v <= MAX ? v : null);

export function resultOf(s: AdderState): { value: number; carryOut: number } {
  const { sums, carries } = ripple(s.a, s.b);
  return {
    value: sums.reduce((acc, bit, i) => acc | (bit << i), 0),
    carryOut: carries[WIDTH] ?? 0,
  };
}

export const adderEngine: SimulatorEngine<AdderState, AdderAction> = {
  init: () => ({ a: 5, b: 3, stage: 0 }),
  step: (s) => ({ ...s, stage: Math.min(WIDTH, s.stage + 1) }),
  isDone: (s) => s.stage >= WIDTH,
  apply: (s, a) => {
    const v = clamp(a.value);
    if (v === null) return s;
    return a.type === 'set-a' ? { a: v, b: s.b, stage: 0 } : { a: s.a, b: v, stage: 0 };
  },
  describe: (s) => {
    if (s.stage === 0)
      return `${String(s.a)} + ${String(s.b)}: press Step to add bit 0 (the rightmost).`;
    const { sums, carries } = ripple(s.a, s.b);
    if (s.stage < WIDTH) {
      const i = s.stage - 1;
      return `Bit ${String(i)}: ${String((s.a >> i) & 1)} + ${String((s.b >> i) & 1)} + carry ${String(carries[i] ?? 0)} = sum ${String(sums[i] ?? 0)}, carry ${String(carries[i + 1] ?? 0)}.`;
    }
    const r = resultOf(s);
    return `${String(s.a)} + ${String(s.b)} = ${String(s.a + s.b)}. The 4-bit result is ${String(r.value)} with carry out ${String(r.carryOut)}${r.carryOut ? ': overflow' : ''}.`;
  },
};
