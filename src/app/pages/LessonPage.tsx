import { ArrowLeft, CircleCheck, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { findDomain } from '@data/domains';
import { contentId } from '@core/model';
import { paths } from '@core/registry';
import { LessonRenderer } from '@components/learning/LessonRenderer';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { usePreferences } from '@app/providers/PreferencesContext';
import { useProgress } from '@app/providers/ProgressContext';
import { useRegistry } from '@app/providers/RegistryContext';
import { cx } from '@utils/cx';
import { NotFoundPage } from './NotFoundPage';
import styles from './LessonPage.module.css';

export function LessonPage() {
  const { domainId = '', slug = '' } = useParams();
  const { registry } = useRegistry();
  const { progress, store } = useProgress();
  const { reducedMotion } = usePreferences();
  const lesson = registry.getLesson(contentId(domainId as never, slug));
  const domain = findDomain(domainId);
  useDocumentTitle(lesson?.title ?? 'Not found');

  if (!lesson || !domain) return <NotFoundPage />;

  const done = lesson.id in progress.completedLessons;
  const prereqs = registry.prerequisitesOf(lesson.id);
  const next = registry.dependentsOf(lesson.id);

  return (
    <article className={styles.page} aria-labelledby="lesson-title">
      <Link to={paths.domain(domain.id)} className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" focusable="false" />
        {domain.title}
      </Link>

      <header className={styles.header}>
        <h1 id="lesson-title" className={styles.title}>
          {lesson.title}
        </h1>
        <p className={styles.summary}>{lesson.summary}</p>
        <p className={styles.meta}>
          <span>
            <Clock size={14} aria-hidden="true" focusable="false" />{' '}
            {String(lesson.estimatedMinutes)} min
          </span>
          {done && (
            <span className={styles.doneTag}>
              <CircleCheck size={14} aria-hidden="true" focusable="false" /> Completed
            </span>
          )}
        </p>
      </header>

      {(prereqs.length > 0 || lesson.outcomes.length > 0) && (
        <aside className={styles.sidebar} aria-label="Lesson overview">
          {prereqs.length > 0 && (
            <div>
              <h2 className={styles.sideTitle}>Before this</h2>
              <ul className={styles.sideList}>
                {prereqs.map((p) => (
                  <li
                    key={p.id}
                    className={cx(p.id in progress.completedLessons && styles.sideDone)}
                  >
                    <Link to={paths.lesson(p.domainId, p.slug)}>{p.title}</Link>
                    {p.id in progress.completedLessons && (
                      <span className="visually-hidden"> (completed)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {lesson.outcomes.length > 0 && (
            <div>
              <h2 className={styles.sideTitle}>After this you can</h2>
              <ul className={styles.sideList}>
                {lesson.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}

      <LessonRenderer
        lesson={lesson}
        resolveSimulator={registry.getSimulator}
        reducedMotion={reducedMotion}
        onQuizComplete={(quizId, r) => {
          store.recordQuizResult(quizId, r.correct, r.total);
        }}
      />

      <footer className={styles.footer}>
        <button
          type="button"
          className={cx(styles.complete, done && styles.completeDone)}
          aria-pressed={done}
          onClick={() => {
            if (done) store.unmarkLesson(lesson.id);
            else store.markLessonComplete(lesson.id);
          }}
        >
          <CircleCheck size={18} aria-hidden="true" focusable="false" />
          {done ? 'Completed — click to undo' : 'Mark as complete'}
        </button>
        {next.length > 0 && (
          <nav aria-label="Learn next" className={styles.next}>
            <span className={styles.nextLabel}>Learn next:</span>
            {next.map((n) => (
              <Link key={n.id} to={paths.lesson(n.domainId, n.slug)}>
                {n.title}
              </Link>
            ))}
          </nav>
        )}
      </footer>
    </article>
  );
}
