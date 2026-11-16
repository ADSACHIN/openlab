import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { pagingEngine } from './engine';
import type { PagingAction, PagingState } from './engine';
import styles from './PagingView.module.css';

const W = 640;

export function PagingView({ state, dispatch }: SimulatorViewProps<PagingState, PagingAction>) {
  const id = useId();
  const cell = W / state.refs.length;
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <fieldset className={styles.fieldset}>
          <legend>Replacement policy</legend>
          {(['fifo', 'lru'] as const).map((p) => (
            <label key={p}>
              <input
                type="radio"
                name={`${id}-policy`}
                checked={state.policy === p}
                onChange={() => dispatch({ type: 'set-policy', policy: p })}
              />{' '}
              {p.toUpperCase()}
            </label>
          ))}
        </fieldset>
        <label>
          Frames: <strong>{state.frames.length}</strong>
          <input
            type="range"
            min={1}
            max={6}
            value={state.frames.length}
            onChange={(e) => dispatch({ type: 'set-frames', count: Number(e.target.value) })}
            aria-valuetext={`${String(state.frames.length)} frames (changing it restarts)`}
          />
        </label>
      </div>
      <SvgStage
        viewBox={[0, 0, W, 60 + state.frames.length * 26]}
        title="Page references and frames"
        description={pagingEngine.describe(state)}
      >
        {state.refs.map((r, i) => (
          <g key={i}>
            <rect
              x={i * cell}
              y={0}
              width={cell}
              height={22}
              fill={
                i === state.index - 1
                  ? 'var(--color-accent)'
                  : i < state.index
                    ? 'var(--color-accent-soft)'
                    : 'var(--color-surface)'
              }
              stroke="var(--color-border)"
            />
            <text
              x={i * cell + cell / 2}
              y={15}
              textAnchor="middle"
              fontSize={11}
              fill={i === state.index - 1 ? 'var(--color-accent-contrast)' : 'var(--color-text)'}
            >
              {r}
            </text>
          </g>
        ))}
        {state.frames.map((f, fi) => (
          <g key={fi}>
            <text x={0} y={52 + fi * 26} fontSize={11} fill="var(--color-text-muted)">
              frame {fi}
            </text>
            <rect
              x={60}
              y={38 + fi * 26}
              width={W - 60}
              height={22}
              fill="var(--color-surface)"
              stroke="var(--color-border)"
              rx={4}
            />
            <text
              x={70}
              y={53 + fi * 26}
              fontSize={12}
              fontFamily="var(--font-mono)"
              fill="var(--color-text)"
            >
              {f === null ? '(empty)' : `page ${String(f)}`}
            </text>
          </g>
        ))}
      </SvgStage>
      <p className={styles.stats}>
        Faults: <strong>{state.faults}</strong> / {state.index} references · {state.lastEvent}
      </p>
    </div>
  );
}
