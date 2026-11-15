import { Fragment } from 'react';
import styles from './InlineText.module.css';

export interface InlineTextProps {
  text: string;
}

/** Renders plain text with `backtick` spans as <code>. No HTML is ever interpreted. */
export function InlineText({ text }: InlineTextProps) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('`') && p.endsWith('`') && p.length > 2 ? (
          // Static split of a string: index keys are stable.
          <code key={i} className={styles.code}>
            {p.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
