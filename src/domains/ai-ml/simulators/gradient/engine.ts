import type { SimulatorEngine } from '@core/model';

/** An elongated bowl: ten times steeper along y than along x. Minimum 0 at (0, 0). */
export const f = (x: number, y: number): number => x * x + 10 * y * y;
export const grad = (x: number, y: number): [number, number] => [2 * x, 20 * y];

export const START: readonly [number, number] = [4, 1];
export const RATES: readonly number[] = [0.01, 0.02, 0.05, 0.08, 0.09, 0.1, 0.11];
export const MAX_STEPS = 60;
export const TARGET = 0.01;
export const DIVERGED = 1e6;

export interface GradientState {
  lr: number;
  path: readonly (readonly [number, number])[];
}
export interface GradientAction {
  type: 'set-lr';
  lr: number;
}

export const position = (s: GradientState): readonly [number, number] =>
  s.path[s.path.length - 1] ?? START;
export const loss = (s: GradientState): number => {
  const [x, y] = position(s);
  return f(x, y);
};
export const steps = (s: GradientState): number => s.path.length - 1;

/** Converges for every start exactly when both directions shrink: |1 − 2·lr| < 1 and |1 − 20·lr| < 1. */
export const converges = (lr: number): boolean =>
  Math.abs(1 - 2 * lr) < 1 && Math.abs(1 - 20 * lr) < 1;

/** Steps needed to bring f below the target from START, or null within `limit`. */
export function stepsToTarget(lr: number, limit = MAX_STEPS): number | null {
  let [x, y] = START;
  for (let k = 0; k <= limit; k++) {
    if (f(x, y) < TARGET) return k;
    const [gx, gy] = grad(x, y);
    x -= lr * gx;
    y -= lr * gy;
  }
  return null;
}

const init = (lr: number): GradientState => ({ lr, path: [START] });

export const gradientEngine: SimulatorEngine<GradientState, GradientAction> = {
  init: () => init(0.05),
  step: (s) => {
    const [x, y] = position(s);
    const [gx, gy] = grad(x, y);
    return { ...s, path: [...s.path, [x - s.lr * gx, y - s.lr * gy] as const] };
  },
  isDone: (s) => steps(s) >= MAX_STEPS || loss(s) < TARGET * 0.001 || loss(s) > DIVERGED,
  apply: (s, a) => (RATES.includes(a.lr) ? init(a.lr) : s),
  describe: (s) => {
    const [x, y] = position(s);
    const l = loss(s);
    const state = l > DIVERGED ? ' Diverged.' : l < TARGET ? ' Below the target.' : '';
    return `Learning rate ${String(s.lr)}, step ${String(steps(s))}: x = ${x.toFixed(3)}, y = ${y.toFixed(3)}, loss ${l < 1e-3 ? l.toExponential(1) : l.toFixed(3)}.${state}`;
  },
};
