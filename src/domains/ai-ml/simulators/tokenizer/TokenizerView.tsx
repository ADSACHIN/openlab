import type { SimulatorViewProps } from '@core/model';
import { CORPUS, SAMPLE, tokenCount, tokenize, vocabulary } from './engine';
import type { TokenizerState } from './engine';
import styles from './TokenizerView.module.css';

function Pills({ tokens, label }: { tokens: readonly string[]; label: string }) {
  return (
    <span className={styles.pills} aria-label={`${label}: ${tokens.join(' | ')}`}>
      {tokens.map((t, i) => (
        <span key={`${String(i)}-${t}`} className={styles.pill} aria-hidden="true">
          {t}
        </span>
      ))}
    </span>
  );
}

export function TokenizerView({ state }: SimulatorViewProps<TokenizerState>) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption>Training corpus (“_” marks the end of a word)</caption>
        <thead>
          <tr>
            <th scope="col">Word</th>
            <th scope="col">Count</th>
            <th scope="col">Tokens now</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(state.words).map(([w, syms]) => (
            <tr key={w}>
              <td>{w}</td>
              <td>×{CORPUS[w]}</td>
              <td>
                <Pills tokens={syms} label={w} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className={styles.stats}>
        <div>
          <dt>Merges learned</dt>
          <dd>{state.merges.length}</dd>
        </div>
        <div>
          <dt>Corpus length</dt>
          <dd>{tokenCount(state.words)} tokens</dd>
        </div>
        <div>
          <dt>Vocabulary</dt>
          <dd>{vocabulary(state.words).length} symbols</dd>
        </div>
      </dl>
      <div>
        <p className={styles.heading}>Merge rules, in order</p>
        <ol className={styles.merges}>
          {state.merges.map(([a, b], i) => (
            <li key={`${String(i)}-${a}${b}`}>
              <code>
                {a} + {b} → {a + b}
              </code>
            </li>
          ))}
        </ol>
      </div>
      <p>
        Unseen text “{SAMPLE}”: <Pills tokens={tokenize(SAMPLE, state.merges)} label={SAMPLE} />
      </p>
    </div>
  );
}
