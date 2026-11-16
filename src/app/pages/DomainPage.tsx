import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { findDomain } from '@data/domains';
import { paths } from '@core/registry';
import { ContentList } from '@components/learning/ContentList';
import { DomainIcon } from '@components/ui/DomainIcon';
import { StatusBadge } from '@components/ui/StatusBadge';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useT } from '@i18n';
import { useProgress } from '@app/providers/ProgressContext';
import { useDomains, useRegistry } from '@app/providers/RegistryContext';
import { NotFoundPage } from './NotFoundPage';
import styles from './DomainPage.module.css';

export function DomainPage() {
  const { domainId = '' } = useParams();
  const t = useT();
  const domain = findDomain(domainId);
  useDomains([domainId]);
  const { registry } = useRegistry();
  const { progress } = useProgress();
  useDocumentTitle(domain?.title ?? t('notFound.docTitle'));

  if (!domain) return <NotFoundPage />;

  const lessons = registry.lessonsFor(domain.id);
  const labs = registry.labsFor(domain.id);
  const hasContent = lessons.length > 0 || labs.length > 0;
  const status = hasContent ? 'available' : domain.status;
  const completed = lessons.filter((l) => l.id in progress.completedLessons).length;

  return (
    <article className={styles.page} aria-labelledby="domain-title">
      <Link to="/" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" focusable="false" />
        {t('domain.back')}
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
        <StatusBadge status={status} />
      </header>
      <p className={styles.description}>{domain.description}</p>

      {hasContent ? (
        <>
          {lessons.length > 0 && (
            <section aria-labelledby="lessons-title" className={styles.section}>
              <h2 id="lessons-title" className={styles.sectionTitle}>
                {t('domain.lessons')}{' '}
                <span className={styles.count}>
                  {t('domain.lessonsDone', { done: completed, total: lessons.length })}
                </span>
              </h2>
              <ContentList
                ariaLabel={t('domain.lessonsList', { domain: domain.title })}
                items={lessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  summary: l.summary,
                  to: paths.lesson(l.domainId, l.slug),
                  minutes: l.estimatedMinutes,
                  done: l.id in progress.completedLessons,
                }))}
              />
            </section>
          )}
          {labs.length > 0 && (
            <section aria-labelledby="labs-title" className={styles.section}>
              <h2 id="labs-title" className={styles.sectionTitle}>
                {t('domain.labs')}
              </h2>
              <ContentList
                ariaLabel={t('domain.labsList', { domain: domain.title })}
                items={labs.map((l) => ({
                  id: l.id,
                  title: l.title,
                  summary: l.summary,
                  to: paths.lab(l.domainId, l.slug),
                  minutes: l.estimatedMinutes,
                  done: progress.labResults[l.id]?.passed ?? false,
                  badge: t('domain.labBadge'),
                }))}
              />
            </section>
          )}
        </>
      ) : (
        <>
          <section aria-labelledby="topics-title" className={styles.section}>
            <h2 id="topics-title" className={styles.sectionTitle}>
              {t('domain.topics')}
            </h2>
            <ul className={styles.topics}>
              {domain.topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
          <p className={styles.notice} role="status">
            {t('domain.planned')}
          </p>
        </>
      )}
    </article>
  );
}
