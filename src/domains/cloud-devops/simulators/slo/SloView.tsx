import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { INCIDENTS, PERIOD_DAYS, TARGETS, budgetMinutes, formatMinutes, sloEngine } from './engine';
import type { SloAction, SloState } from './engine';
import styles from './SloView.module.css';

const W = 640;
const DAY = (W - 20) / PERIOD_DAYS;

export function SloView({ state, dispatch }: SimulatorViewProps<SloState, SloAction>) {
  const id = useId();
  const budget = budgetMinutes(state.target);
  const leftRatio = Math.max(0, 1 - state.used / budget);
  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label htmlFor={id}>Availability target</label>
        <select
          id={id}
          value={state.target}
          onChange={(e) => dispatch({ type: 'set-target', target: Number(e.target.value) })}
        >
          {TARGETS.map((t) => (
            <option key={t} value={t}>
              {t}%
            </option>
          ))}
        </select>
        <span className={styles.budget}>
          Budget: <strong>{formatMinutes(budget)}</strong> per {PERIOD_DAYS} days
        </span>
      </div>
      <SvgStage
        viewBox={[0, 0, W, 110]}
        title="Error budget over the month"
        description={sloEngine.describe(state)}
      >
        <rect x={10} y={10} width={W - 20} height={22} rx={6} fill="var(--color-border)" />
        <rect
          x={10}
          y={10}
          width={(W - 20) * leftRatio}
          height={22}
          rx={6}
          fill={
            leftRatio > 0.25
              ? 'var(--color-success)'
              : leftRatio > 0
                ? 'var(--color-warning)'
                : 'var(--color-danger)'
          }
        />
        <text x={W / 2} y={26} textAnchor="middle" fontSize={11} fill="var(--color-text)">
          {leftRatio > 0 ? `${(leftRatio * 100).toFixed(0)}% of budget left` : 'budget exhausted'}
        </text>
        {Array.from({ length: PERIOD_DAYS }, (_, d) => (
          <rect
            key={d}
            x={10 + d * DAY + 1}
            y={50}
            width={DAY - 2}
            height={20}
            rx={2}
            fill={d < state.day ? 'var(--color-accent-soft)' : 'var(--color-surface)'}
            stroke="var(--color-border)"
          />
        ))}
        {INCIDENTS.map((inc) => (
          <g key={inc.day}>
            <rect
              x={10 + (inc.day - 1) * DAY + 1}
              y={50}
              width={DAY - 2}
              height={20}
              rx={2}
              fill={inc.day <= state.day ? 'var(--color-danger)' : 'none'}
              stroke="var(--color-danger)"
            />
            <text
              x={10 + (inc.day - 0.5) * DAY}
              y={88}
              textAnchor="middle"
              fontSize={10}
              fill="var(--color-text-muted)"
            >
              {inc.minutes}m
            </text>
          </g>
        ))}
        <text x={10} y={104} fontSize={10} fill="var(--color-text-muted)">
          day 1
        </text>
        <text x={W - 10} y={104} textAnchor="end" fontSize={10} fill="var(--color-text-muted)">
          day {PERIOD_DAYS}
        </text>
      </SvgStage>
      <table className={styles.table}>
        <caption>Allowed downtime by target</caption>
        <thead>
          <tr>
            <th scope="col">Target</th>
            <th scope="col">Per 30 days</th>
            <th scope="col">Per year</th>
          </tr>
        </thead>
        <tbody>
          {TARGETS.map((t) => (
            <tr key={t} className={t === state.target ? styles.current : undefined}>
              <td>{t}%</td>
              <td>{formatMinutes(budgetMinutes(t))}</td>
              <td>{formatMinutes(budgetMinutes(t, 365))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
