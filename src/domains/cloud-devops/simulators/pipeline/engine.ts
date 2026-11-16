import type { SimulatorEngine } from '@core/model';

export interface Job {
  id: string;
  label: string;
  duration: number;
  needs: readonly string[];
}
export type JobStatus = 'waiting' | 'running' | 'passed' | 'failed' | 'skipped';

export const SEQUENTIAL: readonly Job[] = [
  { id: 'lint', label: 'Lint', duration: 1, needs: [] },
  { id: 'unit', label: 'Unit tests', duration: 3, needs: ['lint'] },
  { id: 'build', label: 'Build', duration: 2, needs: ['unit'] },
  { id: 'e2e', label: 'E2E tests', duration: 4, needs: ['build'] },
  { id: 'deploy', label: 'Deploy', duration: 1, needs: ['e2e'] },
];

/** Lint and unit tests run side by side, and E2E is split into two shards. */
export const PARALLEL: readonly Job[] = [
  { id: 'lint', label: 'Lint', duration: 1, needs: [] },
  { id: 'unit', label: 'Unit tests', duration: 3, needs: [] },
  { id: 'build', label: 'Build', duration: 2, needs: ['lint', 'unit'] },
  { id: 'e2e-1', label: 'E2E shard 1', duration: 2, needs: ['build'] },
  { id: 'e2e-2', label: 'E2E shard 2', duration: 2, needs: ['build'] },
  { id: 'deploy', label: 'Deploy', duration: 1, needs: ['e2e-1', 'e2e-2'] },
];

export interface PipelineState {
  parallel: boolean;
  /** A unit test currently fails (a bug in the code). */
  bug: boolean;
  time: number;
  status: Readonly<Record<string, JobStatus>>;
  progress: Readonly<Record<string, number>>;
  /** When each job finished (time units). */
  finished: Readonly<Record<string, number>>;
}
export type PipelineAction =
  { type: 'set-parallel'; parallel: boolean } | { type: 'set-bug'; bug: boolean };

export const jobsOf = (s: PipelineState): readonly Job[] => (s.parallel ? PARALLEL : SEQUENTIAL);

export function initPipeline(parallel: boolean, bug: boolean): PipelineState {
  const jobs = parallel ? PARALLEL : SEQUENTIAL;
  return {
    parallel,
    bug,
    time: 0,
    status: Object.fromEntries(jobs.map((j) => [j.id, 'waiting' as const])),
    progress: Object.fromEntries(jobs.map((j) => [j.id, 0])),
    finished: {},
  };
}

function settle(jobs: readonly Job[], status: Record<string, JobStatus>): void {
  // Skip anything downstream of a failure; start anything whose needs all passed.
  let changed = true;
  while (changed) {
    changed = false;
    for (const j of jobs) {
      if (status[j.id] !== 'waiting') continue;
      if (j.needs.some((n) => status[n] === 'failed' || status[n] === 'skipped')) {
        status[j.id] = 'skipped';
        changed = true;
      } else if (j.needs.every((n) => status[n] === 'passed')) {
        status[j.id] = 'running';
        changed = true;
      }
    }
  }
}

export function isPipelineDone(s: PipelineState): boolean {
  return Object.values(s.status).every((st) => st !== 'waiting' && st !== 'running');
}

export function tickPipeline(s: PipelineState): PipelineState {
  if (isPipelineDone(s)) return s;
  const jobs = jobsOf(s);
  const status: Record<string, JobStatus> = { ...s.status };
  const progress: Record<string, number> = { ...s.progress };
  const finished: Record<string, number> = { ...s.finished };
  settle(jobs, status);
  const time = s.time + 1;
  for (const j of jobs) {
    if (status[j.id] !== 'running') continue;
    progress[j.id] = (progress[j.id] ?? 0) + 1;
    if ((progress[j.id] ?? 0) >= j.duration) {
      status[j.id] = j.id === 'unit' && s.bug ? 'failed' : 'passed';
      finished[j.id] = time;
    }
  }
  settle(jobs, status);
  // Jobs that only just became runnable start on the next tick.
  for (const j of jobs)
    if (status[j.id] === 'running' && (progress[j.id] ?? 0) === 0) status[j.id] = 'waiting';
  return { ...s, time, status, progress, finished };
}

export function finishPipeline(s: PipelineState): PipelineState {
  let x = s;
  while (!isPipelineDone(x)) x = tickPipeline(x);
  return x;
}

export const pipelineEngine: SimulatorEngine<PipelineState, PipelineAction> = {
  init: () => initPipeline(false, true),
  step: tickPipeline,
  isDone: isPipelineDone,
  apply: (s, a) =>
    a.type === 'set-parallel' ? initPipeline(a.parallel, s.bug) : initPipeline(s.parallel, a.bug),
  describe: (s) => {
    const failed = Object.entries(s.status).find(([, st]) => st === 'failed');
    if (isPipelineDone(s)) {
      return s.status.deploy === 'passed'
        ? `Pipeline green in ${String(s.time)} time units. Deployed.`
        : `Pipeline red after ${String(s.time)} time units: ${failed?.[0] ?? 'a job'} failed, so deploy was skipped.`;
    }
    const running = jobsOf(s)
      .filter((j) => s.status[j.id] === 'running')
      .map((j) => j.label);
    return `t=${String(s.time)}: ${running.length ? `running ${running.join(' and ')}` : 'starting'}.`;
  },
};
