import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { HIT_MS, KEYS, MISS_MS, averageLatency, cacheEngine, zipfWeights } from './engine';
import type { CacheAction, CacheState } from './engine';
import styles from './CacheView.module.css';

const W = 640;
const H = 150;
const BAR = W / KEYS;
const weights = zipfWeights(KEYS);
const maxW = weights[0] ?? 1;

export function CacheView({ state, dispatch }: SimulatorViewProps<CacheState, CacheAction>) {
  const id = useId();
  const current = state.stream[state.index - 1];
  const n = state.hits + state.misses;
  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label htmlFor={id}>
          Cache size: <strong>{state.size}</strong> of {KEYS} products
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={KEYS}
          value={state.size}
          onChange={(e) => dispatch({ type: 'set-size', size: Number(e.target.value) })}
        />
      </div>
      <SvgStage
        viewBox={[0, 0, W, H]}
        title="Product popularity and cache contents"
        description={cacheEngine.describe(state)}
      >
        {weights.map((w, i) => {
          const key = i + 1;
          const h = (w / maxW) * (H - 40);
          const cached = state.cache.includes(key);
          const isCurrent = key === current;
          return (
            <g key={key}>
              <rect
                x={i * BAR + 3}
                y={H - 22 - h}
                width={BAR - 6}
                height={h}
                rx={3}
                fill={cached ? 'var(--color-success)' : 'var(--color-border-strong)'}
                stroke={
                  isCurrent
                    ? state.lastHit
                      ? 'var(--color-success)'
                      : 'var(--color-danger)'
                    : 'none'
                }
                strokeWidth={3}
              />
              <text
                x={i * BAR + BAR / 2}
                y={H - 8}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-text-muted)"
              >
                {key}
              </text>
            </g>
          );
        })}
      </SvgStage>
      <p className={styles.legend}>
        Bar height is how often a product is requested (Zipf). Green bars are in the cache right
        now.
      </p>
      <dl className={styles.stats}>
        <div>
          <dt>Requests</dt>
          <dd>{n} / 200</dd>
        </div>
        <div>
          <dt>Hit ratio</dt>
          <dd>{n === 0 ? '—' : `${((100 * state.hits) / n).toFixed(1)}%`}</dd>
        </div>
        <div>
          <dt>Avg latency</dt>
          <dd>{averageLatency(state.hits, state.misses).toFixed(1)} ms</dd>
        </div>
        <div>
          <dt>Costs</dt>
          <dd>
            hit {HIT_MS} ms · miss {MISS_MS} ms
          </dd>
        </div>
      </dl>
    </div>
  );
}
