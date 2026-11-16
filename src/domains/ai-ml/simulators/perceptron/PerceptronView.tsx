import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { accuracy, perceptronEngine, predict } from './engine';
import type { Dataset, PerceptronAction, PerceptronState } from './engine';
import styles from './PerceptronView.module.css';

const S = 300;
const px = (v: number) => ((v + 1) / 2) * S;
const py = (v: number) => S - ((v + 1) / 2) * S;

function boundary(w: readonly [number, number, number]): [number, number, number, number] | null {
  const [a, b, c] = w;
  if (Math.abs(b) > 1e-9) return [px(-1), py((-c + a) / b), px(1), py((-c - a) / b)];
  if (Math.abs(a) > 1e-9) return [px(-c / a), py(-1), px(-c / a), py(1)];
  return null;
}

export function PerceptronView({
  state,
  dispatch,
}: SimulatorViewProps<PerceptronState, PerceptronAction>) {
  const id = useId();
  const line = boundary(state.w);
  return (
    <div className={styles.wrap}>
      <fieldset className={styles.data}>
        <legend>Training data</legend>
        {(['separable', 'xor'] as Dataset[]).map((d) => (
          <label key={d}>
            <input
              type="radio"
              name={`${id}-d`}
              checked={state.dataset === d}
              onChange={() => dispatch({ type: 'set-dataset', dataset: d })}
            />{' '}
            {d === 'xor' ? 'XOR corners' : 'Separable'}
          </label>
        ))}
      </fieldset>
      <div className={styles.body}>
        <SvgStage
          viewBox={[0, 0, S, S]}
          title="Training points and decision line"
          description={perceptronEngine.describe(state)}
          maxHeight={320}
        >
          <rect
            x={0}
            y={0}
            width={S}
            height={S}
            fill="var(--color-surface)"
            stroke="var(--color-border)"
          />
          <defs>
            <clipPath id={`${id}-clip`}>
              <rect x={0} y={0} width={S} height={S} />
            </clipPath>
          </defs>
          {line && (
            <line
              x1={line[0]}
              y1={line[1]}
              x2={line[2]}
              y2={line[3]}
              stroke="var(--color-text)"
              strokeWidth={2.5}
              clipPath={`url(#${id}-clip)`}
            />
          )}
          {state.points.map((p, i) => {
            const wrong = predict(state.w, p) !== p.label;
            const current = i === state.index;
            const stroke = wrong ? 'var(--color-danger)' : 'none';
            return p.label === 1 ? (
              <circle
                key={i}
                cx={px(p.x)}
                cy={py(p.y)}
                r={current ? 9 : 7}
                fill="var(--color-accent)"
                stroke={stroke}
                strokeWidth={3}
              />
            ) : (
              <rect
                key={i}
                x={px(p.x) - 7}
                y={py(p.y) - 7}
                width={14}
                height={14}
                fill="var(--color-warning)"
                stroke={stroke}
                strokeWidth={3}
              />
            );
          })}
        </SvgStage>
        <div className={styles.side}>
          <dl className={styles.stats}>
            <div>
              <dt>Epoch</dt>
              <dd>{state.epoch}</dd>
            </div>
            <div>
              <dt>Updates</dt>
              <dd>{state.updates}</dd>
            </div>
            <div>
              <dt>Accuracy</dt>
              <dd>{Math.round(accuracy(state.points, state.w) * 100)}%</dd>
            </div>
            <div>
              <dt>Weights (x, y, bias)</dt>
              <dd>{state.w.map((v) => v.toFixed(2)).join(', ')}</dd>
            </div>
          </dl>
          {/* Kept outside the <dl>: a definition list may only contain dt/dd groups (axe: definition-list). */}
          <p className={styles.legend}>
            Circles are +1, squares −1. A red outline means the point is on the wrong side of the
            line.
          </p>
        </div>
      </div>
    </div>
  );
}
