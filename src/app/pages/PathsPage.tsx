import { CircleCheck, Circle, Route } from 'lucide-react';
import { useId } from 'react';
import { Link, useSearchParams } from 'react-router';
import { DOMAINS, findDomain } from '@data/domains';
import { learningPath, suggestedGoals, summarizePath } from '@core/paths';
import { paths } from '@core/registry';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useT } from '@i18n';
import { useProgress } from '@app/providers/ProgressContext';
import { useDomains, useRegistry } from '@app/providers/RegistryContext';
import { cx } from '@utils/cx';
import styles from './PathsPage.module.css';

export function PathsPage() {
  const t = useT();
  useDocumentTitle(t('paths.docTitle'));
  const id = useId();
  useDomains('all');
  const { registry } = useRegistry();
  const { progress } = useProgress();
  const [params, setParams] = useSearchParams();
  const suggestions = suggestedGoals(registry);
  const requested = params.get('goal');
  const goal = requested && registry.getLesson(requested) ? requested : (suggestions[0]?.id ?? '');
  const path = goal ? learningPath(registry, goal) : [];
  const completed = new Set(Object.keys(progress.completedLessons));
  const summary = summarizePath(path, completed);
  const choose = (lessonId: string) => {
    setParams({ goal: lessonId });
  };

  return (
    <section aria-labelledby={`${id}-title`} className={styles.page}>
      <h1 id={`${id}-title`} className={styles.title}>
        <Route size={26} aria-hidden="true" focusable="false" /> {t('paths.title')}
      </h1>
      <p className={styles.lede}>{t('paths.lede')}</p>

      <div className={styles.field}>
        <label htmlFor={`${id}-goal`}>{t('paths.goalLabel')}</label>
        <select id={`${id}-goal`} value={goal} onChange={(e) => choose(e.target.value)}>
          {DOMAINS.filter((d) => registry.lessonsFor(d.id).length > 0).map((d) => (
            <optgroup key={d.id} label={d.title}>
              {registry.lessonsFor(d.id).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <p className={styles.small}>{t('paths.suggested')}</p>
          <ul className={styles.chips}>
            {suggestions.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className={cx(styles.chip, l.id === goal && styles.chipActive)}
                  aria-pressed={l.id === goal}
                  onClick={() => choose(l.id)}
                >
                  {l.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {path.length > 0 && (
        <section aria-labelledby={`${id}-path`} className={styles.pathSection}>
          <h2 id={`${id}-path`} className={styles.pathTitle}>
            {t('paths.pathTo', { goal: path[path.length - 1]?.title ?? '' })}
          </h2>
          <p className={styles.summary} role="status">
            {[
              t('paths.lessonCount', { count: summary.lessons }),
              t('paths.domainCount', { count: summary.domains }),
              t('paths.minuteCount', { count: summary.minutes }),
              t('paths.doneCount', { count: summary.done }),
            ].join(' · ')}
          </p>
          <ol className={styles.steps} aria-label={t('paths.stepsLabel')}>
            {path.map((l) => {
              const done = completed.has(l.id);
              const isNext = summary.next?.id === l.id;
              return (
                <li
                  key={l.id}
                  className={cx(styles.step, done && styles.stepDone, isNext && styles.stepNext)}
                >
                  <span className={styles.icon} aria-hidden="true">
                    {done ? <CircleCheck size={20} /> : <Circle size={20} />}
                  </span>
                  <span className={styles.domain}>
                    {findDomain(l.domainId)?.title ?? l.domainId}
                  </span>
                  <Link to={paths.lesson(l.domainId, l.slug)} className={styles.link}>
                    {l.title}
                    {done && <span className="visually-hidden">{t('lesson.completedSuffix')}</span>}
                  </Link>
                  {isNext && <span className={styles.nextTag}>{t('paths.nextUp')}</span>}
                  <span className={styles.minutes}>
                    {t('lesson.minutes', { count: l.estimatedMinutes })}
                  </span>
                </li>
              );
            })}
          </ol>
          {summary.next === undefined && <p className={styles.complete}>{t('paths.complete')}</p>}
        </section>
      )}
    </section>
  );
}
