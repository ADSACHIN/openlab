import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { RATES, TARGET, gradientEngine, loss, steps } from './engine';
import type { GradientAction, GradientState } from './engine';
import styles from './GradientView.module.css';

const W = 600;
const H = 220;
const XR = 5;
const YR = 1.6;
const sx = (x: number) => W / 2 + (Math.max(-XR * 1.2, Math.min(XR * 1.2, x)) / XR) * (W / 2 - 10);
const sy = (y: number) => H / 2 - (Math.max(-YR * 1.2, Math.min(YR * 1.2, y)) / YR) * (H / 2 - 10);
const LEVELS = [0.25, 1, 4, 9, 16, 26];

export function GradientView({
  state,
  dispatch,
}: SimulatorViewProps<GradientState, GradientAction>) {
  const id = useId();
  const pts = state.path.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
  const last = state.path[state.path.length - 1];
  const l = loss(state);
  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label htmlFor={id}>Learning rate</label>
        <select
          id={id}
          value={state.lr}
          onChange={(e) => dispatch({ type: 'set-lr', lr: Number(e.target.value) })}
        >
          {RATES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <SvgStage
        viewBox={[0, 0, W, H]}
        title="Loss surface x² + 10y² and the descent path"
        description={gradientEngine.describe(state)}
      >
        <rect x={0} y={0} width={W} height={H} fill="var(--color-surface)" />
        {LEVELS.map((c) => (
          <ellipse
            key={c}
            cx={sx(0)}
            cy={sy(0)}
            rx={sx(Math.sqrt(c)) - sx(0)}
            ry={sy(0) - sy(Math.sqrt(c / 10))}
            fill="none"
            stroke="var(--color-border-strong)"
          />
        ))}
        <circle cx={sx(0)} cy={sy(0)} r={4} fill="var(--color-success)" />
        <polyline points={pts} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
        {last && <circle cx={sx(last[0])} cy={sy(last[1])} r={6} fill="var(--color-accent)" />}
      </SvgStage>
      <dl className={styles.stats}>
        <div>
          <dt>Step</dt>
          <dd>{steps(state)}</dd>
        </div>
        <div>
          <dt>Loss</dt>
          <dd className={l < TARGET ? styles.good : l > 26 ? styles.bad : undefined}>
            {l < 1e-3 ? l.toExponential(1) : l > 1e6 ? 'diverged' : l.toFixed(3)}
          </dd>
        </div>
        <div>
          <dt>Position</dt>
          <dd>{last ? `(${last[0].toFixed(2)}, ${last[1].toFixed(2)})` : ''}</dd>
        </div>
      </dl>
    </div>
  );
}
