import { Link } from 'react-router';
import { DOMAINS } from '@data/domains';
import { DomainCard } from '@components/catalogue/DomainCard';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useT } from '@i18n';
import { useProgress } from '@app/providers/ProgressContext';
import { useModuleStore } from '@app/providers/RegistryContext';
import styles from './HomePage.module.css';

export function HomePage() {
  useDocumentTitle('');
  const t = useT();
  // Availability is known without downloading any domain chunk.
  const modules = useModuleStore();
  const { progress } = useProgress();
  const last = progress.lastVisited;
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <p className={styles.kicker}>{t('home.kicker')}</p>
        <h1 id="hero-title" className={styles.title}>
          {t('home.titleBefore')}
          <em>{t('home.titleEmphasis')}</em>
          {t('home.titleAfter')}
        </h1>
        <p className={styles.lede}>{t('home.lede')}</p>
        {last && (
          <p className={styles.resume}>
            <Link to={last.path}>{t('home.resume')}</Link>
          </p>
        )}
      </section>

      <section aria-labelledby="domains-title" className={styles.catalogue}>
        <h2 id="domains-title" className={styles.sectionTitle}>
          {t('home.domainsTitle')}
        </h2>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari/VoiceOver drop list semantics when list-style is none; the explicit role restores them */}
        <ul className={styles.grid} role="list">
          {DOMAINS.map((d) => (
            <li key={d.id}>
              <DomainCard
                domain={modules.isRegistered(d.id) ? { ...d, status: 'available' } : d}
                to={`/domains/${d.id}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
