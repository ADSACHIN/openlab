import { useId } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { PAYLOADS, analyse, renderComment } from './engine';
import type { XssAction, XssState } from './engine';
import styles from './XssView.module.css';

/**
 * Security note: this view never inserts the learner's input as HTML. The
 * generated markup is shown as text and a simulated browser verdict explains
 * what would happen. See docs/security/SECURITY_POLICY.md.
 */
export function XssView({ state, dispatch }: SimulatorViewProps<XssState, XssAction>) {
  const id = useId();
  const html = renderComment(state.input, state.mode);
  const verdict = analyse(html);
  return (
    <div className={styles.wrap}>
      <div className={styles.field}>
        <label htmlFor={`${id}-in`}>Comment text</label>
        <textarea
          id={`${id}-in`}
          rows={2}
          value={state.input}
          onChange={(e) => dispatch({ type: 'set-input', value: e.target.value })}
          spellCheck={false}
        />
      </div>
      <div className={styles.presets} role="group" aria-label="Example comments">
        {PAYLOADS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => dispatch({ type: 'set-input', value: p.value })}
          >
            {p.label}
          </button>
        ))}
      </div>
      <fieldset className={styles.modes}>
        <legend>How the page outputs the comment</legend>
        <label>
          <input
            type="radio"
            name={`${id}-mode`}
            checked={state.mode === 'raw'}
            onChange={() => dispatch({ type: 'set-mode', mode: 'raw' })}
          />{' '}
          Insert as raw HTML (vulnerable)
        </label>
        <label>
          <input
            type="radio"
            name={`${id}-mode`}
            checked={state.mode === 'escaped'}
            onChange={() => dispatch({ type: 'set-mode', mode: 'escaped' })}
          />{' '}
          Escape for HTML (safe)
        </label>
      </fieldset>
      <div>
        <p className={styles.heading}>HTML the server sends</p>
        <pre className={styles.html}>{html}</pre>
      </div>
      <div className={cx(styles.verdict, verdict.executes ? styles.danger : styles.safe)}>
        <p className={styles.heading}>Simulated browser</p>
        {verdict.executes ? (
          <p>
            Would run JavaScript via a <strong>{verdict.vector}</strong>:{' '}
            <code>{verdict.code}</code>
            <br />
            That code runs with the visitor&apos;s session on this site.
          </p>
        ) : state.mode === 'escaped' ? (
          <p>
            Shows the comment as text: <span className={styles.preview}>{state.input}</span>
          </p>
        ) : (
          <p>
            No script would run, but raw HTML still lets commenters change the page&apos;s markup.
          </p>
        )}
      </div>
    </div>
  );
}
