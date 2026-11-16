import { describe, expect, it } from 'vitest';
import { createRegistry } from '@core/registry';
import { computerScienceModule } from './index';
import { adderEngine } from './simulators/adder/engine';
import { cpuEngine, stepCpu } from './simulators/cpu/engine';

describe('computer-science module', () => {
  const registry = createRegistry([computerScienceModule]);

  it('registers in prerequisite order', () => {
    expect(registry.lessonsFor('computer-science').map((l) => l.slug)).toEqual([
      'bits-and-binary',
      'logic-gates',
      'adders',
      'how-a-cpu-runs',
      'finite-automata',
    ]);
  });

  it('grades the overflow lab', () => {
    const lab = registry.getLab('computer-science/overflow-to-zero');
    const finish = (a: number, b: number) => ({ ...adderEngine.init(1), a, b, stage: 4 });
    expect(lab?.check(adderEngine.init(1))).toMatchObject({ passed: false, score: 10 });
    expect(lab?.check(finish(5, 3))).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(finish(9, 8))).toMatchObject({ passed: false, score: 60 });
    expect(lab?.check(finish(9, 7))).toMatchObject({ passed: true, score: 100 });
    expect(lab?.check(finish(8, 8))).toMatchObject({ passed: true });
  });

  it('grades the countdown lab', () => {
    const lab = registry.getLab('computer-science/countdown-from-five');
    const run = (s: ReturnType<typeof cpuEngine.init>) => {
      let x = s;
      while (!x.halted) x = stepCpu(x);
      return x;
    };
    expect(lab?.check(cpuEngine.init(1))).toMatchObject({ passed: false, score: 10 });
    expect(lab?.check(run(cpuEngine.init(1)))).toMatchObject({ passed: false, score: 40 });
    const five =
      cpuEngine.apply?.(cpuEngine.init(1), { type: 'set-data', address: 10, value: 5 }) ??
      cpuEngine.init(1);
    expect(lab?.check(run(five))).toMatchObject({
      passed: true,
      score: 100,
      message: 'Printed 5, 4, 3, 2, 1 in 30 instructions.',
    });
  });
});
