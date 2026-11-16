import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { SvgStage } from '@components/viz/SvgStage';
import { jobsOf, pipelineEngine } from './engine';
import type { JobStatus, PipelineAction, PipelineState } from './engine';
import styles from './PipelineView.module.css';

const COLORS: Record<JobStatus, string> = {
  waiting: 'var(--color-border)',
  running: 'var(--color-accent)',
  passed: 'var(--color-success)',
  failed: 'var(--color-danger)',
  skipped: 'var(--color-surface)',
};
const UNIT = 52;
const ROW = 30;

export function PipelineView({
  state,
  dispatch,
}: SimulatorViewProps<PipelineState, PipelineAction>) {
  const id = useId();
  const jobs = jobsOf(state);
  return (
    <div className={styles.wrap}>
      <div className={styles.toggles}>
        <span>
          <input
            id={`${id}-p`}
            type="checkbox"
            checked={state.parallel}
            onChange={(e) => dispatch({ type: 'set-parallel', parallel: e.target.checked })}
          />
          <label htmlFor={`${id}-p`}>
            Run lint and unit tests in parallel, split E2E into two shards
          </label>
        </span>
        <span>
          <input
            id={`${id}-b`}
            type="checkbox"
            checked={state.bug}
            onChange={(e) => dispatch({ type: 'set-bug', bug: e.target.checked })}
          />
          <label htmlFor={`${id}-b`}>The code has a bug (a unit test fails)</label>
        </span>
      </div>
      <SvgStage
        viewBox={[0, 0, 130 + 12 * UNIT, jobs.length * (ROW + 8) + 30]}
        title="Pipeline timeline"
        description={pipelineEngine.describe(state)}
      >
        {Array.from({ length: 12 }, (_, t) => (
          <g key={t}>
            <line
              x1={130 + t * UNIT}
              y1={0}
              x2={130 + t * UNIT}
              y2={jobs.length * (ROW + 8)}
              stroke="var(--color-border)"
            />
            <text
              x={130 + t * UNIT}
              y={jobs.length * (ROW + 8) + 16}
              fontSize={10}
              textAnchor="middle"
              fill="var(--color-text-muted)"
            >
              {t}
            </text>
          </g>
        ))}
        <line
          x1={130 + state.time * UNIT}
          y1={0}
          x2={130 + state.time * UNIT}
          y2={jobs.length * (ROW + 8)}
          stroke="var(--color-text)"
          strokeWidth={2}
        />
        {jobs.map((j, i) => {
          const st = state.status[j.id] ?? 'waiting';
          const fin = state.finished[j.id];
          const prog = state.progress[j.id] ?? 0;
          const start =
            fin !== undefined ? fin - j.duration : st === 'running' ? state.time - prog : null;
          const y = i * (ROW + 8) + 4;
          return (
            <g key={j.id}>
              <text x={0} y={y + ROW / 2 + 4} fontSize={12} fill="var(--color-text)">
                {j.label}
              </text>
              {start !== null && (
                <rect
                  x={130 + start * UNIT}
                  y={y}
                  width={(fin !== undefined ? j.duration : prog) * UNIT}
                  height={ROW}
                  rx={5}
                  fill={COLORS[st]}
                />
              )}
              <text
                x={start !== null ? 136 + start * UNIT : 136}
                y={y + ROW / 2 + 4}
                fontSize={11}
                fill={
                  st === 'waiting' || st === 'skipped'
                    ? 'var(--color-text-muted)'
                    : 'var(--color-accent-contrast)'
                }
              >
                {st}
              </text>
            </g>
          );
        })}
      </SvgStage>
    </div>
  );
}
