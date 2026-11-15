import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <section className={styles.wrap} aria-labelledby="nf-title">
      <Compass size={40} aria-hidden="true" focusable="false" className={styles.icon} />
      <h1 id="nf-title" className={styles.title}>
        Page not found
      </h1>
      <p className={styles.text}>
        That route does not exist. It may have moved, or the link was mistyped.
      </p>
      <Link to="/" className={styles.cta}>
        Back to all domains
      </Link>
    </section>
  );
}
