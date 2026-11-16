import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { QUEUE_CAP, averageLatency, capacity, lbEngine } from './engine';
import type { Algorithm, LbAction, LbState } from './engine';
import styles from './LoadBalancerView.module.css';

const ALGOS: readonly { id: Algorithm; label: string }[] = [
  { id: 'round-robin', label: 'Round robin' },
  { id: 'least-connections', label: 'Least connections' },
  { id: 'random', label: 'Random' },
];
const ROW = 34;
const SLOT = 44;

export function LoadBalancerView({ state, dispatch }: SimulatorViewProps<LbState, LbAction>) {
  const id = useId();
  const cap = capacity(state.servers.map((s) => s.speed));
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <fieldset className={styles.fieldset}>
          <legend>Algorithm</legend>
          {ALGOS.map((a) => (
            <label key={a.id}>
              <input
                type="radio"
                name={`${id}-alg`}
                checked={state.algorithm === a.id}
                onChange={() => dispatch({ type: 'set-algorithm', algorithm: a.id })}
              />{' '}
              {a.label}
            </label>
          ))}
        </fieldset>
        <div className={styles.field}>
          <label htmlFor={`${id}-rate`}>
            Requests per tick: <strong>{state.rate}</strong>
          </label>
          <input
            id={`${id}-rate`}
            type="range"
            min={1}
            max={6}
            value={state.rate}
            onChange={(e) => dispatch({ type: 'set-rate', rate: Number(e.target.value) })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-n`}>Servers</label>
          <select
            id={`${id}-n`}
            value={state.servers.length}
            onChange={(e) => dispatch({ type: 'set-servers', count: Number(e.target.value) })}
          >
            {[3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
      <SvgStage
        viewBox={[0, 0, 640, state.servers.length * (ROW + 8) + 10]}
        title="Server queues"
        description={lbEngine.describe(state)}
      >
        {state.servers.map((sv, i) => {
          const y = 6 + i * (ROW + 8);
          const full = sv.queue.length >= QUEUE_CAP;
          return (
            <g key={i}>
              <text x={0} y={y + ROW / 2 + 5} fontSize={13} fill="var(--color-text)">
                Server {i + 1}
              </text>
              <text
                x={0}
                y={y + ROW / 2 + 19}
                fontSize={10}
                fill={sv.speed === 1 ? 'var(--color-warning)' : 'var(--color-text-muted)'}
              >
                speed {sv.speed}
                {sv.speed === 1 ? ' (slow)' : ''}
              </text>
              {Array.from({ length: QUEUE_CAP }, (_, k) => (
                <rect
                  key={k}
                  x={110 + k * (SLOT + 6)}
                  y={y}
                  width={SLOT}
                  height={ROW}
                  rx={5}
                  fill="var(--color-surface)"
                  stroke="var(--color-border)"
                />
              ))}
              {sv.queue.map((rq, k) => (
                <g key={rq.id}>
                  <rect
                    x={110 + k * (SLOT + 6)}
                    y={y}
                    width={SLOT}
                    height={ROW}
                    rx={5}
                    fill={
                      full
                        ? 'var(--color-danger)'
                        : k === 0
                          ? 'var(--color-accent)'
                          : 'var(--color-accent-soft)'
                    }
                  />
                  <text
                    x={110 + k * (SLOT + 6) + SLOT / 2}
                    y={y + ROW / 2 + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fill={full || k === 0 ? 'var(--color-accent-contrast)' : 'var(--color-text)'}
                  >
                    {rq.remaining}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </SvgStage>
      <dl className={styles.stats}>
        <div>
          <dt>Tick</dt>
          <dd>{state.tick} / 40</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd>{state.completed}</dd>
        </div>
        <div>
          <dt>Dropped</dt>
          <dd className={state.dropped > 0 ? styles.bad : undefined}>{state.dropped}</dd>
        </div>
        <div>
          <dt>Avg latency</dt>
          <dd>{averageLatency(state).toFixed(2)} ticks</dd>
        </div>
        <div>
          <dt>Pool capacity</dt>
          <dd>{cap} req/tick</dd>
        </div>
      </dl>
      <p className={styles.legend}>
        Each box is a waiting request; the number is the work left. A queue holds at most{' '}
        {QUEUE_CAP}; further requests are dropped.
      </p>
    </div>
  );
}
