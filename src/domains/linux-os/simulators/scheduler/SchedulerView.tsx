import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { averageResponse, averageWaiting, isFinished, schedulerEngine } from './engine';
import type { SchedulerAction, SchedulerState } from './engine';
import styles from './SchedulerView.module.css';

const W = 640;
const SCALE = W / 20;
const COLORS = ['var(--color-accent)', 'var(--color-success)', 'var(--color-warning)'];

export function SchedulerView({
  state,
  dispatch,
}: SimulatorViewProps<SchedulerState, SchedulerAction>) {
  const id = useId();
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <label htmlFor={id}>
          Time quantum: <strong>{state.quantum} ms</strong>
        </label>
        <input
          id={id}
          type="range"
          min={1}
          max={10}
          value={state.quantum}
          onChange={(e) => dispatch({ type: 'set-quantum', quantum: Number(e.target.value) })}
          aria-valuetext={`${String(state.quantum)} milliseconds (changing it restarts the run)`}
        />
      </div>
      <SvgStage
        viewBox={[0, 0, W, 90]}
        title="CPU timeline"
        description={schedulerEngine.describe(state)}
      >
        {state.timeline.map((t, i) => {
          const pi = state.procs.findIndex((p) => p.pid === t.pid);
          return (
            <g key={`${String(i)}-${String(t.start)}`}>
              <rect
                x={t.start * SCALE}
                y={20}
                width={(t.end - t.start) * SCALE}
                height={36}
                fill={COLORS[pi] ?? 'gray'}
                rx={3}
              />
              <text
                x={(t.start + (t.end - t.start) / 2) * SCALE}
                y={43}
                textAnchor="middle"
                fontSize={11}
                fill="var(--color-accent-contrast)"
              >
                {state.procs[pi]?.name ?? ''}
              </text>
            </g>
          );
        })}
        {Array.from({ length: 21 }, (_, i) => (
          <text
            key={i}
            x={i * SCALE}
            y={74}
            textAnchor="middle"
            fontSize={9}
            fill="var(--color-text-muted)"
          >
            {i % 2 === 0 ? String(i) : ''}
          </text>
        ))}
        <line
          x1={state.time * SCALE}
          y1={12}
          x2={state.time * SCALE}
          y2={62}
          stroke="var(--color-text)"
          strokeWidth={1.5}
        />
      </SvgStage>
      <table className={styles.table}>
        <caption className="visually-hidden">Processes</caption>
        <thead>
          <tr>
            <th scope="col">PID</th>
            <th scope="col">Name</th>
            <th scope="col">Burst</th>
            <th scope="col">Remaining</th>
            <th scope="col">State</th>
          </tr>
        </thead>
        <tbody>
          {state.procs.map((p, i) => (
            <tr key={p.pid}>
              <td>{p.pid}</td>
              <td>
                <span
                  className={styles.swatch}
                  style={{ background: COLORS[i] }}
                  aria-hidden="true"
                />{' '}
                {p.name}
              </td>
              <td>{p.burst}</td>
              <td>{p.remaining}</td>
              <td>
                {p.remaining === 0 ? 'terminated' : p.pid === state.current ? 'running' : 'ready'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.stats}>
        Context switches: <strong>{state.contextSwitches}</strong> · Avg response:{' '}
        <strong>{averageResponse(state).toFixed(1)} ms</strong>
        {isFinished(state) && (
          <>
            {' '}
            · Avg waiting: <strong>{averageWaiting(state).toFixed(1)} ms</strong>
          </>
        )}
      </p>
    </div>
  );
}
