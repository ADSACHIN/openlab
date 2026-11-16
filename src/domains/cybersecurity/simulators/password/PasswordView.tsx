import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { GUESSES_PER_SECOND, PASSWORD_EXAMPLES, POOLS, humanDuration, strength } from './engine';
import type { PasswordAction, PasswordState } from './engine';
import styles from './PasswordView.module.css';

const MAX_BITS = 128;

export function PasswordView({
  state,
  dispatch,
}: SimulatorViewProps<PasswordState, PasswordAction>) {
  const id = useId();
  const r = strength(state.password);
  const pct = Math.min(100, (r.bits / MAX_BITS) * 100);
  const level = r.common || r.bits < 40 ? 'weak' : r.bits < 70 ? 'fair' : 'strong';
  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className={styles.label}>
        Candidate password
      </label>
      <input
        id={id}
        className={styles.input}
        value={state.password}
        onChange={(e) => dispatch({ type: 'set', password: e.target.value })}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={`${id}-warn`}
      />
      <p id={`${id}-warn`} className={styles.warn}>
        Never type a real password into any website you do not trust — this one included. Nothing
        here is sent anywhere, but it is a good habit.
      </p>
      <ul className={styles.pools} aria-label="Character sets used">
        {POOLS.map((p) => (
          <li key={p.name} className={cx(styles.pool, r.pools.includes(p.name) && styles.poolOn)}>
            {p.name} ({p.size})
          </li>
        ))}
      </ul>
      <div className={styles.meter} aria-hidden="true">
        <div
          className={cx(styles.fill, styles[level])}
          style={{ width: `${String(r.common ? 2 : pct)}%` }}
        />
      </div>
      <dl className={styles.facts}>
        <div>
          <dt>Length × log₂(pool)</dt>
          <dd>
            {r.length} × log₂({r.pool || 0}) = {r.bits.toFixed(1)} bits
          </dd>
        </div>
        <div>
          <dt>
            Average time at {GUESSES_PER_SECOND.toExponential(0).replace('e+', ' × 10^')} guesses/s
          </dt>
          <dd>
            {state.password === ''
              ? '—'
              : r.common
                ? 'instantly (common password)'
                : humanDuration(r.seconds)}
          </dd>
        </div>
      </dl>
      <div className={styles.examples} role="group" aria-label="Examples">
        {PASSWORD_EXAMPLES.map((p) => (
          <button key={p} type="button" onClick={() => dispatch({ type: 'set', password: p })}>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
