import type { SimulatorEngine } from '@core/model';

export interface Commit {
  id: string;
  parents: readonly string[];
  message: string;
  /** Lane for drawing: the branch the commit was made on. */
  lane: number;
}
export interface GitState {
  commits: readonly Commit[];
  branches: Readonly<Record<string, string>>;
  /** Lane index per branch, in creation order. */
  lanes: Readonly<Record<string, number>>;
  head: string;
  counter: number;
  script: number;
  event: string;
}
export type GitAction =
  | { type: 'commit' }
  | { type: 'branch'; name: string }
  | { type: 'checkout'; name: string }
  | { type: 'merge'; name: string };

export const BRANCH_NAME = /^[a-z][a-z0-9-]{0,19}$/;

const commitById = (s: GitState, id: string) => s.commits.find((c) => c.id === id);

/** Every commit reachable from `id` by following parents, including itself. */
export function history(s: GitState, id: string | undefined): Set<string> {
  const seen = new Set<string>();
  const stack = id === undefined ? [] : [id];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === undefined || seen.has(cur)) continue;
    seen.add(cur);
    for (const p of commitById(s, cur)?.parents ?? []) stack.push(p);
  }
  return seen;
}

export const isAncestor = (s: GitState, a: string, b: string): boolean => history(s, b).has(a);

function commit(s: GitState, message: string, parents: readonly string[]): GitState {
  const id = `c${String(s.counter)}`;
  return {
    ...s,
    commits: [...s.commits, { id, parents, message, lane: s.lanes[s.head] ?? 0 }],
    branches: { ...s.branches, [s.head]: id },
    counter: s.counter + 1,
  };
}

export function applyGit(s: GitState, a: GitAction): GitState {
  const tip = s.branches[s.head];
  switch (a.type) {
    case 'commit': {
      const next = commit(s, `work on ${s.head}`, tip === undefined ? [] : [tip]);
      return { ...next, event: `Committed c${String(s.counter)} on ${s.head}.` };
    }
    case 'branch': {
      if (!BRANCH_NAME.test(a.name))
        return {
          ...s,
          event: `"${a.name}" is not a valid branch name here (lowercase letters, digits, dashes).`,
        };
      if (a.name in s.branches) return { ...s, event: `A branch named ${a.name} already exists.` };
      if (tip === undefined) return s;
      const lane = Object.keys(s.lanes).length;
      return {
        ...s,
        branches: { ...s.branches, [a.name]: tip },
        lanes: { ...s.lanes, [a.name]: lane },
        event: `Created ${a.name} pointing at ${tip}. HEAD is still on ${s.head}.`,
      };
    }
    case 'checkout':
      if (!(a.name in s.branches)) return { ...s, event: `No branch named ${a.name}.` };
      return { ...s, head: a.name, event: `Switched to ${a.name}.` };
    case 'merge': {
      const other = s.branches[a.name];
      if (other === undefined || tip === undefined)
        return { ...s, event: `No branch named ${a.name}.` };
      if (a.name === s.head) return { ...s, event: 'Cannot merge a branch into itself.' };
      if (isAncestor(s, other, tip))
        return { ...s, event: `Already up to date: ${a.name} has nothing ${s.head} lacks.` };
      if (isAncestor(s, tip, other))
        return {
          ...s,
          branches: { ...s.branches, [s.head]: other },
          event: `Fast-forward: ${s.head} moved to ${other}. No merge commit needed.`,
        };
      const next = commit(s, `merge ${a.name} into ${s.head}`, [tip, other]);
      return {
        ...next,
        event: `Merge commit c${String(s.counter)} joins ${s.head} and ${a.name}.`,
      };
    }
  }
}

/** What Play does: a typical feature-branch workflow. */
export const SCRIPT: readonly GitAction[] = [
  { type: 'branch', name: 'feature' },
  { type: 'checkout', name: 'feature' },
  { type: 'commit' },
  { type: 'commit' },
  { type: 'checkout', name: 'main' },
  { type: 'commit' },
  { type: 'merge', name: 'feature' },
];

export function initGit(): GitState {
  return {
    commits: [
      { id: 'c1', parents: [], message: 'initial commit', lane: 0 },
      { id: 'c2', parents: ['c1'], message: 'add README', lane: 0 },
    ],
    branches: { main: 'c2' },
    lanes: { main: 0 },
    head: 'main',
    counter: 3,
    script: 0,
    event: 'A repository with two commits on main.',
  };
}

export const gitEngine: SimulatorEngine<GitState, GitAction> = {
  init: initGit,
  step: (s) => {
    const a = SCRIPT[s.script];
    return a ? { ...applyGit(s, a), script: s.script + 1 } : s;
  },
  isDone: (s) => s.script >= SCRIPT.length,
  apply: applyGit,
  describe: (s) =>
    `${s.event} HEAD → ${s.head} at ${s.branches[s.head] ?? 'nothing'}. ${String(s.commits.length)} commits.`,
};
