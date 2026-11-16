import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { ACCOUNTS, WORDLIST, storedHash } from './engine';
import type { CrackerAction, CrackerState } from './engine';
import styles from './CrackerView.module.css';

export function CrackerView({ state, dispatch }: SimulatorViewProps<CrackerState, CrackerAction>) {
  const id = useId();
  return (
    <div className={styles.wrap}>
      <div className={styles.toggle}>
        <input
          id={id}
          type="checkbox"
          checked={state.salted}
          onChange={(e) => dispatch({ type: 'set-salted', salted: e.target.checked })}
        />
        <label htmlFor={id}>Store a per-user salt with each hash (restarts the attack)</label>
      </div>
      <table className={styles.table}>
        <caption>Leaked user table</caption>
        <thead>
          <tr>
            <th scope="col">User</th>
            {state.salted && <th scope="col">Salt</th>}
            <th scope="col">Stored SHA-256 (first 16 hex)</th>
            <th scope="col">Cracked</th>
          </tr>
        </thead>
        <tbody>
          {ACCOUNTS.map((a) => {
            const cracked = state.cracked[a.name];
            return (
              <tr key={a.name} className={cx(cracked !== undefined && styles.cracked)}>
                <td>{a.name}</td>
                {state.salted && <td>{a.salt}</td>}
                <td>
                  <code>{storedHash(a, state.salted).slice(0, 16)}…</code>
                </td>
                <td>{cracked ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={styles.wordlist}>
        Wordlist:{' '}
        {WORDLIST.map((w, i) => (
          <span
            key={w}
            className={cx(
              styles.word,
              i < state.index && styles.tried,
              i === state.index - 1 && styles.current,
            )}
          >
            {w}
          </span>
        ))}
      </p>
      <p className={styles.stats}>
        Hash computations: <strong>{state.hashes}</strong> · Cracked:{' '}
        <strong>{Object.keys(state.cracked).length}</strong> of {ACCOUNTS.length}
      </p>
    </div>
  );
}
