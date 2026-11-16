import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import type { TracerProgram, TracerState } from './engine';
import styles from './TracerView.module.css';

export function createTracerView(program: TracerProgram) {
  return function TracerView({ state }: SimulatorViewProps<TracerState>) {
    const done = state.pc >= program.lines.length;
    return (
      <div className={styles.wrap}>
        <ol className={styles.code} aria-label="Program">
          {program.lines.map((l, i) => (
            <li
              key={`${String(i)}-${l.text}`}
              className={cx(
                styles.line,
                i === state.pc && !done && styles.next,
                i === state.last && styles.last,
              )}
              style={{ paddingLeft: `calc(var(--space-3) + ${String((l.indent ?? 0) * 1.5)}rem)` }}
              aria-current={i === state.pc && !done ? 'step' : undefined}
            >
              <span className={styles.lineNo}>{i + 1}</span>
              <code>{l.text}</code>
            </li>
          ))}
        </ol>
        <div className={styles.side}>
          <table className={styles.vars}>
            <caption className={styles.caption}>Variables</caption>
            <tbody>
              {Object.keys(state.env).length === 0 && (
                <tr>
                  <td className={styles.muted} colSpan={2}>
                    none yet
                  </td>
                </tr>
              )}
              {Object.entries(state.env).map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <p className={styles.caption}>Output</p>
            <pre className={styles.output}>{state.output.join('\n') || ' '}</pre>
          </div>
          <p className={styles.muted}>
            {done ? 'Finished' : 'Next'}: line {done ? '—' : String(state.pc + 1)} · {state.steps}{' '}
            steps executed
          </p>
        </div>
      </div>
    );
  };
}
