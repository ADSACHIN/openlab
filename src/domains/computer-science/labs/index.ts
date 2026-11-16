import { defineLab } from '@core/model';
import { resultOf } from '../simulators/adder/engine';
import type { AdderState } from '../simulators/adder/engine';
import type { CpuState } from '../simulators/cpu/engine';

export const overflowLab = defineLab({
  slug: 'overflow-to-zero',
  domainId: 'computer-science',
  title: 'Overflow to zero',
  summary: 'Pick two 4-bit numbers whose sum shows as 0000 with a carry out.',
  estimatedMinutes: 3,
  prerequisites: ['computer-science/adders'],
  simulatorId: 'computer-science/ripple-adder',
  goal: 'Choose A and B so the 4-bit result is 0 and the carry out is 1, then step until all four bits are added.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Hint: the 4-bit result is the true sum minus 16 whenever the carry out is 1.',
    },
  ],
  check: (state) => {
    const s = state as AdderState;
    if (s.stage < 4)
      return { passed: false, message: 'Step through all four bits first.', score: 10 };
    const r = resultOf(s);
    if (r.value === 0 && r.carryOut === 1)
      return {
        passed: true,
        message: `${String(s.a)} + ${String(s.b)} = 16, which needs five bits. Four bits show 0000 and the 1 falls off as the carry.`,
        score: 100,
      };
    if (r.carryOut === 1)
      return {
        passed: false,
        message: `${String(s.a)} + ${String(s.b)} overflows, but shows ${String(r.value)}. Aim for a true sum of exactly 16.`,
        score: 60,
      };
    return {
      passed: false,
      message: `${String(s.a)} + ${String(s.b)} = ${String(s.a + s.b)} fits in four bits. The sum needs to reach 16.`,
      score: 30,
    };
  },
});

export const countdownLab = defineLab({
  slug: 'countdown-from-five',
  domainId: 'computer-science',
  title: 'Reprogram the countdown',
  summary: 'Change one memory cell so the CPU prints 5, 4, 3, 2, 1.',
  estimatedMinutes: 4,
  prerequisites: ['computer-science/how-a-cpu-runs'],
  simulatorId: 'computer-science/tiny-cpu',
  goal: 'Make the program print 5, 4, 3, 2, 1 and halt.',
  instructions: [
    {
      type: 'paragraph',
      text: 'The program is fine; the data is not. Change the right memory cell, run to HLT, then check.',
    },
  ],
  check: (state) => {
    const s = state as CpuState;
    const out = s.output.join(', ');
    if (!s.halted)
      return {
        passed: false,
        message: `Not halted yet. Output so far: ${out || 'none'}.`,
        score: 10,
      };
    if (out === '5, 4, 3, 2, 1')
      return {
        passed: true,
        message: `Printed 5, 4, 3, 2, 1 in ${String(s.cycles)} instructions.`,
        score: 100,
      };
    return {
      passed: false,
      message: `The program printed ${out || 'nothing'}. Which cell holds the starting value?`,
      score: 40,
    };
  },
});
