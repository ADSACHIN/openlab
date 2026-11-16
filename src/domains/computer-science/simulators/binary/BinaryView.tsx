import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { toHex, toSigned } from './engine';
import type { BinaryAction, BinaryState } from './engine';
import styles from './BinaryView.module.css';

const BITS = [7, 6, 5, 4, 3, 2, 1, 0] as const;

export function BinaryView({ state, dispatch }: SimulatorViewProps<BinaryState, BinaryAction>) {
  return (
    <div className={styles.wrap}>
      <div className={styles.bits} role="group" aria-label="Eight bits, most significant first">
        {BITS.map((b) => {
          const on = ((state.value >> b) & 1) === 1;
          return (
            <button
              key={b}
              type="button"
              className={cx(styles.bit, on && styles.on)}
              aria-pressed={on}
              aria-label={`Bit ${String(b)}, place value ${String(2 ** b)}`}
              onClick={() => dispatch({ type: 'toggle', bit: b })}
            >
              <span className={styles.digit}>{on ? 1 : 0}</span>
              <span className={styles.place}>{2 ** b}</span>
            </button>
          );
        })}
      </div>
      <dl className={styles.readout}>
        <div>
          <dt>Unsigned</dt>
          <dd>{state.value}</dd>
        </div>
        <div>
          <dt>Signed (two&apos;s complement)</dt>
          <dd>{toSigned(state.value)}</dd>
        </div>
        <div>
          <dt>Hex</dt>
          <dd>0x{toHex(state.value)}</dd>
        </div>
      </dl>
      <div className={styles.presets} role="group" aria-label="Try a value">
        {[11, 42, 127, 128, 255].map((v) => (
          <button key={v} type="button" onClick={() => dispatch({ type: 'set', value: v })}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
