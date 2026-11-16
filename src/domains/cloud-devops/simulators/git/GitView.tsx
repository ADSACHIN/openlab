import { useId, useState } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { BRANCH_NAME, gitEngine } from './engine';
import type { GitAction, GitState } from './engine';
import styles from './GitView.module.css';

const DX = 72;
const DY = 52;

export function GitView({ state, dispatch }: SimulatorViewProps<GitState, GitAction>) {
  const id = useId();
  const [name, setName] = useState('feature');
  const pos = new Map(state.commits.map((c, i) => [c.id, { x: 40 + i * DX, y: 30 + c.lane * DY }]));
  const lanes = Math.max(1, ...Object.values(state.lanes).map((l) => l + 1));
  const width = Math.max(600, 80 + state.commits.length * DX);
  const labels = new Map<string, string[]>();
  for (const [b, c] of Object.entries(state.branches)) labels.set(c, [...(labels.get(c) ?? []), b]);
  const others = Object.keys(state.branches).filter((b) => b !== state.head);
  return (
    <div className={styles.wrap}>
      <SvgStage
        viewBox={[0, 0, width, 40 + lanes * DY]}
        title="Commit graph"
        description={gitEngine.describe(state)}
      >
        {state.commits.flatMap((c) =>
          c.parents.map((p) => {
            const a = pos.get(c.id);
            const b = pos.get(p);
            return a && b ? (
              <line
                key={`${c.id}-${p}`}
                x1={b.x}
                y1={b.y}
                x2={a.x}
                y2={a.y}
                stroke="var(--color-border-strong)"
                strokeWidth={2.5}
              />
            ) : null;
          }),
        )}
        {state.commits.map((c) => {
          const p = pos.get(c.id);
          if (!p) return null;
          const isHead = state.branches[state.head] === c.id;
          return (
            <g key={c.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={14}
                fill={c.parents.length === 2 ? 'var(--color-warning)' : 'var(--color-accent)'}
                stroke={isHead ? 'var(--color-text)' : 'none'}
                strokeWidth={3}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-accent-contrast)"
              >
                {c.id}
              </text>
              {(labels.get(c.id) ?? []).map((b, k) => (
                <text
                  key={b}
                  x={p.x}
                  y={p.y + 30 + k * 13}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={b === state.head ? 700 : 400}
                  fill="var(--color-text)"
                >
                  {b === state.head ? `HEAD → ${b}` : b}
                </text>
              ))}
            </g>
          );
        })}
      </SvgStage>
      <p className={styles.event} aria-hidden="true">
        {state.event}
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={() => dispatch({ type: 'commit' })}>
          Commit on {state.head}
        </button>
        <span className={styles.group}>
          <label htmlFor={`${id}-name`}>New branch</label>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!BRANCH_NAME.test(name)}
            spellCheck={false}
          />
          <button type="button" onClick={() => dispatch({ type: 'branch', name })}>
            Create
          </button>
        </span>
        <span className={styles.group}>
          <label htmlFor={`${id}-co`}>Checkout</label>
          <select
            id={`${id}-co`}
            value={state.head}
            onChange={(e) => dispatch({ type: 'checkout', name: e.target.value })}
          >
            {Object.keys(state.branches).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </span>
        {others.length > 0 && (
          <span className={styles.group}>
            <label htmlFor={`${id}-merge`}>Merge into {state.head}</label>
            <select
              id={`${id}-merge`}
              defaultValue=""
              onChange={(e) => e.target.value && dispatch({ type: 'merge', name: e.target.value })}
            >
              <option value="" disabled>
                choose…
              </option>
              {others.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </span>
        )}
      </div>
    </div>
  );
}
