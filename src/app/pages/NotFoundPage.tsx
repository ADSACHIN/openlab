import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useT } from '@i18n';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const t = useT();
  useDocumentTitle(t('notFound.title'));
  return (
    <section className={styles.wrap} aria-labelledby="nf-title">
      <Compass size={40} aria-hidden="true" focusable="false" className={styles.icon} />
      <h1 id="nf-title" className={styles.title}>
        {t('notFound.title')}
      </h1>
      <p className={styles.text}>{t('notFound.text')}</p>
      <Link to="/" className={styles.cta}>
        {t('notFound.back')}
      </Link>
    </section>
  );
}
