import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { modeToOctal, modeToString } from '../../lib/vfs';
import { WHAT, WHO, explain, hasBit } from './engine';
import type { PermissionBitsAction, PermissionBitsState } from './engine';
import styles from './PermissionBitsView.module.css';

export function PermissionBitsView({
  state,
  dispatch,
}: SimulatorViewProps<PermissionBitsState, PermissionBitsAction>) {
  const id = useId();
  return (
    <div className={styles.wrap}>
      <div className={styles.readout} aria-live="off">
        <code className={styles.symbolic}>
          {modeToString(state.mode, state.isDir ? 'dir' : 'file')}
        </code>
        <code className={styles.octal}>{modeToOctal(state.mode)}</code>
      </div>
      <table className={styles.grid}>
        <caption className="visually-hidden">Permission bits</caption>
        <thead>
          <tr>
            <th scope="col"></th>
            {WHAT.map((w) => (
              <th key={w} scope="col">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WHO.map((who, wi) => (
            <tr key={who}>
              <th scope="row">{who}</th>
              {WHAT.map((what, xi) => {
                const bit = wi * 3 + xi;
                const cid = `${id}-${String(bit)}`;
                return (
                  <td key={what}>
                    <input
                      id={cid}
                      type="checkbox"
                      checked={hasBit(state.mode, wi, xi)}
                      onChange={() => dispatch({ type: 'toggle', bit })}
                    />
                    <label htmlFor={cid} className="visually-hidden">
                      {who} {what}
                    </label>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.controls}>
        <label>
          <input
            type="checkbox"
            checked={state.isDir}
            onChange={(e) => dispatch({ type: 'kind', isDir: e.target.checked })}
          />{' '}
          Treat as a directory
        </label>
        <span className={styles.presets} role="group" aria-label="Common modes">
          {['644', '600', '755', '700', '777'].map((m) => (
            <button
              key={m}
              type="button"
              className={styles.preset}
              onClick={() => dispatch({ type: 'set', mode: parseInt(m, 8) })}
            >
              {m}
            </button>
          ))}
        </span>
      </div>
      <p className={styles.explain}>{explain(state.mode, state.isDir)}.</p>
    </div>
  );
}
