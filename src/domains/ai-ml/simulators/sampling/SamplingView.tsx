import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import {
  CANDIDATES,
  PROMPT,
  SAMPLES,
  TEMPERATURES,
  drawn,
  probabilities,
  samplingEngine,
} from './engine';
import type { SamplingAction, SamplingState } from './engine';
import styles from './SamplingView.module.css';

const W = 600;
const ROW = 30;

export function SamplingView({
  state,
  dispatch,
}: SimulatorViewProps<SamplingState, SamplingAction>) {
  const id = useId();
  const probs = probabilities(state.temperature);
  const n = drawn(state);
  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label htmlFor={id}>Temperature</label>
        <select
          id={id}
          value={state.temperature}
          onChange={(e) =>
            dispatch({ type: 'set-temperature', temperature: Number(e.target.value) })
          }
        >
          {TEMPERATURES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <p className={styles.prompt}>
        {PROMPT}{' '}
        <strong className={styles.next}>{state.recent[state.recent.length - 1] ?? '…'}</strong>
      </p>
      <SvgStage
        viewBox={[0, 0, W, CANDIDATES.length * (ROW + 6)]}
        title="Next-word probabilities"
        description={samplingEngine.describe(state)}
      >
        {CANDIDATES.map((c, i) => {
          const p = probs[i] ?? 0;
          const count = state.counts[i] ?? 0;
          const y = i * (ROW + 6);
          return (
            <g key={c.token}>
              <text x={0} y={y + ROW / 2 + 5} fontSize={13} fill="var(--color-text)">
                {c.token}
              </text>
              <rect
                x={90}
                y={y}
                width={(W - 220) * p}
                height={ROW}
                rx={4}
                fill="var(--color-accent)"
              />
              {n > 0 && (
                <rect
                  x={90}
                  y={y + ROW - 6}
                  width={(W - 220) * (count / n)}
                  height={6}
                  fill="var(--color-warning)"
                />
              )}
              <text x={W - 120} y={y + ROW / 2 + 5} fontSize={12} fill="var(--color-text-muted)">
                {(p * 100).toFixed(1)}% · drawn {count}
              </text>
            </g>
          );
        })}
      </SvgStage>
      <p className={styles.legend}>
        Blue: probability after temperature. Amber strip: share of the {n} of {SAMPLES} samples
        drawn so far.
      </p>
    </div>
  );
}
