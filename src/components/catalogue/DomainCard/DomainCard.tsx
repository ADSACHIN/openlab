import { Link } from 'react-router';
import type { DomainSummary } from '@typings/domain';
import { DomainIcon } from '@components/ui/DomainIcon';
import { StatusBadge } from '@components/ui/StatusBadge';
import { useT } from '@i18n';
import styles from './DomainCard.module.css';

export interface DomainCardProps {
  domain: DomainSummary;
  /** Route to navigate to. The app decides URLs; the card only renders them. */
  to: string;
}

export function DomainCard({ domain, to }: DomainCardProps) {
  const t = useT();
  const headingId = `domain-${domain.id}-title`;
  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.iconWrap}>
        <DomainIcon name={domain.icon} size={26} />
      </div>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title} id={headingId}>
            <Link to={to} className={styles.link}>
              {domain.title}
            </Link>
          </h3>
          <StatusBadge status={domain.status} />
        </div>
        <p className={styles.tagline}>{domain.tagline}</p>
        <ul className={styles.topics} aria-label={t('domainCard.topics', { domain: domain.title })}>
          {domain.topics.map((topic) => (
            <li key={topic} className={styles.topic}>
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
