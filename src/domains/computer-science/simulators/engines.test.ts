import { describe, expect, it } from 'vitest';
import { adderEngine, fullAdd, resultOf, ripple } from './adder/engine';
import { binaryEngine, toBits, toHex, toSigned } from './binary/engine';
import { CYCLE_LIMIT, countdownProgram, cpuEngine, formatCell, stepCpu } from './cpu/engine';
import type { CpuState } from './cpu/engine';
import { accepts, dfaEngine, runDfa, transition } from './dfa/engine';
import { evaluate, gatesEngine } from './gates/engine';
import type { Gate } from './gates/engine';

function runAll<S>(
  engine: { init: (seed: number) => S; step: (s: S) => S; isDone?: (s: S) => boolean },
  from?: S,
  max = 5000,
): { state: S; steps: number } {
  let s = from ?? engine.init(1);
  let steps = 0;
  for (; steps < max && !engine.isDone?.(s); steps++) s = engine.step(s);
  return { state: s, steps };
}

describe('binary', () => {
  it('matches every number the lesson states', () => {
    expect(parseInt('1011', 2)).toBe(11);
    expect(toBits(11)).toBe('00001011');
    expect(toHex(255)).toBe('FF');
    expect(toHex(42)).toBe('2A');
    expect(toSigned(255)).toBe(-1);
    expect(toSigned(128)).toBe(-128);
    expect(toSigned(127)).toBe(127);
    expect(toSigned(0b11111110)).toBe(-2);
  });

  it('toggles bits, sets values and wraps when counting', () => {
    let s = binaryEngine.init(1);
    s = binaryEngine.apply?.(s, { type: 'toggle', bit: 7 }) ?? s;
    expect(s.value).toBe(128);
    expect(binaryEngine.apply?.(s, { type: 'toggle', bit: 9 })).toBe(s);
    expect(binaryEngine.step({ value: 255 }).value).toBe(0);
    expect(binaryEngine.describe({ value: 255 })).toBe(
      "11111111: 255 unsigned, -1 signed (two's complement), hex FF.",
    );
  });
});

describe('gates', () => {
  it('produce the textbook truth tables', () => {
    const table = (g: Gate) =>
      [false, true].flatMap((a) => [false, true].map((b) => (evaluate(g, a, b) ? 1 : 0))).join('');
    expect(table('AND')).toBe('0001');
    expect(table('OR')).toBe('0111');
    expect(table('NAND')).toBe('1110');
    expect(table('NOR')).toBe('1000');
    expect(table('XOR')).toBe('0110');
    expect(evaluate('NOT', true, false)).toBe(false);
  });

  it('NAND alone builds NOT, AND and OR', () => {
    const nand = (a: boolean, b: boolean) => evaluate('NAND', a, b);
    for (const a of [false, true]) {
      expect(nand(a, a)).toBe(!a);
      for (const b of [false, true]) {
        expect(nand(nand(a, b), nand(a, b))).toBe(a && b);
        expect(nand(nand(a, a), nand(b, b))).toBe(a || b);
      }
    }
  });

  it('cycles through all four input rows', () => {
    let s = gatesEngine.init(1);
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      s = gatesEngine.step(s);
      seen.push(`${String(s.a ? 1 : 0)}${String(s.b ? 1 : 0)}`);
    }
    expect(seen).toEqual(['01', '10', '11', '00']);
  });
});

describe('adder', () => {
  it('full adder and ripple are correct for every 4-bit pair', () => {
    expect(fullAdd(1, 1, 1)).toEqual({ sum: 1, carry: 1 });
    expect(fullAdd(1, 1, 0)).toEqual({ sum: 0, carry: 1 });
    for (let a = 0; a < 16; a++) {
      for (let b = 0; b < 16; b++) {
        const r = resultOf({ a, b, stage: 4 });
        expect(r.value + 16 * r.carryOut).toBe(a + b);
      }
    }
  });

  it('matches the lesson examples', () => {
    expect(resultOf({ a: 9, b: 8, stage: 4 })).toEqual({ value: 1, carryOut: 1 });
    expect(resultOf({ a: 5, b: 3, stage: 4 })).toEqual({ value: 8, carryOut: 0 });
    // 5 + 3: the carry ripples through bits 0, 1 and 2
    expect(ripple(5, 3).carries).toEqual([0, 1, 1, 1, 0]);
  });

  it('takes four steps and resets when inputs change', () => {
    const { state, steps } = runAll(adderEngine);
    expect(steps).toBe(4);
    expect(adderEngine.describe(state)).toBe('5 + 3 = 8. The 4-bit result is 8 with carry out 0.');
    expect(adderEngine.apply?.(state, { type: 'set-a', value: 9 })).toEqual({
      a: 9,
      b: 3,
      stage: 0,
    });
    expect(adderEngine.apply?.(state, { type: 'set-b', value: 16 })).toBe(state);
  });
});

describe('cpu', () => {
  it('counts down from 3 in 18 instructions = 54 steps', () => {
    const { state, steps } = runAll(cpuEngine);
    expect(state.output).toEqual([3, 2, 1]);
    expect(state.halted).toBe(true);
    expect(state.cycles).toBe(18);
    expect(steps).toBe(54);
  });

  it('fetch increments PC before execute; decode changes nothing but the phase', () => {
    let s = cpuEngine.init(1);
    s = stepCpu(s);
    expect(s).toMatchObject({ pc: 1, phase: 'decode', acc: 0 });
    expect(formatCell(s.ir ?? 0)).toBe('LDA 10');
    const decoded = stepCpu(s);
    expect(decoded).toMatchObject({ pc: 1, phase: 'execute', acc: 0 });
    expect(stepCpu(decoded)).toMatchObject({ acc: 3, phase: 'fetch', cycles: 1 });
  });

  it('runs any countdown, restarts on data edits and refuses program edits', () => {
    const five = cpuEngine.apply?.(cpuEngine.init(1), { type: 'set-data', address: 10, value: 5 });
    expect(five?.memory[10]).toBe(5);
    expect(runAll(cpuEngine, five).state.output).toEqual([5, 4, 3, 2, 1]);
    const s = cpuEngine.init(1);
    expect(cpuEngine.apply?.(s, { type: 'set-data', address: 2, value: 0 })).toBe(s);
  });

  it('stops runaway programs at the cycle limit', () => {
    const zero: CpuState =
      cpuEngine.apply?.(cpuEngine.init(1), { type: 'set-data', address: 10, value: 0 }) ??
      cpuEngine.init(1);
    const { state } = runAll(cpuEngine, zero);
    // n = 0 underflows to 255 and keeps going; the guard stops it.
    expect(state.halted).toBe(true);
    expect(state.cycles).toBe(CYCLE_LIMIT);
    expect(countdownProgram(4)[10]).toBe(4);
  });
});

describe('dfa: binary numbers divisible by 3', () => {
  it('agrees with n % 3 for every number up to 1024', () => {
    for (let n = 0; n <= 1024; n++) expect(runDfa(n.toString(2))).toBe(n % 3);
  });

  it('matches the lesson examples and transitions', () => {
    expect(accepts('110')).toBe(true); // 6
    expect(accepts('111')).toBe(false); // 7
    expect(accepts('1001')).toBe(true); // 9
    expect(runDfa('111')).toBe(1);
    expect([
      transition(0, 0),
      transition(0, 1),
      transition(1, 0),
      transition(1, 1),
      transition(2, 0),
      transition(2, 1),
    ]).toEqual([0, 1, 2, 0, 1, 2]);
  });

  it('steps through input and sanitises edits', () => {
    const { state, steps } = runAll(dfaEngine);
    expect(steps).toBe(4);
    expect(dfaEngine.describe(state)).toBe(
      'Read "1001" (9). Ended in r0: accepted, divisible by 3.',
    );
    const edited = dfaEngine.apply?.(state, { type: 'set-input', input: '1a1 1' });
    expect(edited).toEqual({ input: '111', pos: 0, state: 0, last: null });
  });
});
