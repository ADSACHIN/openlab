import { describe, expect, it } from 'vitest';
import { createRegistry } from '@core/registry';
import { linuxOsModule } from './index';
import { initScheduler, tick } from './simulators/scheduler/engine';
import { runCommand, terminalEngine } from './simulators/terminal/engine';

describe('linux-os module', () => {
  const registry = createRegistry([linuxOsModule]);

  it('registers with lessons in prerequisite order', () => {
    expect(registry.lessonsFor('linux-os').map((l) => l.slug)).toEqual([
      'shell-basics',
      'filesystem',
      'permissions',
      'processes',
      'virtual-memory',
    ]);
    expect(registry.labsFor('linux-os')).toHaveLength(2);
  });

  it('grades the SSH key lab', () => {
    const lab = registry.getLab('linux-os/secure-the-key');
    let s = terminalEngine.init(1);
    expect(lab?.check(s)).toMatchObject({ passed: false, score: 20 });
    s = runCommand(s, 'chmod 600 ~/.ssh/id_ed25519');
    expect(lab?.check(s)).toMatchObject({ passed: false, score: 70 });
    s = runCommand(s, 'chmod 700 ~/.ssh');
    expect(lab?.check(s)).toMatchObject({ passed: true, score: 100 });
    expect(lab?.check(runCommand(s, 'rm ~/.ssh/id_ed25519'))).toMatchObject({
      passed: false,
      score: 0,
    });
  });

  it('grades the quantum lab', () => {
    const lab = registry.getLab('linux-os/tune-the-quantum');
    const finish = (q: number) => {
      let s = initScheduler(q);
      for (let i = 0; i < 100 && !s.procs.every((p) => p.remaining === 0); i++) s = tick(s);
      return s;
    };
    expect(lab?.check(initScheduler(4))).toMatchObject({ passed: false, score: 10 });
    expect(lab?.check(finish(10))).toMatchObject({ passed: false, score: 40 });
    expect(lab?.check(finish(2))).toMatchObject({ passed: false, score: 50 });
    expect(lab?.check(finish(5))).toMatchObject({ passed: true });
    expect(lab?.check(finish(6))).toMatchObject({ passed: true });
  });
});
