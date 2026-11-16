import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { binarySearchEngine } from './engine';
import type { BinarySearchAction, BinarySearchState } from './engine';
import styles from './BinarySearchView.module.css';

export function BinarySearchView({
  state,
  dispatch,
}: SimulatorViewProps<BinarySearchState, BinarySearchAction>) {
  const last = state.guesses[state.guesses.length - 1];
  return (
    <div className={styles.wrap}>
      <p className={styles.target}>
        Target: <strong>{state.target}</strong> · Guesses: <strong>{state.guesses.length}</strong>
        {state.found && <span className={styles.found}> · found</span>}
      </p>
      <div
        className={styles.cells}
        role="group"
        aria-label="Sorted list; choose a position to inspect"
      >
        {state.items.map((v, i) => {
          const inRange = i >= state.lo && i <= state.hi && !state.found;
          const guessed = state.guesses.find((g) => g.index === i);
          return (
            <button
              key={i}
              type="button"
              className={cx(
                styles.cell,
                inRange && styles.inRange,
                guessed && styles.guessed,
                state.found && last?.index === i && styles.hit,
              )}
              onClick={() => dispatch({ type: 'guess', index: i })}
              disabled={state.found || !inRange}
              aria-label={`Position ${String(i + 1)}${guessed ? `, value ${String(v)}, ${guessed.result}` : ''}`}
            >
              <span className={styles.idx}>{i + 1}</span>
              <span className={styles.val}>{guessed || state.found ? v : '?'}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.hint}>{binarySearchEngine.describe(state)}</p>
    </div>
  );
}
