import type { SimulatorEngine } from '@core/model';

/** States are remainders mod 3 of the binary number read so far. */
export type DfaState = 0 | 1 | 2;
export const MAX_INPUT = 16;

/** Reading bit b after value v gives 2v + b, so the remainder moves from r to (2r + b) mod 3. */
export function transition(r: DfaState, bit: 0 | 1): DfaState {
  return ((2 * r + bit) % 3) as DfaState;
}

export interface DfaSimState {
  input: string;
  pos: number;
  state: DfaState;
  /** The (from, bit) of the most recent transition, for highlighting. */
  last: { from: DfaState; bit: 0 | 1 } | null;
}
export interface DfaAction {
  type: 'set-input';
  input: string;
}

export function runDfa(input: string): DfaState {
  let r: DfaState = 0;
  for (const ch of input) r = transition(r, ch === '1' ? 1 : 0);
  return r;
}

export const accepts = (input: string): boolean => runDfa(input) === 0;

export const dfaEngine: SimulatorEngine<DfaSimState, DfaAction> = {
  init: () => ({ input: '1001', pos: 0, state: 0, last: null }),
  step: (s) => {
    const ch = s.input[s.pos];
    if (ch === undefined) return s;
    const bit = ch === '1' ? 1 : 0;
    return { ...s, pos: s.pos + 1, state: transition(s.state, bit), last: { from: s.state, bit } };
  },
  isDone: (s) => s.pos >= s.input.length,
  apply: (_s, a) => ({
    input: a.input.replace(/[^01]/g, '').slice(0, MAX_INPUT),
    pos: 0,
    state: 0,
    last: null,
  }),
  describe: (s) => {
    const value = s.input === '' ? 0 : parseInt(s.input, 2);
    if (s.pos >= s.input.length) {
      return `Read "${s.input}" (${String(value)}). Ended in r${String(s.state)}: ${s.state === 0 ? 'accepted, divisible by 3' : `rejected, remainder ${String(s.state)}`}.`;
    }
    return `Read ${String(s.pos)} of ${String(s.input.length)} bits. In state r${String(s.state)}. Next bit: ${s.input[s.pos] ?? ''}.`;
  },
};
