import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { cx } from '@utils/cx';
import { N, REPLICAS, quorumEngine, readsLatest } from './engine';
import type { QuorumAction, QuorumState } from './engine';
import styles from './QuorumView.module.css';

const RANGE = Array.from({ length: N }, (_, i) => i + 1);

export function QuorumView({ state, dispatch }: SimulatorViewProps<QuorumState, QuorumAction>) {
  const id = useId();
  const reading = state.phase === 'read' || state.phase === 'read-again';
  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        {(['w', 'r'] as const).map((k) => (
          <span key={k} className={styles.field}>
            <label htmlFor={`${id}-${k}`}>
              {k === 'w' ? 'W (write acknowledgements)' : 'R (replicas read)'}
            </label>
            <select
              id={`${id}-${k}`}
              value={state[k]}
              onChange={(e) =>
                dispatch(
                  k === 'w'
                    ? { type: 'set-w', w: Number(e.target.value) }
                    : { type: 'set-r', r: Number(e.target.value) },
                )
              }
            >
              {RANGE.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </span>
        ))}
      </div>
      <SvgStage
        viewBox={[0, 0, 600, 150]}
        title="Three replicas"
        description={quorumEngine.describe(state)}
      >
        {REPLICAS.map((name, i) => {
          const v = state.versions[i] ?? 1;
          const contacted = state.contacted.includes(i);
          return (
            <g key={name}>
              <rect
                x={40 + i * 190}
                y={30}
                width={140}
                height={80}
                rx={10}
                fill={v === 2 ? 'var(--color-success)' : 'var(--color-surface)'}
                stroke={contacted ? 'var(--color-accent)' : 'var(--color-border-strong)'}
                strokeWidth={contacted ? 4 : 1.5}
              />
              <text
                x={110 + i * 190}
                y={62}
                textAnchor="middle"
                fontSize={16}
                fontWeight={700}
                fill={v === 2 ? 'var(--color-accent-contrast)' : 'var(--color-text)'}
              >
                Replica {name}
              </text>
              <text
                x={110 + i * 190}
                y={88}
                textAnchor="middle"
                fontSize={14}
                fill={v === 2 ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)'}
              >
                version {v}
              </text>
              {contacted && (
                <text
                  x={110 + i * 190}
                  y={135}
                  textAnchor="middle"
                  fontSize={12}
                  fill="var(--color-accent)"
                >
                  read
                </text>
              )}
            </g>
          );
        })}
      </SvgStage>
      {reading && (
        <p className={cx(styles.result, state.readResult === 2 ? styles.fresh : styles.stale)}>
          {state.readResult === 2
            ? 'Read returned version 2: the latest write.'
            : 'Read returned version 1: stale.'}
        </p>
      )}
      <table className={styles.grid}>
        <caption>Worst-case read for every setting (N = {N})</caption>
        <thead>
          <tr>
            <th scope="col">W \ R</th>
            {RANGE.map((r) => (
              <th key={r} scope="col">
                R={r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RANGE.map((w) => (
            <tr key={w}>
              <th scope="row">W={w}</th>
              {RANGE.map((r) => (
                <td
                  key={r}
                  className={cx(
                    readsLatest(w, r) ? styles.fresh : styles.stale,
                    w === state.w && r === state.r && styles.current,
                  )}
                >
                  {readsLatest(w, r) ? 'latest' : 'stale'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
