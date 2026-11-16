import { useT } from '@i18n';
import styles from './PageLoading.module.css';

/** Suspense fallback while a domain chunk downloads. Announced politely; the spinner is decorative. */
export function PageLoading() {
  const t = useT();
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{t('app.loading')}</span>
    </div>
  );
}
