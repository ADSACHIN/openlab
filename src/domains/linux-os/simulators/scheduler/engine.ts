import type { SimulatorEngine } from '@core/model';

export interface Proc {
  pid: number;
  name: string;
  burst: number;
  remaining: number;
  firstRun: number | null;
  finish: number | null;
}
export interface Slice {
  pid: number;
  start: number;
  end: number;
}
export interface SchedulerState {
  quantum: number;
  time: number;
  procs: readonly Proc[];
  /** Ready queue of pids, front first. */
  queue: readonly number[];
  current: number | null;
  sliceUsed: number;
  timeline: readonly Slice[];
  contextSwitches: number;
}
export interface SchedulerAction {
  type: 'set-quantum';
  quantum: number;
}

export const WORKLOAD: readonly { name: string; burst: number }[] = [
  { name: 'editor', burst: 8 },
  { name: 'compiler', burst: 4 },
  { name: 'browser', burst: 6 },
];

export function initScheduler(quantum: number): SchedulerState {
  const procs = WORKLOAD.map((w, i) => ({
    pid: 100 + i,
    name: w.name,
    burst: w.burst,
    remaining: w.burst,
    firstRun: null,
    finish: null,
  }));
  return {
    quantum,
    time: 0,
    procs,
    queue: procs.map((p) => p.pid),
    current: null,
    sliceUsed: 0,
    timeline: [],
    contextSwitches: 0,
  };
}

/** Advance the clock by one millisecond of round-robin scheduling. */
export function tick(s: SchedulerState): SchedulerState {
  if (isFinished(s)) return s;
  let { current, queue, sliceUsed, contextSwitches } = s;
  // Dispatch if idle.
  if (current === null) {
    const [next, ...rest] = queue;
    if (next === undefined) return s;
    current = next;
    queue = rest;
    sliceUsed = 0;
    const last = s.timeline[s.timeline.length - 1];
    if (last && last.pid !== current) contextSwitches++;
  }
  const pid = current;
  const procs = s.procs.map((p) =>
    p.pid === pid ? { ...p, remaining: p.remaining - 1, firstRun: p.firstRun ?? s.time } : p,
  );
  const time = s.time + 1;
  sliceUsed++;
  const timeline = [...s.timeline];
  const last = timeline[timeline.length - 1];
  if (last?.pid === pid && last.end === s.time)
    timeline[timeline.length - 1] = { ...last, end: time };
  else timeline.push({ pid, start: s.time, end: time });

  const running = procs.find((p) => p.pid === pid);
  let next: number | null = pid;
  if (running?.remaining === 0) {
    procs.splice(procs.indexOf(running), 1, { ...running, finish: time });
    next = null;
  } else if (sliceUsed >= s.quantum) {
    queue = [...queue, pid];
    next = null;
  }
  return { ...s, time, procs, queue, current: next, sliceUsed, timeline, contextSwitches };
}

export function isFinished(s: SchedulerState): boolean {
  return s.procs.every((p) => p.remaining === 0);
}

export function averageWaiting(s: SchedulerState): number {
  const done = s.procs.filter((p) => p.finish !== null);
  if (done.length === 0) return 0;
  return done.reduce((sum, p) => sum + ((p.finish ?? 0) - p.burst), 0) / done.length;
}

export function averageResponse(s: SchedulerState): number {
  const started = s.procs.filter((p) => p.firstRun !== null);
  if (started.length === 0) return 0;
  return started.reduce((sum, p) => sum + (p.firstRun ?? 0), 0) / started.length;
}

export const schedulerEngine: SimulatorEngine<SchedulerState, SchedulerAction> = {
  init: () => initScheduler(4),
  step: tick,
  isDone: isFinished,
  apply: (s, a) =>
    Number.isInteger(a.quantum) && a.quantum >= 1 && a.quantum <= 10 ? initScheduler(a.quantum) : s,
  describe: (s) => {
    const cur = s.procs.find((p) => p.pid === s.current);
    if (isFinished(s))
      return `All processes finished at ${String(s.time)} ms with ${String(s.contextSwitches)} context switches; average waiting ${averageWaiting(s).toFixed(1)} ms.`;
    return `t=${String(s.time)} ms, quantum ${String(s.quantum)}: ${cur ? `${cur.name} running (${String(cur.remaining)} ms left)` : 'CPU idle'}, queue ${s.queue.map((pid) => s.procs.find((p) => p.pid === pid)?.name ?? '').join(' → ') || 'empty'}.`;
  },
};
