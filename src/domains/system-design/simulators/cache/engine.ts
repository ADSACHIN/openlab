import type { SimulatorEngine } from '@core/model';
import { mulberry32 } from '@utils/random';

export const KEYS = 20;
export const REQUESTS = 200;
export const HIT_MS = 1;
export const MISS_MS = 50;
export const SEED = 5;

/** Zipf (s = 1) popularity: key k is requested in proportion to 1/k. */
export function zipfWeights(n: number): number[] {
  const raw = Array.from({ length: n }, (_, i) => 1 / (i + 1));
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => w / total);
}

export function requestStream(seed: number, n = REQUESTS): number[] {
  const weights = zipfWeights(KEYS);
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, () => {
    let u = rnd();
    for (let k = 0; k < weights.length; k++) {
      u -= weights[k] ?? 0;
      if (u < 0) return k + 1;
    }
    return KEYS;
  });
}

export function averageLatency(hits: number, misses: number): number {
  const n = hits + misses;
  return n === 0 ? 0 : (hits * HIT_MS + misses * MISS_MS) / n;
}

export interface CacheState {
  size: number;
  stream: readonly number[];
  index: number;
  /** Most recently used last. */
  cache: readonly number[];
  hits: number;
  misses: number;
  lastHit: boolean | null;
}
export interface CacheAction {
  type: 'set-size';
  size: number;
}

export function access(s: CacheState): CacheState {
  const key = s.stream[s.index];
  if (key === undefined) return s;
  const hit = s.cache.includes(key);
  let cache = s.cache.filter((k) => k !== key);
  if (s.size > 0) {
    cache = [...cache, key];
    if (cache.length > s.size) cache = cache.slice(cache.length - s.size);
  }
  return {
    ...s,
    index: s.index + 1,
    cache,
    hits: s.hits + (hit ? 1 : 0),
    misses: s.misses + (hit ? 0 : 1),
    lastHit: hit,
  };
}

export function initCache(size: number, seed = SEED): CacheState {
  return {
    size,
    stream: requestStream(seed),
    index: 0,
    cache: [],
    hits: 0,
    misses: 0,
    lastHit: null,
  };
}

/** Hit ratio after the whole stream for a given cache size. */
export function hitRatioFor(size: number, seed = SEED): number {
  let s = initCache(size, seed);
  while (s.index < s.stream.length) s = access(s);
  return s.hits / s.stream.length;
}

export const cacheEngine: SimulatorEngine<CacheState, CacheAction> = {
  init: () => initCache(4),
  step: access,
  isDone: (s) => s.index >= s.stream.length,
  apply: (s, a) =>
    Number.isInteger(a.size) && a.size >= 0 && a.size <= KEYS ? initCache(a.size) : s,
  describe: (s) => {
    const n = s.hits + s.misses;
    const ratio = n === 0 ? 0 : (100 * s.hits) / n;
    const key = s.stream[s.index - 1];
    const head =
      key === undefined
        ? 'No requests yet.'
        : `Request for product ${String(key)}: ${s.lastHit ? 'hit' : 'miss'}.`;
    return `${head} ${String(s.hits)} hits, ${String(s.misses)} misses (${ratio.toFixed(0)}% hit ratio), average ${averageLatency(s.hits, s.misses).toFixed(1)} ms, cache size ${String(s.size)}.`;
  },
};
