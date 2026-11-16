import type { SimulatorEngine } from '@core/model';

export type Edit = 'source' | 'dependencies';

export interface Instruction {
  id: string;
  text: string;
  /** Seconds to rebuild this layer. */
  seconds: number;
  /** Which kinds of edit change this step's input directly. */
  affectedBy: readonly Edit[];
}

export const INSTRUCTIONS: Readonly<Record<string, Instruction>> = {
  from: { id: 'from', text: 'FROM node:24-slim', seconds: 5, affectedBy: [] },
  workdir: { id: 'workdir', text: 'WORKDIR /app', seconds: 1, affectedBy: [] },
  manifest: {
    id: 'manifest',
    text: 'COPY package.json package-lock.json ./',
    seconds: 1,
    affectedBy: ['dependencies'],
  },
  install: { id: 'install', text: 'RUN npm ci', seconds: 30, affectedBy: [] },
  // The whole build context includes package.json, so dependency edits change it too.
  source: { id: 'source', text: 'COPY . .', seconds: 2, affectedBy: ['source', 'dependencies'] },
  build: { id: 'build', text: 'RUN npm run build', seconds: 15, affectedBy: [] },
};

export const NAIVE_ORDER: readonly string[] = [
  'from',
  'workdir',
  'source',
  'manifest',
  'install',
  'build',
];
export const CACHE_FRIENDLY_ORDER: readonly string[] = [
  'from',
  'workdir',
  'manifest',
  'install',
  'source',
  'build',
];

/** Returns an error message if the Dockerfile cannot work in this order, or null. */
export function validate(order: readonly string[]): string | null {
  const at = (id: string) => order.indexOf(id);
  if (at('from') !== 0) return 'FROM must be the first instruction.';
  if (at('install') < Math.min(...['manifest', 'source'].map(at)))
    return 'RUN npm ci needs package.json copied in before it.';
  if (at('build') < at('source')) return 'RUN npm run build needs the source code copied in first.';
  if (at('build') < at('install')) return 'RUN npm run build needs dependencies installed first.';
  if (at('workdir') > Math.min(...['manifest', 'source'].map(at)))
    return 'Set WORKDIR before copying files, or they land in the wrong directory.';
  return null;
}

/** Index of the first layer whose cache is invalidated by the edit; every later layer rebuilds too. */
export function firstInvalidated(order: readonly string[], edit: Edit): number {
  const i = order.findIndex((id) => INSTRUCTIONS[id]?.affectedBy.includes(edit));
  return i === -1 ? order.length : i;
}

export function rebuildSeconds(order: readonly string[], edit: Edit): number {
  return order
    .slice(firstInvalidated(order, edit))
    .reduce((sum, id) => sum + (INSTRUCTIONS[id]?.seconds ?? 0), 0);
}

export interface DockerState {
  order: readonly string[];
  edit: Edit;
  /** Layers processed in the current rebuild. */
  built: number;
  elapsed: number;
}
export type DockerAction =
  { type: 'move'; id: string; by: -1 | 1 } | { type: 'set-edit'; edit: Edit };

const fresh = (order: readonly string[], edit: Edit): DockerState => ({
  order,
  edit,
  built: 0,
  elapsed: 0,
});

export const dockerEngine: SimulatorEngine<DockerState, DockerAction> = {
  init: () => fresh(NAIVE_ORDER, 'source'),
  step: (s) => {
    if (s.built >= s.order.length || validate(s.order) !== null) return s;
    const rebuilt = s.built >= firstInvalidated(s.order, s.edit);
    const id = s.order[s.built] ?? '';
    return {
      ...s,
      built: s.built + 1,
      elapsed: s.elapsed + (rebuilt ? (INSTRUCTIONS[id]?.seconds ?? 0) : 0),
    };
  },
  isDone: (s) => s.built >= s.order.length || validate(s.order) !== null,
  apply: (s, a) => {
    if (a.type === 'set-edit') return fresh(s.order, a.edit);
    const i = s.order.indexOf(a.id);
    const j = i + a.by;
    if (i === -1 || j < 0 || j >= s.order.length) return s;
    const order = [...s.order];
    const other = order[j];
    if (other === undefined) return s;
    order[j] = a.id;
    order[i] = other;
    return fresh(order, s.edit);
  },
  describe: (s) => {
    const err = validate(s.order);
    if (err) return `This Dockerfile cannot build: ${err}`;
    const first = firstInvalidated(s.order, s.edit);
    const head = `After a ${s.edit} edit, layers from step ${String(first + 1)} on must rebuild.`;
    if (s.built === 0)
      return `${head} Total rebuild: ${String(rebuildSeconds(s.order, s.edit))} s.`;
    const id = s.order[s.built - 1] ?? '';
    const cached = s.built - 1 < first;
    return `${head} Step ${String(s.built)} ${INSTRUCTIONS[id]?.text ?? ''}: ${cached ? 'cached' : 'rebuilt'}. Elapsed ${String(s.elapsed)} s.`;
  },
};
