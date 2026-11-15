import { DOMAINS } from '@data/domains';
import { DomainCard } from '@components/catalogue/DomainCard';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import styles from './HomePage.module.css';

export function HomePage() {
  useDocumentTitle('');
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
      </section>

      <section aria-labelledby="domains-title" className={styles.catalogue}>
        <h2 id="domains-title" className={styles.sectionTitle}>
          Learning domains
        </h2>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari/VoiceOver drop list semantics when list-style is none; the explicit role restores them */}
        <ul className={styles.grid} role="list">
          {DOMAINS.map((d) => (
            <li key={d.id}>
              <DomainCard domain={d} to={`/domains/${d.id}`} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
