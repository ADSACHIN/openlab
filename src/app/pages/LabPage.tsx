import { ArrowLeft, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { findDomain } from '@data/domains';
import { contentId } from '@core/model';
import type { LabResult } from '@core/model';
import { paths } from '@core/registry';
import { LessonRenderer } from '@components/learning/LessonRenderer';
import { SimulatorHost } from '@components/learning/SimulatorHost';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { usePreferences } from '@app/providers/PreferencesContext';
import { useProgress } from '@app/providers/ProgressContext';
import { useRegistry } from '@app/providers/RegistryContext';
import { cx } from '@utils/cx';
import { NotFoundPage } from './NotFoundPage';
import styles from './LabPage.module.css';

export function LabPage() {
  const { domainId = '', slug = '' } = useParams();
  const { registry } = useRegistry();
  const { progress, store } = useProgress();
  const { reducedMotion } = usePreferences();
  const lab = registry.getLab(contentId(domainId as never, slug));
  const domain = findDomain(domainId);
  const simulator = lab ? registry.getSimulator(lab.simulatorId) : undefined;
  const [simState, setSimState] = useState<unknown>(() => simulator?.engine.init(1) as unknown);
  const [result, setResult] = useState<LabResult | null>(null);
  useDocumentTitle(lab?.title ?? 'Not found');

  if (!lab || !domain || !simulator) return <NotFoundPage />;

  const record = progress.labResults[lab.id];

  const check = () => {
    const r = lab.check(simState);
    setResult(r);
    store.recordLabResult(lab.id, r);
  };

  return (
    <article className={styles.page} aria-labelledby="lab-title">
      <Link to={paths.domain(domain.id)} className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" focusable="false" />
        {domain.title}
      </Link>
      <header className={styles.header}>
        <p className={styles.kicker}>
          <FlaskConical size={14} aria-hidden="true" focusable="false" /> Lab
        </p>
        <h1 id="lab-title" className={styles.title}>
          {lab.title}
        </h1>
        <p className={styles.summary}>{lab.summary}</p>
      </header>

      <section aria-labelledby="goal-title" className={styles.goal}>
        <h2 id="goal-title" className={styles.goalTitle}>
          Goal
        </h2>
        <p>{lab.goal}</p>
        {record && (
          <p className={styles.history}>
            {record.passed ? 'Passed' : 'Not passed yet'} · {String(record.attempts)}{' '}
            {record.attempts === 1 ? 'attempt' : 'attempts'}
          </p>
        )}
      </section>

      {lab.instructions.length > 0 && (
        <section aria-labelledby="instructions-title" className={styles.section}>
          <h2 id="instructions-title" className={styles.sectionTitle}>
            Instructions
          </h2>
          <LessonRenderer
            lesson={{ ...lab, prerequisites: [], outcomes: [], tags: [], blocks: lab.instructions }}
            resolveSimulator={registry.getSimulator}
            reducedMotion={reducedMotion}
          />
        </section>
      )}

      <SimulatorHost
        simulator={simulator}
        reducedMotion={reducedMotion}
        onStateChange={setSimState}
      />

      <div className={styles.actions}>
        <button type="button" className={styles.check} onClick={check}>
          Check my work
        </button>
        {result && (
          <p className={cx(styles.result, result.passed ? styles.pass : styles.fail)} role="status">
            <strong>{result.passed ? 'Passed.' : 'Not yet.'}</strong> {result.message}
            {result.score !== undefined && ` Score: ${String(result.score)}/100.`}
          </p>
        )}
      </div>
    </article>
  );
}
