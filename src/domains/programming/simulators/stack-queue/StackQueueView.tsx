import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { stackQueueEngine } from './engine';
import type { StackQueueAction, StackQueueState } from './engine';
import styles from './StackQueueView.module.css';

const W = 640;
const H = 170;
const BOX = 40;

export function StackQueueView({
  state,
  dispatch,
}: SimulatorViewProps<StackQueueState, StackQueueAction>) {
  return (
    <div className={styles.wrap}>
      <SvgStage
        viewBox={[0, 0, W, H]}
        title="Stack and queue"
        description={stackQueueEngine.describe(state)}
      >
        <text x={20} y={20} fontSize={13} fontWeight={600} fill="var(--color-text)">
          Stack (LIFO) — top is on the right
        </text>
        <line
          x1={20}
          y1={30}
          x2={20}
          y2={30 + BOX}
          stroke="var(--color-border-strong)"
          strokeWidth={3}
        />
        {state.stack.map((v, i) => (
          <g key={`s-${String(i)}`}>
            <rect
              x={24 + i * (BOX + 4)}
              y={30}
              width={BOX}
              height={BOX}
              rx={6}
              fill={
                i === state.stack.length - 1 ? 'var(--color-accent)' : 'var(--color-accent-soft)'
              }
              stroke="var(--color-border-strong)"
            />
            <text
              x={24 + i * (BOX + 4) + BOX / 2}
              y={30 + BOX / 2 + 5}
              textAnchor="middle"
              fontSize={14}
              fill={
                i === state.stack.length - 1 ? 'var(--color-accent-contrast)' : 'var(--color-text)'
              }
            >
              {v}
            </text>
          </g>
        ))}
        <text x={20} y={100} fontSize={13} fontWeight={600} fill="var(--color-text)">
          Queue (FIFO) — front is on the left
        </text>
        {state.queue.map((v, i) => (
          <g key={`q-${String(i)}`}>
            <rect
              x={24 + i * (BOX + 4)}
              y={110}
              width={BOX}
              height={BOX}
              rx={6}
              fill={i === 0 ? 'var(--color-success)' : 'var(--color-accent-soft)'}
              stroke="var(--color-border-strong)"
            />
            <text
              x={24 + i * (BOX + 4) + BOX / 2}
              y={110 + BOX / 2 + 5}
              textAnchor="middle"
              fontSize={14}
              fill={i === 0 ? 'var(--color-accent-contrast)' : 'var(--color-text)'}
            >
              {v}
            </text>
          </g>
        ))}
        {state.queue.length > 0 && (
          <text
            x={24 + state.queue.length * (BOX + 4) + 6}
            y={135}
            fontSize={11}
            fill="var(--color-text-muted)"
          >
            ← back
          </text>
        )}
      </SvgStage>
      <div className={styles.actions} role="group" aria-label="Operations">
        <button type="button" onClick={() => dispatch({ type: 'push' })}>
          push
        </button>
        <button type="button" onClick={() => dispatch({ type: 'pop' })}>
          pop
        </button>
        <span className={styles.sep} aria-hidden="true" />
        <button type="button" onClick={() => dispatch({ type: 'enqueue' })}>
          enqueue
        </button>
        <button type="button" onClick={() => dispatch({ type: 'dequeue' })}>
          dequeue
        </button>
      </div>
      <p className={styles.event}>{state.lastEvent}</p>
    </div>
  );
}
