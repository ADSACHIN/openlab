import type { SimulatorEngine } from '@core/model';
import { nextRandom } from '@utils/random';

export const PROMPT = 'The cat sat on the';
export const CANDIDATES: readonly { token: string; logit: number }[] = [
  { token: 'mat', logit: 3.0 },
  { token: 'floor', logit: 2.2 },
  { token: 'sofa', logit: 1.8 },
  { token: 'roof', logit: 1.0 },
  { token: 'keyboard', logit: 0.6 },
  { token: 'moon', logit: -0.5 },
];
export const TEMPERATURES: readonly number[] = [0.1, 0.5, 1, 1.5, 2];
export const SAMPLES = 50;
export const SEED = 9;

/** softmax(logits / T), computed stably. */
export function softmax(logits: readonly number[], temperature: number): number[] {
  const scaled = logits.map((l) => l / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - max));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
}

export const probabilities = (t: number): number[] =>
  softmax(
    CANDIDATES.map((c) => c.logit),
    t,
  );

export interface SamplingState {
  temperature: number;
  rng: number;
  counts: readonly number[];
  recent: readonly string[];
}
export interface SamplingAction {
  type: 'set-temperature';
  temperature: number;
}

const init = (temperature: number): SamplingState => ({
  temperature,
  rng: SEED,
  counts: CANDIDATES.map(() => 0),
  recent: [],
});
export const drawn = (s: SamplingState): number => s.counts.reduce((a, b) => a + b, 0);

export const samplingEngine: SimulatorEngine<SamplingState, SamplingAction> = {
  init: () => init(1),
  step: (s) => {
    if (drawn(s) >= SAMPLES) return s;
    const r = nextRandom(s.rng);
    const probs = probabilities(s.temperature);
    let u = r.value;
    let pick = probs.length - 1;
    for (let i = 0; i < probs.length; i++) {
      u -= probs[i] ?? 0;
      if (u < 0) {
        pick = i;
        break;
      }
    }
    const counts = s.counts.map((c, i) => (i === pick ? c + 1 : c));
    return {
      ...s,
      rng: r.state,
      counts,
      recent: [...s.recent, CANDIDATES[pick]?.token ?? ''].slice(-8),
    };
  },
  isDone: (s) => drawn(s) >= SAMPLES,
  apply: (s, a) => (TEMPERATURES.includes(a.temperature) ? init(a.temperature) : s),
  describe: (s) => {
    const p = probabilities(s.temperature);
    const top = `At temperature ${String(s.temperature)}, "mat" has probability ${((p[0] ?? 0) * 100).toFixed(1)}%.`;
    if (drawn(s) === 0) return `${top} Press Step to sample the next word.`;
    return `${top} Sample ${String(drawn(s))}: "${s.recent[s.recent.length - 1] ?? ''}". ${String(new Set(s.recent).size)} different words in the last ${String(s.recent.length)}.`;
  },
};
