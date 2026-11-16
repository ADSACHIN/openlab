import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { cx } from '@utils/cx';
import { MAX_INPUT, dfaEngine, transition } from './engine';
import type { DfaAction, DfaSimState, DfaState } from './engine';
import styles from './DfaView.module.css';

const STATES: readonly DfaState[] = [0, 1, 2];
const CX = [90, 300, 510] as const;

export function DfaView({ state, dispatch }: SimulatorViewProps<DfaSimState, DfaAction>) {
  const id = useId();
  const done = state.pos >= state.input.length;
  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className={styles.field}>
        Binary input
        <input
          id={id}
          value={state.input}
          inputMode="numeric"
          maxLength={MAX_INPUT}
          onChange={(e) => dispatch({ type: 'set-input', input: e.target.value })}
          aria-describedby={`${id}-help`}
        />
        <span id={`${id}-help`} className={styles.help}>
          Only 0 and 1. Value: {state.input === '' ? 0 : parseInt(state.input, 2)}
        </span>
      </label>
      <p className={styles.tape} aria-hidden="true">
        {Array.from({ length: state.input.length }, (_, i) => state.input.charAt(i)).map(
          (ch, i) => (
            <span
              key={i}
              className={cx(
                styles.cell,
                i < state.pos && styles.read,
                i === state.pos && styles.next,
              )}
            >
              {ch}
            </span>
          ),
        )}
      </p>
      <SvgStage
        viewBox={[0, 0, 600, 130]}
        title="Divisible-by-3 automaton"
        description={dfaEngine.describe(state)}
      >
        <line x1={20} y1={65} x2={48} y2={65} stroke="var(--color-text-muted)" strokeWidth={2} />
        <polygon points="48,60 58,65 48,70" fill="var(--color-text-muted)" />
        {STATES.map((r) => {
          const here = state.state === r;
          const fill = here
            ? done
              ? r === 0
                ? 'var(--color-success)'
                : 'var(--color-danger)'
              : 'var(--color-accent)'
            : 'var(--color-surface)';
          return (
            <g key={r}>
              <circle
                cx={CX[r]}
                cy={65}
                r={30}
                fill={fill}
                stroke="var(--color-text)"
                strokeWidth={2}
              />
              {r === 0 && (
                <circle
                  cx={CX[r]}
                  cy={65}
                  r={24}
                  fill="none"
                  stroke={here ? 'var(--color-accent-contrast)' : 'var(--color-text)'}
                  strokeWidth={1.5}
                />
              )}
              <text
                x={CX[r]}
                y={71}
                textAnchor="middle"
                fontSize={18}
                fontWeight={700}
                fill={here ? 'var(--color-accent-contrast)' : 'var(--color-text)'}
              >
                r{r}
              </text>
              <text
                x={CX[r]}
                y={118}
                textAnchor="middle"
                fontSize={11}
                fill="var(--color-text-muted)"
              >
                remainder {r}
                {r === 0 ? ' (accept)' : ''}
              </text>
            </g>
          );
        })}
      </SvgStage>
      <table className={styles.table}>
        <caption>Transitions: next = (2 × state + bit) mod 3</caption>
        <thead>
          <tr>
            <th scope="col">State</th>
            <th scope="col">read 0</th>
            <th scope="col">read 1</th>
          </tr>
        </thead>
        <tbody>
          {STATES.map((r) => (
            <tr key={r}>
              <th scope="row">r{r}</th>
              {([0, 1] as const).map((bit) => (
                <td
                  key={bit}
                  className={cx(state.last?.from === r && state.last.bit === bit && styles.used)}
                >
                  r{transition(r, bit)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {done && (
        <p className={cx(styles.verdict, state.state === 0 ? styles.accept : styles.reject)}>
          {state.state === 0
            ? 'Accepted: divisible by 3.'
            : `Rejected: remainder ${String(state.state)}.`}
        </p>
      )}
    </div>
  );
}
