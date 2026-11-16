import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { FIRST_DATA_ADDRESS, N_ADDRESS, formatCell, isInstr } from './engine';
import type { CpuAction, CpuState } from './engine';
import styles from './CpuView.module.css';

const LABELS: Record<number, string> = { 10: 'n', 11: 'one' };

export function CpuView({ state, dispatch }: SimulatorViewProps<CpuState, CpuAction>) {
  const id = useId();
  const n = state.memory[N_ADDRESS];
  // Highlight the instruction being worked on: after fetch, PC already points past it.
  const current = state.phase === 'fetch' ? state.pc : state.pc - 1;
  return (
    <div className={styles.wrap}>
      <table className={styles.memory}>
        <caption>Memory</caption>
        <thead>
          <tr>
            <th scope="col">Addr</th>
            <th scope="col">Contents</th>
          </tr>
        </thead>
        <tbody>
          {state.memory.slice(0, 12).map((c, addr) => (
            <tr
              key={addr}
              className={cx(
                addr === current && !state.halted && styles.current,
                addr >= FIRST_DATA_ADDRESS && styles.data,
              )}
            >
              <td>{addr}</td>
              <td>
                {formatCell(c)}
                {LABELS[addr] && <span className={styles.label}> ({LABELS[addr]})</span>}
                {isInstr(c) && addr === state.pc && <span className={styles.pc}> ← PC</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.side}>
        <dl className={styles.regs}>
          <div>
            <dt>PC</dt>
            <dd>{state.pc}</dd>
          </div>
          <div>
            <dt>ACC</dt>
            <dd>{state.acc}</dd>
          </div>
          <div>
            <dt>IR</dt>
            <dd>{state.ir ? formatCell(state.ir) : '—'}</dd>
          </div>
          <div>
            <dt>Phase</dt>
            <dd>{state.halted ? 'halted' : state.phase}</dd>
          </div>
        </dl>
        <p className={styles.note}>{state.note}</p>
        <div>
          <p className={styles.heading}>Output</p>
          <pre className={styles.output}>{state.output.join('\n') || ' '}</pre>
        </div>
        <label htmlFor={id} className={styles.edit}>
          Set n (memory[10])
          <input
            id={id}
            type="number"
            min={1}
            max={9}
            value={typeof n === 'number' ? n : 0}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isInteger(v) && v >= 1 && v <= 9)
                dispatch({ type: 'set-data', address: N_ADDRESS, value: v });
            }}
          />
        </label>
      </div>
    </div>
  );
}
