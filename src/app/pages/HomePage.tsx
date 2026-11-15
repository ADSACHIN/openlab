import { Link } from 'react-router';
import { DOMAINS } from '@data/domains';
import { DomainCard } from '@components/catalogue/DomainCard';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useProgress } from '@app/providers/ProgressContext';
import { useRegistry } from '@app/providers/RegistryContext';
import styles from './HomePage.module.css';

export function HomePage() {
  useDocumentTitle('');
  const { registry } = useRegistry();
  const { progress } = useProgress();
  const last = progress.lastVisited;
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <p className={styles.kicker}>Free · Open source · Runs in your browser</p>
        <h1 id="hero-title" className={styles.title}>
          Learn technology by <em>doing</em>.
        </h1>
        <p className={styles.lede}>
          Interactive visualizations, simulators and labs across eight domains. No account, no
          tracking, no cost. Pick a domain to begin.
        </p>
        {last && (
          <p className={styles.resume}>
            <Link to={last.path}>Continue where you left off →</Link>
          </p>
        )}
      </section>

      <section aria-labelledby="domains-title" className={styles.catalogue}>
        <h2 id="domains-title" className={styles.sectionTitle}>
          Learning domains
        </h2>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari/VoiceOver drop list semantics when list-style is none; the explicit role restores them */}
        <ul className={styles.grid} role="list">
          {DOMAINS.map((d) => (
            <li key={d.id}>
              <DomainCard
                domain={registry.hasContent(d.id) ? { ...d, status: 'available' } : d}
                to={`/domains/${d.id}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
