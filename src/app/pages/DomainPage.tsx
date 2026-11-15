import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { findDomain } from '@data/domains';
import { DomainIcon } from '@components/ui/DomainIcon';
import { StatusBadge } from '@components/ui/StatusBadge';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { NotFoundPage } from './NotFoundPage';
import styles from './DomainPage.module.css';

export function DomainPage() {
  const { domainId = '' } = useParams();
  const domain = findDomain(domainId);
  useDocumentTitle(domain?.title ?? 'Not found');

  if (!domain) return <NotFoundPage />;

  return (
    <article className={styles.page} aria-labelledby="domain-title">
      <Link to="/" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" focusable="false" />
        All domains
      </Link>
      <header className={styles.header}>
        <div className={styles.icon}>
          <DomainIcon name={domain.icon} size={32} />
        </div>
        <div>
          <h1 id="domain-title" className={styles.title}>
            {domain.title}
          </h1>
          <p className={styles.tagline}>{domain.tagline}</p>
        </div>
        <StatusBadge status={domain.status} />
      </header>
      <p className={styles.description}>{domain.description}</p>
      <section aria-labelledby="topics-title" className={styles.section}>
        <h2 id="topics-title" className={styles.sectionTitle}>
          What you will explore
        </h2>
        <ul className={styles.topics}>
          {domain.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
      {domain.status === 'planned' && (
        <p className={styles.notice} role="status">
          This domain is on the roadmap and not built yet. Lessons, simulators and labs will appear
          here as they land.
        </p>
      )}
    </article>
  );
}
