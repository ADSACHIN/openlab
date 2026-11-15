import styles from './CodeBlock.module.css';

export interface CodeBlockProps {
  language: string;
  code: string;
  caption?: string;
}

export function CodeBlock({ language, code, caption }: CodeBlockProps) {
  const block = (
    // Scrollable regions must be keyboard reachable (axe: scrollable-region-focusable).
    <pre
      className={styles.pre}
      tabIndex={0}
      role="region"
      aria-label={caption ?? `${language} code`}
      data-language={language}
    >
      <code className={styles.code}>{code}</code>
    </pre>
  );
  return caption ? (
    <figure className={styles.figure}>
      {block}
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  ) : (
    block
  );
}
