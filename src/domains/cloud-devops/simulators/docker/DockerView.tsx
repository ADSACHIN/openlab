import { ArrowDown, ArrowUp } from 'lucide-react';
import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { INSTRUCTIONS, firstInvalidated, rebuildSeconds, validate } from './engine';
import type { DockerAction, DockerState } from './engine';
import styles from './DockerView.module.css';

export function DockerView({ state, dispatch }: SimulatorViewProps<DockerState, DockerAction>) {
  const id = useId();
  const error = validate(state.order);
  const first = firstInvalidated(state.order, state.edit);
  return (
    <div className={styles.wrap}>
      <fieldset className={styles.edit}>
        <legend>What did you just change?</legend>
        <label>
          <input
            type="radio"
            name={`${id}-edit`}
            checked={state.edit === 'source'}
            onChange={() => dispatch({ type: 'set-edit', edit: 'source' })}
          />{' '}
          Application source code
        </label>
        <label>
          <input
            type="radio"
            name={`${id}-edit`}
            checked={state.edit === 'dependencies'}
            onChange={() => dispatch({ type: 'set-edit', edit: 'dependencies' })}
          />{' '}
          package.json (dependencies)
        </label>
      </fieldset>
      <ol className={styles.file} aria-label="Dockerfile">
        {state.order.map((key, i) => {
          const ins = INSTRUCTIONS[key];
          if (!ins) return null;
          const processed = i < state.built;
          const rebuilt = i >= first;
          return (
            <li
              key={key}
              className={cx(styles.line, processed && (rebuilt ? styles.rebuilt : styles.cached))}
            >
              <code className={styles.code}>{ins.text}</code>
              <span className={styles.status}>
                {processed
                  ? rebuilt
                    ? `rebuilt · ${String(ins.seconds)} s`
                    : 'cached'
                  : rebuilt
                    ? `will rebuild (${String(ins.seconds)} s)`
                    : 'cache hit'}
              </span>
              <span className={styles.move}>
                <button
                  type="button"
                  aria-label={`Move "${ins.text}" up`}
                  disabled={i === 0}
                  onClick={() => dispatch({ type: 'move', id: key, by: -1 })}
                >
                  <ArrowUp size={14} aria-hidden="true" focusable="false" />
                </button>
                <button
                  type="button"
                  aria-label={`Move "${ins.text}" down`}
                  disabled={i === state.order.length - 1}
                  onClick={() => dispatch({ type: 'move', id: key, by: 1 })}
                >
                  <ArrowDown size={14} aria-hidden="true" focusable="false" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p className={styles.total}>
          Rebuild after this edit: <strong>{rebuildSeconds(state.order, state.edit)} s</strong> ·
          elapsed so far {state.elapsed} s
        </p>
      )}
    </div>
  );
}
