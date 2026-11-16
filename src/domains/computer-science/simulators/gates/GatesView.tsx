import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { cx } from '@utils/cx';
import { GATES, evaluate, gatesEngine } from './engine';
import type { GatesAction, GatesState } from './engine';
import styles from './GatesView.module.css';

const on = 'var(--color-success)';
const off = 'var(--color-border-strong)';

export function GatesView({ state, dispatch }: SimulatorViewProps<GatesState, GatesAction>) {
  const id = useId();
  const unary = state.gate === 'NOT';
  const out = evaluate(state.gate, state.a, state.b);
  return (
    <div className={styles.wrap}>
      <fieldset className={styles.gates}>
        <legend>Gate</legend>
        {GATES.map((g) => (
          <label key={g}>
            <input
              type="radio"
              name={`${id}-gate`}
              checked={state.gate === g}
              onChange={() => dispatch({ type: 'set-gate', gate: g })}
            />{' '}
            {g}
          </label>
        ))}
      </fieldset>
      <div className={styles.circuit}>
        <div className={styles.inputs} role="group" aria-label="Inputs">
          <button
            type="button"
            aria-pressed={state.a}
            className={cx(styles.input, state.a && styles.inputOn)}
            onClick={() => dispatch({ type: 'toggle', input: 'a' })}
          >
            A = {state.a ? 1 : 0}
          </button>
          {!unary && (
            <button
              type="button"
              aria-pressed={state.b}
              className={cx(styles.input, state.b && styles.inputOn)}
              onClick={() => dispatch({ type: 'toggle', input: 'b' })}
            >
              B = {state.b ? 1 : 0}
            </button>
          )}
        </div>
        <SvgStage
          viewBox={[0, 0, 320, 120]}
          title={`${state.gate} gate`}
          description={gatesEngine.describe(state)}
        >
          <line
            x1={0}
            y1={unary ? 60 : 40}
            x2={110}
            y2={unary ? 60 : 40}
            stroke={state.a ? on : off}
            strokeWidth={4}
          />
          {!unary && (
            <line x1={0} y1={80} x2={110} y2={80} stroke={state.b ? on : off} strokeWidth={4} />
          )}
          <rect
            x={110}
            y={20}
            width={100}
            height={80}
            rx={14}
            fill="var(--color-surface)"
            stroke="var(--color-text)"
            strokeWidth={2}
          />
          <text
            x={160}
            y={66}
            textAnchor="middle"
            fontSize={20}
            fontWeight={700}
            fill="var(--color-text)"
          >
            {state.gate}
          </text>
          <line x1={210} y1={60} x2={280} y2={60} stroke={out ? on : off} strokeWidth={4} />
          <circle
            cx={296}
            cy={60}
            r={14}
            fill={out ? on : 'var(--color-surface)'}
            stroke="var(--color-text)"
            strokeWidth={2}
          />
        </SvgStage>
        <p className={styles.output}>
          Output: <strong>{out ? 1 : 0}</strong>
        </p>
      </div>
      <table className={styles.table}>
        <caption>Truth table for {state.gate}</caption>
        <thead>
          <tr>
            <th scope="col">A</th>
            {!unary && <th scope="col">B</th>}
            <th scope="col">Out</th>
          </tr>
        </thead>
        <tbody>
          {(unary
            ? [
                [false, false],
                [true, false],
              ]
            : [
                [false, false],
                [false, true],
                [true, false],
                [true, true],
              ]
          ).map(([a = false, b = false]) => (
            <tr
              key={`${String(a)}${String(b)}`}
              className={cx(a === state.a && (unary || b === state.b) && styles.current)}
            >
              <td>{a ? 1 : 0}</td>
              {!unary && <td>{b ? 1 : 0}</td>}
              <td>{evaluate(state.gate, a, b) ? 1 : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
