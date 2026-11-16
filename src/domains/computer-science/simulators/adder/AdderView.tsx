import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { MAX, WIDTH, adderEngine, resultOf, ripple } from './engine';
import type { AdderAction, AdderState } from './engine';
import styles from './AdderView.module.css';

const BOX = 110;
const W = 600;

export function AdderView({ state, dispatch }: SimulatorViewProps<AdderState, AdderAction>) {
  const id = useId();
  const { sums, carries } = ripple(state.a, state.b);
  const done = state.stage >= WIDTH;
  const result = resultOf(state);
  // Bit 0 is drawn on the right, like written arithmetic.
  const x = (bit: number) => 70 + (WIDTH - 1 - bit) * (BOX + 20);
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        {(['a', 'b'] as const).map((k) => (
          <span key={k} className={styles.field}>
            <label htmlFor={`${id}-${k}`}>{k.toUpperCase()}</label>
            <select
              id={`${id}-${k}`}
              value={state[k]}
              onChange={(e) =>
                dispatch({ type: k === 'a' ? 'set-a' : 'set-b', value: Number(e.target.value) })
              }
            >
              {Array.from({ length: MAX + 1 }, (_, v) => (
                <option key={v} value={v}>
                  {v} ({v.toString(2).padStart(WIDTH, '0')})
                </option>
              ))}
            </select>
          </span>
        ))}
      </div>
      <SvgStage
        viewBox={[0, 0, W, 170]}
        title="4-bit ripple-carry adder"
        description={adderEngine.describe(state)}
      >
        {Array.from({ length: WIDTH }, (_, bit) => {
          const reached = bit < state.stage;
          const active = bit === state.stage - 1;
          return (
            <g key={bit}>
              <text
                x={x(bit) + BOX / 2}
                y={18}
                textAnchor="middle"
                fontSize={12}
                fill="var(--color-text-muted)"
              >
                bit {bit}
              </text>
              <text
                x={x(bit) + BOX / 2}
                y={38}
                textAnchor="middle"
                fontSize={13}
                fontFamily="var(--font-mono)"
                fill="var(--color-text)"
              >
                a={(state.a >> bit) & 1} b={(state.b >> bit) & 1}
              </text>
              <rect
                x={x(bit)}
                y={48}
                width={BOX}
                height={60}
                rx={8}
                fill={active ? 'var(--color-accent-soft)' : 'var(--color-surface)'}
                stroke={reached ? 'var(--color-accent)' : 'var(--color-border-strong)'}
                strokeWidth={active ? 3 : 1.5}
              />
              <text
                x={x(bit) + BOX / 2}
                y={74}
                textAnchor="middle"
                fontSize={12}
                fill="var(--color-text-muted)"
              >
                full adder
              </text>
              <text
                x={x(bit) + BOX / 2}
                y={96}
                textAnchor="middle"
                fontSize={14}
                fontFamily="var(--font-mono)"
                fill="var(--color-text)"
              >
                cin={reached ? String(carries[bit] ?? 0) : '?'}
              </text>
              <text
                x={x(bit) + BOX / 2}
                y={136}
                textAnchor="middle"
                fontSize={22}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={reached ? 'var(--color-text)' : 'var(--color-border-strong)'}
              >
                {reached ? String(sums[bit] ?? 0) : '·'}
              </text>
              {bit < WIDTH - 1 && (
                <text
                  x={x(bit) - 10}
                  y={82}
                  textAnchor="middle"
                  fontSize={11}
                  fill={reached ? 'var(--color-accent)' : 'var(--color-border-strong)'}
                >
                  ←{reached ? String(carries[bit + 1] ?? 0) : ''}
                </text>
              )}
            </g>
          );
        })}
        <text
          x={x(WIDTH - 1) - 34}
          y={136}
          textAnchor="middle"
          fontSize={22}
          fontWeight={700}
          fontFamily="var(--font-mono)"
          fill={done && result.carryOut ? 'var(--color-danger)' : 'var(--color-border-strong)'}
        >
          {done ? String(result.carryOut) : '·'}
        </text>
        <text
          x={x(WIDTH - 1) - 34}
          y={158}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-text-muted)"
        >
          carry out
        </text>
      </SvgStage>
      <p className={styles.summary}>
        {done ? (
          <>
            Result: <strong>{result.value}</strong> ({result.value.toString(2).padStart(WIDTH, '0')}
            ), carry out <strong>{result.carryOut}</strong>
            {result.carryOut
              ? ' — overflow: the true sum ' +
                String(state.a + state.b) +
                ' does not fit in 4 bits.'
              : '.'}
          </>
        ) : (
          `Bits added: ${String(state.stage)} of ${String(WIDTH)}.`
        )}
      </p>
    </div>
  );
}
