import { Fragment } from 'react';
import styles from './InlineText.module.css';

export interface InlineTextProps {
  text: string;
}

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

/** Renders plain text with `backtick` code spans and **bold** runs. No HTML is ever interpreted. */
export function InlineText({ text }: InlineTextProps) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((p, i) => {
        // Static split of a string: index keys are stable.
        if (p.length > 2 && p.startsWith('`') && p.endsWith('`')) {
          return (
            <code key={i} className={styles.code}>
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.length > 4 && p.startsWith('**') && p.endsWith('**')) {
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
