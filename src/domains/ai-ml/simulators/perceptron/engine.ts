import type { SimulatorEngine } from '@core/model';
import { mulberry32 } from '@utils/random';

export type Dataset = 'separable' | 'xor';
export interface Point {
  x: number;
  y: number;
  label: 1 | -1;
}

export const N_POINTS = 20;
export const MAX_EPOCHS = 25;
export const LEARNING_RATE = 0.5;

/** Points on either side of y = 0.5x + 0.2, at least 0.15 away from it. */
function separable(seed: number): Point[] {
  const rnd = mulberry32(seed);
  const pts: Point[] = [];
  while (pts.length < N_POINTS) {
    const x = rnd() * 2 - 1;
    const y = rnd() * 2 - 1;
    const d = (y - 0.5 * x - 0.2) / Math.hypot(0.5, 1);
    if (Math.abs(d) < 0.15) continue;
    pts.push({ x, y, label: d > 0 ? 1 : -1 });
  }
  return pts;
}

/** Four clusters at the corners: same-sign corners are +1, opposite-sign corners are −1. */
function xor(seed: number): Point[] {
  const rnd = mulberry32(seed);
  const corners: [number, number][] = [
    [0.55, 0.55],
    [-0.55, -0.55],
    [0.55, -0.55],
    [-0.55, 0.55],
  ];
  return Array.from({ length: N_POINTS }, (_, i) => {
    const [cx, cy] = corners[i % 4] ?? [0, 0];
    const x = cx + (rnd() - 0.5) * 0.3;
    const y = cy + (rnd() - 0.5) * 0.3;
    return { x, y, label: cx * cy > 0 ? 1 : -1 };
  });
}

export const makePoints = (d: Dataset, seed = 3): Point[] =>
  d === 'xor' ? xor(seed) : separable(seed);

export interface PerceptronState {
  dataset: Dataset;
  points: readonly Point[];
  /** [w_x, w_y, bias] */
  w: readonly [number, number, number];
  index: number;
  epoch: number;
  updates: number;
  mistakesThisEpoch: number;
  converged: boolean;
}
export interface PerceptronAction {
  type: 'set-dataset';
  dataset: Dataset;
}

export const predict = (
  w: readonly [number, number, number],
  p: { x: number; y: number },
): 1 | -1 => (w[0] * p.x + w[1] * p.y + w[2] >= 0 ? 1 : -1);

export function accuracy(points: readonly Point[], w: readonly [number, number, number]): number {
  return points.filter((p) => predict(w, p) === p.label).length / points.length;
}

function init(dataset: Dataset): PerceptronState {
  return {
    dataset,
    points: makePoints(dataset),
    w: [0, 0, 0],
    index: 0,
    epoch: 0,
    updates: 0,
    mistakesThisEpoch: 0,
    converged: false,
  };
}

export function stepPerceptron(s: PerceptronState): PerceptronState {
  if (s.converged || s.epoch >= MAX_EPOCHS) return s;
  const p = s.points[s.index];
  if (!p) return s;
  let w = s.w;
  let { updates, mistakesThisEpoch } = s;
  if (predict(w, p) !== p.label) {
    // Perceptron rule: nudge the line towards classifying this point correctly.
    w = [
      w[0] + LEARNING_RATE * p.label * p.x,
      w[1] + LEARNING_RATE * p.label * p.y,
      w[2] + LEARNING_RATE * p.label,
    ];
    updates++;
    mistakesThisEpoch++;
  }
  const index = s.index + 1;
  if (index < s.points.length) return { ...s, w, index, updates, mistakesThisEpoch };
  const converged = mistakesThisEpoch === 0;
  return { ...s, w, index: 0, epoch: s.epoch + 1, updates, mistakesThisEpoch: 0, converged };
}

export const perceptronEngine: SimulatorEngine<PerceptronState, PerceptronAction> = {
  init: () => init('separable'),
  step: stepPerceptron,
  isDone: (s) => s.converged || s.epoch >= MAX_EPOCHS,
  apply: (_s, a) => init(a.dataset),
  describe: (s) => {
    const acc = Math.round(accuracy(s.points, s.w) * 100);
    if (s.converged)
      return `Converged after ${String(s.epoch)} epochs and ${String(s.updates)} updates: every point is on the correct side.`;
    if (s.epoch >= MAX_EPOCHS)
      return `Stopped after ${String(MAX_EPOCHS)} epochs without converging. Accuracy ${String(acc)}%: no straight line separates these points.`;
    return `Epoch ${String(s.epoch + 1)}, point ${String(s.index + 1)} of ${String(s.points.length)}. ${String(s.updates)} updates so far, accuracy ${String(acc)}%.`;
  },
};
