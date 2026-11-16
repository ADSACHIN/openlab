/**
 * Seeded pseudo-random numbers (mulberry32) so every simulation is reproducible.
 * `nextRandom` is the pure form for engines that keep RNG state inside their own
 * state; `mulberry32` wraps it in a closure for one-off generation.
 */
export function nextRandom(state: number): { value: number; state: number } {
  const a = (state + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: a };
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    const r = nextRandom(state);
    state = r.state;
    return r.value;
  };
}

export function shuffled<T>(items: readonly T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}
