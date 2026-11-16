import type { SimulatorEngine } from '@core/model';

export type Env = Readonly<Record<string, number>>;

export interface Line {
  text: string;
  /** Returns the new environment, an optional jump target and optional output. Absent `jump` means next line. */
  run: (env: Env) => { env: Env; jump?: number; out?: string };
  indent?: number;
}

export interface TracerState {
  pc: number;
  env: Env;
  output: readonly string[];
  steps: number;
  /** Line that just executed, for highlighting. */
  last: number | null;
}

export interface TracerProgram {
  title: string;
  lines: readonly Line[];
}

export const SUM_PROGRAM: TracerProgram = {
  title: 'Sum 1 to 4',
  lines: [
    { text: 'total = 0', run: (e) => ({ env: { ...e, total: 0 } }) },
    { text: 'i = 1', run: (e) => ({ env: { ...e, i: 1 } }) },
    { text: 'while i <= 4:', run: (e) => ({ env: e, jump: (e.i ?? 0) <= 4 ? 3 : 5 }) },
    {
      text: 'total = total + i',
      indent: 1,
      run: (e) => ({ env: { ...e, total: (e.total ?? 0) + (e.i ?? 0) } }),
    },
    { text: 'i = i + 1', indent: 1, run: (e) => ({ env: { ...e, i: (e.i ?? 0) + 1 }, jump: 2 }) },
    { text: 'print(total)', run: (e) => ({ env: e, out: String(e.total ?? 0) }) },
  ],
};

/** Same program with an off-by-one bug: `<` instead of `<=`. */
export const BUGGY_PROGRAM: TracerProgram = {
  title: 'Sum 1 to 4 (buggy)',
  lines: SUM_PROGRAM.lines.map((l, i) =>
    i === 2
      ? { text: 'while i < 4:', run: (e: Env) => ({ env: e, jump: (e.i ?? 0) < 4 ? 3 : 5 }) }
      : l,
  ),
};

export function createTracerEngine(program: TracerProgram): SimulatorEngine<TracerState> {
  const done = (s: TracerState) => s.pc >= program.lines.length;
  return {
    init: () => ({ pc: 0, env: {}, output: [], steps: 0, last: null }),
    step: (s) => {
      const line = program.lines[s.pc];
      if (!line) return s;
      const r = line.run(s.env);
      return {
        pc: r.jump ?? s.pc + 1,
        env: r.env,
        output: r.out === undefined ? s.output : [...s.output, r.out],
        steps: s.steps + 1,
        last: s.pc,
      };
    },
    isDone: done,
    describe: (s) => {
      const vars = Object.entries(s.env)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(', ');
      if (done(s))
        return `Program finished after ${String(s.steps)} steps. Output: ${s.output.join(' ') || 'none'}. Variables: ${vars}.`;
      const next = program.lines[s.pc]?.text ?? '';
      return `Next line ${String(s.pc + 1)}: ${next}. Variables: ${vars || 'none yet'}.`;
    },
  };
}
