/** Small DAG utilities for prerequisite graphs. Pure. */

export class CycleError extends Error {
  constructor(readonly cycle: readonly string[]) {
    super(`Prerequisite cycle: ${cycle.join(' → ')}`);
    this.name = 'CycleError';
  }
}

/**
 * Kahn-free DFS topological order that also reports the first cycle found.
 * `edges(n)` returns the nodes `n` depends on; those come first in the result.
 * Ties are broken by input order so output is stable.
 */
export function topologicalOrder(
  nodes: readonly string[],
  edges: (node: string) => readonly string[],
): string[] {
  const order: string[] = [];
  const state = new Map<string, 'visiting' | 'done'>();
  const stack: string[] = [];

  const visit = (n: string): void => {
    const s = state.get(n);
    if (s === 'done') return;
    if (s === 'visiting') {
      const start = stack.indexOf(n);
      throw new CycleError([...stack.slice(start), n]);
    }
    state.set(n, 'visiting');
    stack.push(n);
    for (const dep of edges(n)) visit(dep);
    stack.pop();
    state.set(n, 'done');
    order.push(n);
  };

  for (const n of nodes) visit(n);
  return order;
}
