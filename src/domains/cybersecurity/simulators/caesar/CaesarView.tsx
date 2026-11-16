import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { ALPHABET, ciphertextOf, englishScore, shiftText } from './engine';
import type { CaesarAction, CaesarState } from './engine';
import styles from './CaesarView.module.css';

export function CaesarView({ state, dispatch }: SimulatorViewProps<CaesarState, CaesarAction>) {
  const id = useId();
  const cipher = ciphertextOf(state);
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <label htmlFor={`${id}-pt`}>Plaintext</label>
        <input
          id={`${id}-pt`}
          value={state.plaintext}
          onChange={(e) => dispatch({ type: 'set-plaintext', text: e.target.value })}
          spellCheck={false}
        />
      </div>
      <div className={styles.row}>
        <label htmlFor={`${id}-key`}>
          Secret key: <strong>{state.key}</strong>
        </label>
        <input
          id={`${id}-key`}
          type="range"
          min={0}
          max={ALPHABET - 1}
          value={state.key}
          onChange={(e) => dispatch({ type: 'set-key', key: Number(e.target.value) })}
        />
      </div>
      <p className={styles.cipher}>
        Ciphertext: <code>{cipher}</code>
      </p>
      <div>
        <p className={styles.heading}>
          Attacker: try every key ({state.tried} of {ALPHABET})
        </p>
        <ol className={styles.tries}>
          {Array.from({ length: state.tried }, (_, k) => {
            const guess = shiftText(cipher, -k);
            return (
              <li
                key={k}
                className={cx(state.best?.key === k && state.tried === ALPHABET && styles.best)}
              >
                <span className={styles.k}>key {k}</span> <code>{guess}</code>{' '}
                <span className={styles.score}>{englishScore(guess)} words</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
