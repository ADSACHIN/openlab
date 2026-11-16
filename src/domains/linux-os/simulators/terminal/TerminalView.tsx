import { useEffect, useId, useRef, useState } from 'react';
import type { SimulatorViewProps } from '@core/model';
import { cx } from '@utils/cx';
import { prompt } from './engine';
import type { TerminalAction, TerminalState } from './engine';
import styles from './TerminalView.module.css';

export function TerminalView({
  state,
  dispatch,
}: SimulatorViewProps<TerminalState, TerminalAction>) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.history.length]);

  const submit = () => {
    dispatch({ type: 'run', command: draft });
    setDraft('');
    setHistIndex(null);
  };

  return (
    <div className={styles.terminal}>
      <div
        ref={scroller}
        className={styles.output}
        role="region"
        aria-label="Terminal output"
        tabIndex={0}
      >
        {state.history.length === 0 && (
          <p className={styles.hint}>
            Type a command below. `help` lists what this shell understands.
          </p>
        )}
        {state.history.map((h, i) => (
          <div key={`${String(i)}-${h.command}`}>
            <div className={styles.line}>
              <span className={styles.prompt}>
                {prompt({ ...state, cwd: cwdBefore(state, i) })}
              </span>{' '}
              {h.command}
            </div>
            {h.output !== '' && (
              <pre className={cx(styles.result, h.error && styles.error)}>{h.output}</pre>
            )}
          </div>
        ))}
      </div>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={id} className={styles.prompt}>
          {prompt(state)}
        </label>
        <input
          id={id}
          className={styles.input}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              const cmds = state.history.map((h) => h.command);
              if (cmds.length === 0) return;
              const next =
                e.key === 'ArrowUp'
                  ? Math.max(0, (histIndex ?? cmds.length) - 1)
                  : Math.min(cmds.length, (histIndex ?? cmds.length) + 1);
              setHistIndex(next);
              setDraft(cmds[next] ?? '');
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={`${id}-help`}
        />
        <button type="submit" className={styles.run}>
          Run
        </button>
        <span id={`${id}-help`} className="visually-hidden">
          Press Enter to run. Up and down arrows recall previous commands.
        </span>
      </form>
    </div>
  );
}

/** The prompt shown for history entry i reflects the cwd at that time; we only track the current one, so replay cd's. */
function cwdBefore(state: TerminalState, index: number): string {
  let cwd = '/home/learner';
  const replay = { ...state, cwd, history: [] as TerminalState['history'] };
  for (let i = 0; i < index; i++) {
    const cmd = state.history[i]?.command ?? '';
    if (cmd.startsWith('cd')) {
      // Re-run only cd commands against the final fs to recover the path.
      const r = runCd(replay, cmd);
      cwd = r;
      replay.cwd = r;
    }
  }
  return cwd;
}

function runCd(s: TerminalState, cmd: string): string {
  const target = cmd.replace(/^cd\s*/, '') || '~';
  const abs = target.startsWith('/')
    ? target
    : target.startsWith('~')
      ? `/home/learner${target.slice(1)}`
      : `${s.cwd}/${target}`;
  const parts: string[] = [];
  for (const seg of abs.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  const path = `/${parts.join('/')}`;
  return s.fs[path]?.type === 'dir' ? path : s.cwd;
}
