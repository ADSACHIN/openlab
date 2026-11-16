import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { buildQuery } from './engine';
import type { SqliAction, SqliState } from './engine';
import styles from './SqliView.module.css';

export function SqliView({ state, dispatch }: SimulatorViewProps<SqliState, SqliAction>) {
  const id = useId();
  const r = state.result;
  return (
    <div className={styles.wrap}>
      <fieldset className={styles.modes}>
        <legend>How the server builds the query</legend>
        <label>
          <input
            type="radio"
            name={`${id}-mode`}
            checked={state.mode === 'concatenated'}
            onChange={() => dispatch({ type: 'set-mode', mode: 'concatenated' })}
          />{' '}
          String concatenation (vulnerable)
        </label>
        <label>
          <input
            type="radio"
            name={`${id}-mode`}
            checked={state.mode === 'parameterized'}
            onChange={() => dispatch({ type: 'set-mode', mode: 'parameterized' })}
          />{' '}
          Parameterized query (safe)
        </label>
      </fieldset>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: 'submit' });
        }}
      >
        <div className={styles.field}>
          <label htmlFor={`${id}-u`}>Username</label>
          <input
            id={`${id}-u`}
            value={state.username}
            onChange={(e) => dispatch({ type: 'set-username', value: e.target.value })}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-p`}>Password (shown in clear for the exercise)</label>
          <input
            id={`${id}-p`}
            value={state.password}
            onChange={(e) => dispatch({ type: 'set-password', value: e.target.value })}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button type="submit" className={styles.submit}>
          Log in
        </button>
      </form>
      <div>
        <p className={styles.heading}>What the database receives</p>
        {state.mode === 'concatenated' ? (
          <pre className={styles.query}>{buildQuery(state.username, state.password)}</pre>
        ) : (
          <pre className={styles.query}>
            {'SELECT * FROM users WHERE name = ? AND password = ?\n'}
            {`-- parameters: [${JSON.stringify(state.username)}, ${JSON.stringify(state.password)}]`}
          </pre>
        )}
      </div>
      {r && (
        <p
          className={cx(
            styles.result,
            r.kind === 'ok' ? styles.ok : r.kind === 'error' ? styles.error : styles.denied,
          )}
        >
          {r.kind === 'ok' && (
            <>
              Logged in as <strong>{r.user}</strong> (the query matched {r.rows} row
              {r.rows === 1 ? '' : 's'}).
            </>
          )}
          {r.kind === 'denied' && 'Access denied.'}
          {r.kind === 'error' && `Database error: ${r.message}`}
        </p>
      )}
    </div>
  );
}
