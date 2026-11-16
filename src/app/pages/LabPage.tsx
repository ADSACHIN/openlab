import { ArrowLeft, FlaskConical, Link2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { findDomain } from '@data/domains';
import { contentId } from '@core/model';
import type { LabResult } from '@core/model';
import { paths } from '@core/registry';
import { LessonRenderer } from '@components/learning/LessonRenderer';
import { SimulatorHost } from '@components/learning/SimulatorHost';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useT } from '@i18n';
import { usePreferences } from '@app/providers/PreferencesContext';
import { useProgress } from '@app/providers/ProgressContext';
import { useDomains, useRegistry } from '@app/providers/RegistryContext';
import { cx } from '@utils/cx';
import { decodeSetup, encodeSetup, replayLog } from '@utils/share';
import type { ActionLog } from '@utils/share';
import { NotFoundPage } from './NotFoundPage';
import styles from './LabPage.module.css';

type Restore =
  | { status: 'none' }
  | { status: 'failed' }
  | { status: 'restored'; log: ActionLog; state: unknown };

export function LabPage() {
  const { domainId = '', slug = '' } = useParams();
  const t = useT();
  const shareId = useId();
  useDomains([domainId]);
  const { registry } = useRegistry();
  const { progress, store } = useProgress();
  const { reducedMotion } = usePreferences();
  const [params] = useSearchParams();
  const lab = registry.getLab(contentId(domainId as never, slug));
  const domain = findDomain(domainId);
  const simulator = lab ? registry.getSimulator(lab.simulatorId) : undefined;
  // A ?setup= link is untrusted input: decoded strictly and replayed once (ADR-0013).
  const [restore] = useState<Restore>(() => {
    const raw = params.get('setup');
    if (raw === null || !simulator) return { status: 'none' };
    const log = decodeSetup(raw);
    const state = log ? (replayLog(simulator.engine, 1, log) as unknown) : null;
    return log && state !== null ? { status: 'restored', log, state } : { status: 'failed' };
  });
  const [simState, setSimState] = useState<unknown>(() =>
    restore.status === 'restored' ? restore.state : (simulator?.engine.init(1) as unknown),
  );
  const logRef = useRef<ActionLog>(restore.status === 'restored' ? restore.log : []);
  const [result, setResult] = useState<LabResult | null>(null);
  const [share, setShare] = useState<{ url: string; message: string } | null>(null);
  useDocumentTitle(lab?.title ?? t('notFound.docTitle'));

  if (!lab || !domain || !simulator) return <NotFoundPage />;

  const record = progress.labResults[lab.id];

  const check = () => {
    const r = lab.check(simState);
    setResult(r);
    store.recordLabResult(lab.id, r);
  };

  const shareSetup = async () => {
    const encoded = encodeSetup(logRef.current);
    if (encoded === null) {
      setShare({ url: '', message: t('lab.shareTooLong') });
      return;
    }
    const query = logRef.current.length > 0 ? `?setup=${encoded}` : '';
    const url = `${window.location.origin}${window.location.pathname}#${paths.lab(lab.domainId, lab.slug)}${query}`;
    try {
      await navigator.clipboard.writeText(url);
      setShare({ url, message: t('lab.shareCopied') });
    } catch {
      // No clipboard access (permissions, older browsers): the link is shown below to copy by hand.
      setShare({ url, message: t('lab.shareManual') });
    }
  };

  return (
    <article className={styles.page} aria-labelledby="lab-title">
      <Link to={paths.domain(domain.id)} className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" focusable="false" />
        {domain.title}
      </Link>
      <header className={styles.header}>
        <p className={styles.kicker}>
          <FlaskConical size={14} aria-hidden="true" focusable="false" /> {t('lab.kicker')}
        </p>
        <h1 id="lab-title" className={styles.title}>
          {lab.title}
        </h1>
        <p className={styles.summary}>{lab.summary}</p>
      </header>

      {restore.status !== 'none' && (
        <p
          className={cx(styles.notice, restore.status === 'failed' && styles.noticeFailed)}
          role="status"
        >
          {restore.status === 'restored' ? t('lab.restored') : t('lab.restoreFailed')}
        </p>
      )}

      <section aria-labelledby="goal-title" className={styles.goal}>
        <h2 id="goal-title" className={styles.goalTitle}>
          {t('lab.goal')}
        </h2>
        <p>{lab.goal}</p>
        {record && (
          <p className={styles.history}>
            {record.passed ? t('lab.passed') : t('lab.notPassed')} ·{' '}
            {t('lab.attempts', { count: record.attempts })}
          </p>
        )}
      </section>

      {lab.instructions.length > 0 && (
        <section aria-labelledby="instructions-title" className={styles.section}>
          <h2 id="instructions-title" className={styles.sectionTitle}>
            {t('lab.instructions')}
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
        onLogChange={(log) => {
          logRef.current = log;
        }}
        {...(restore.status === 'restored' ? { initialLog: restore.log } : {})}
      />

      <div className={styles.actions}>
        <button type="button" className={styles.check} onClick={check}>
          {t('lab.check')}
        </button>
        <button
          type="button"
          className={styles.shareButton}
          onClick={() => {
            void shareSetup();
          }}
        >
          <Link2 size={16} aria-hidden="true" focusable="false" /> {t('lab.share')}
        </button>
        {result && (
          <p className={cx(styles.result, result.passed ? styles.pass : styles.fail)} role="status">
            <strong>{result.passed ? t('lab.resultPassed') : t('lab.resultNotYet')}</strong>{' '}
            {result.message}
            {result.score !== undefined && ` ${t('lab.score', { score: result.score })}`}
          </p>
        )}
      </div>
      {share && (
        <div className={styles.share}>
          <p role="status">{share.message}</p>
          {share.url && (
            <div className={styles.shareField}>
              <label htmlFor={shareId}>{t('lab.shareLabel')}</label>
              <input
                id={shareId}
                readOnly
                value={share.url}
                onFocus={(e) => {
                  e.target.select();
                }}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
