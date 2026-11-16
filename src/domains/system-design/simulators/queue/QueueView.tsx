import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { ARRIVAL_TICKS, BURST_TICKS, PER_CONSUMER, isQueueDone, queueEngine } from './engine';
import type { QueueAction, QueueState } from './engine';
import styles from './QueueView.module.css';

const W = 640;
const H = 170;
const X_TICKS = 80;
const Y_MAX = 60;

export function QueueView({ state, dispatch }: SimulatorViewProps<QueueState, QueueAction>) {
  const id = useId();
  const x = (t: number) => 30 + (t / X_TICKS) * (W - 40);
  const y = (v: number) => H - 20 - (Math.min(v, Y_MAX) / Y_MAX) * (H - 30);
  const points = state.history.map((v, t) => `${x(t + 1).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const L = state.tick === 0 ? 0 : state.areaUnderQueue / state.tick;
  const lambda = state.tick === 0 ? 0 : state.arrived / state.tick;
  const Wt = state.processed === 0 ? 0 : state.totalTimeInSystem / state.processed;
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor={`${id}-rate`}>
            Messages arriving per tick: <strong>{state.rate}</strong>
          </label>
          <input
            id={`${id}-rate`}
            type="range"
            min={1}
            max={8}
            value={state.rate}
            onChange={(e) => dispatch({ type: 'set-rate', rate: Number(e.target.value) })}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-c`}>
            Consumers: <strong>{state.consumers}</strong> (each handles {PER_CONSUMER} per tick)
          </label>
          <input
            id={`${id}-c`}
            type="range"
            min={1}
            max={6}
            value={state.consumers}
            onChange={(e) => dispatch({ type: 'set-consumers', consumers: Number(e.target.value) })}
          />
        </div>
      </div>
      <SvgStage
        viewBox={[0, 0, W, H]}
        title="Queue length over time"
        description={queueEngine.describe(state)}
      >
        <rect
          x={x(BURST_TICKS[0] ?? 0)}
          y={10}
          width={x((BURST_TICKS[BURST_TICKS.length - 1] ?? 0) + 1) - x(BURST_TICKS[0] ?? 0)}
          height={H - 30}
          fill="var(--color-accent-soft)"
        />
        <text x={x(BURST_TICKS[0] ?? 0) + 2} y={22} fontSize={10} fill="var(--color-text-muted)">
          burst
        </text>
        <line
          x1={x(ARRIVAL_TICKS)}
          y1={10}
          x2={x(ARRIVAL_TICKS)}
          y2={H - 20}
          stroke="var(--color-border-strong)"
          strokeDasharray="4 4"
        />
        <text x={x(ARRIVAL_TICKS) + 4} y={22} fontSize={10} fill="var(--color-text-muted)">
          arrivals stop
        </text>
        <line x1={30} y1={H - 20} x2={W - 10} y2={H - 20} stroke="var(--color-border-strong)" />
        <line x1={30} y1={10} x2={30} y2={H - 20} stroke="var(--color-border-strong)" />
        {[0, 20, 40, 60].map((v) => (
          <text
            key={v}
            x={24}
            y={y(v) + 4}
            textAnchor="end"
            fontSize={10}
            fill="var(--color-text-muted)"
          >
            {v}
          </text>
        ))}
        {points && (
          <polyline points={points} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
        )}
      </SvgStage>
      <dl className={styles.stats}>
        <div>
          <dt>Waiting now</dt>
          <dd>{state.queue.length}</dd>
        </div>
        <div>
          <dt>Peak</dt>
          <dd>{state.peak}</dd>
        </div>
        <div>
          <dt>L (avg in system)</dt>
          <dd>{L.toFixed(2)}</dd>
        </div>
        <div>
          <dt>
            λ × W{' '}
            {isQueueDone(state) && state.queue.length === 0
              ? '(drained: equal to L)'
              : '(equal to L once drained)'}
          </dt>
          <dd>
            {lambda.toFixed(2)} × {Wt.toFixed(2)} = {(lambda * Wt).toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
