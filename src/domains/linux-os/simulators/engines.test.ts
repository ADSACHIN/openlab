import { describe, expect, it } from 'vitest';
import { initPaging, pagingEngine } from './paging/engine';
import { explain, hasBit, permissionBitsEngine } from './permission-bits/engine';
import { averageWaiting, initScheduler, schedulerEngine, tick } from './scheduler/engine';
import { prompt, runCommand, terminalEngine } from './terminal/engine';

function runAll<S>(
  engine: { init: (seed: number) => S; step: (s: S) => S; isDone?: (s: S) => boolean },
  max = 500,
): S {
  let s = engine.init(1);
  for (let i = 0; i < max && !engine.isDone?.(s); i++) s = engine.step(s);
  return s;
}

describe('terminal', () => {
  it('runs a realistic session', () => {
    let s = terminalEngine.init(1);
    expect(prompt(s)).toBe('learner@openlab-vm:~$');
    s = runCommand(s, 'ls');
    expect(s.history[0]?.output).toBe('notes.txt  projects');
    s = runCommand(s, 'ls -la');
    expect(s.history[1]?.output).toContain('drwxr-xr-x 1 learner learner  4096 .ssh');
    s = runCommand(s, 'cd /etc');
    expect(s.cwd).toBe('/etc');
    expect(prompt(s)).toBe('learner@openlab-vm:/etc$');
    s = runCommand(s, 'cat hostname');
    expect(s.history[3]?.output).toBe('openlab-vm');
    s = runCommand(s, 'cat shadow');
    expect(s.history[4]).toMatchObject({ output: 'cat: shadow: Permission denied', error: true });
    s = runCommand(s, 'cd ~/projects');
    s = runCommand(s, 'echo "hello world" > hi.txt');
    s = runCommand(s, 'cat hi.txt');
    expect(s.history[7]?.output).toBe('hello world');
    s = runCommand(s, 'chmod 600 ~/.ssh/id_ed25519');
    expect(s.fs['/home/learner/.ssh/id_ed25519']?.mode).toBe(0o600);
    s = runCommand(s, 'stat ~/.ssh/id_ed25519');
    expect(s.history[9]?.output).toContain('(600/-rw-------)');
    s = runCommand(s, 'frobnicate');
    expect(s.history[10]).toMatchObject({
      output: 'bash: frobnicate: command not found',
      error: true,
    });
    s = runCommand(s, 'mkdir /etc/nope');
    expect(s.history[11]?.output).toContain('Permission denied');
    s = runCommand(s, 'clear');
    expect(s.history).toHaveLength(0);
    expect(terminalEngine.apply?.(s, { type: 'run', command: 'pwd' }).history[0]?.output).toBe(
      '/home/learner/projects',
    );
  });
});

describe('permission bits', () => {
  it('toggles bits and explains them', () => {
    let s = permissionBitsEngine.init(1);
    expect(hasBit(s.mode, 0, 1)).toBe(true);
    expect(hasBit(s.mode, 2, 1)).toBe(false);
    s = permissionBitsEngine.apply?.(s, { type: 'toggle', bit: 0 }) ?? s; // owner read off
    expect(s.mode).toBe(0o244);
    s = permissionBitsEngine.apply?.(s, { type: 'set', mode: 0o750 }) ?? s;
    expect(permissionBitsEngine.describe(s)).toContain('-rwxr-x--- (750)');
    expect(explain(0o700, true)).toBe(
      'owner: list, create/delete inside, enter; group: nothing; others: nothing',
    );
  });
});

describe('round-robin scheduler', () => {
  it('runs the workload to completion and counts context switches', () => {
    const end = runAll(schedulerEngine);
    expect(end.time).toBe(18);
    expect(end.procs.every((p) => p.remaining === 0 && p.finish !== null)).toBe(true);
    // q=4: editor4 compiler4 browser4 editor4 browser2 → 4 switches
    expect(end.contextSwitches).toBe(4);
    expect(end.timeline.map((t) => `${String(t.pid)}:${String(t.end - t.start)}`)).toEqual([
      '100:4',
      '101:4',
      '102:4',
      '100:4',
      '102:2',
    ]);
  });

  it('a long quantum degenerates to FCFS', () => {
    let s = initScheduler(10);
    while (!schedulerEngine.isDone?.(s)) s = tick(s);
    expect(s.contextSwitches).toBe(2);
    expect(averageWaiting(s)).toBeCloseTo((0 + 8 + 12) / 3);
    expect(schedulerEngine.apply?.(s, { type: 'set-quantum', quantum: 3 }).quantum).toBe(3);
    expect(schedulerEngine.apply?.(s, { type: 'set-quantum', quantum: 99 })).toBe(s);
  });
});

describe('paging', () => {
  it('reproduces the textbook FIFO and LRU fault counts for 3 frames', () => {
    expect(runAll(pagingEngine).faults).toBe(15);
    let lru = initPaging('lru', 3);
    while (!pagingEngine.isDone?.(lru)) lru = pagingEngine.step(lru);
    expect(lru.faults).toBe(12);
    const four = pagingEngine.apply?.(lru, { type: 'set-frames', count: 4 });
    expect(four?.frames).toHaveLength(4);
    expect(four?.index).toBe(0);
  });
});
