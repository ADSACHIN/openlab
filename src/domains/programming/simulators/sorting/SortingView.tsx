import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { N, current, sortingEngine } from './engine';
import type { Algorithm, InputKind, SortingAction, SortingState } from './engine';
import styles from './SortingView.module.css';

const W = 640;
const H = 160;
const GAP = 6;
const BAR = (W - GAP * (N + 1)) / N;

const ALGOS: readonly { id: Algorithm; label: string }[] = [
  { id: 'bubble', label: 'Bubble' },
  { id: 'insertion', label: 'Insertion' },
  { id: 'selection', label: 'Selection' },
];
const INPUTS: readonly { id: InputKind; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'nearly-sorted', label: 'Nearly sorted' },
  { id: 'reversed', label: 'Reversed' },
];

export function SortingView({ state, dispatch }: SimulatorViewProps<SortingState, SortingAction>) {
  const id = useId();
  const snap = current(state);
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <fieldset className={styles.fieldset}>
          <legend>Algorithm</legend>
          {ALGOS.map((a) => (
            <label key={a.id}>
              <input
                type="radio"
                name={`${id}-algo`}
                checked={state.algorithm === a.id}
                onChange={() => dispatch({ type: 'set-algorithm', algorithm: a.id })}
              />{' '}
              {a.label}
            </label>
          ))}
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend>Input</legend>
          {INPUTS.map((k) => (
            <label key={k.id}>
              <input
                type="radio"
                name={`${id}-input`}
                checked={state.input === k.id}
                onChange={() => dispatch({ type: 'set-input', input: k.id })}
              />{' '}
              {k.label}
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          className={styles.shuffle}
          onClick={() => dispatch({ type: 'reshuffle' })}
        >
          New data
        </button>
      </div>
      <SvgStage
        viewBox={[0, 0, W, H]}
        title="Array being sorted"
        description={sortingEngine.describe(state)}
      >
        {snap.array.map((v, i) => {
          const h = (v / N) * (H - 30);
          const comparing = snap.compare?.includes(i) ?? false;
          const fill = snap.settled.includes(i)
            ? 'var(--color-success)'
            : comparing
              ? snap.swapped
                ? 'var(--color-warning)'
                : 'var(--color-accent)'
              : 'var(--color-border-strong)';
          return (
            <g key={`${String(i)}-${String(v)}`}>
              <rect
                x={GAP + i * (BAR + GAP)}
                y={H - 20 - h}
                width={BAR}
                height={h}
                rx={4}
                fill={fill}
              />
              <text
                x={GAP + i * (BAR + GAP) + BAR / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize={11}
                fill="var(--color-text-muted)"
              >
                {v}
              </text>
            </g>
          );
        })}
      </SvgStage>
      <p className={styles.stats}>
        Comparisons: <strong>{snap.comparisons}</strong> · Swaps: <strong>{snap.swaps}</strong> ·
        Step {state.index} / {state.trace.length - 1}
      </p>
    </div>
  );
}
