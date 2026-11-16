import { Download, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useT } from '@i18n';
import { useProgress } from '@app/providers/ProgressContext';
import { useDomains, useRegistry } from '@app/providers/RegistryContext';
import styles from './ProgressPage.module.css';

export function ProgressPage() {
  const t = useT();
  useDocumentTitle(t('progress.docTitle'));
  const id = useId();
  const { progress, store } = useProgress();
  useDomains('all');
  const { registry } = useRegistry();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const lessonsDone = Object.keys(progress.completedLessons).length;
  const lessonsTotal = registry.allLessons().length;
  const labsPassed = Object.values(progress.labResults).filter((r) => r.passed).length;
  const labsTotal = registry.allLabs().length;
  const quizzes = Object.values(progress.quizResults);
  const quizCorrect = quizzes.reduce((n, q) => n + q.correct, 0);
  const quizTotal = quizzes.reduce((n, q) => n + q.total, 0);

  const exportFile = () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openlab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(t('progress.exported'));
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const result = store.importJson(text, 'merge');
    setMessage(
      result.ok
        ? t('progress.imported', {
            lessons: result.counts.lessons,
            labs: result.counts.labs,
            quizzes: result.counts.quizzes,
          })
        : t(`progress.error.${result.reason}`),
    );
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <section aria-labelledby={`${id}-title`} className={styles.page}>
      <h1 id={`${id}-title`} className={styles.title}>
        {t('progress.title')}
      </h1>
      <p className={styles.lede}>
        {store.persisted ? t('progress.ledeStored') : t('progress.ledeUnavailable')}
      </p>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>{t('progress.lessons')}</dt>
          <dd>
            {String(lessonsDone)}
            {lessonsTotal > 0 && <span className={styles.of}> / {String(lessonsTotal)}</span>}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt>{t('progress.labs')}</dt>
          <dd>
            {String(labsPassed)}
            {labsTotal > 0 && <span className={styles.of}> / {String(labsTotal)}</span>}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt>{t('progress.quiz')}</dt>
          <dd>
            {String(quizCorrect)}
            {quizTotal > 0 && <span className={styles.of}> / {String(quizTotal)}</span>}
          </dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={exportFile}>
          <Download size={16} aria-hidden="true" focusable="false" /> {t('progress.export')}
        </button>
        <label className={styles.secondary}>
          <Upload size={16} aria-hidden="true" focusable="false" /> {t('progress.import')}
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            onChange={(e) => {
              void importFile(e.target.files?.[0]);
            }}
          />
        </label>
        {confirmReset ? (
          <span className={styles.confirm}>
            {t('progress.confirmReset')}
            <button
              type="button"
              className={styles.danger}
              onClick={() => {
                store.reset();
                setConfirmReset(false);
                setMessage(t('progress.cleared'));
              }}
            >
              {t('progress.confirmYes')}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setConfirmReset(false);
              }}
            >
              {t('progress.confirmNo')}
            </button>
          </span>
        ) : (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              setConfirmReset(true);
            }}
          >
            <Trash2 size={16} aria-hidden="true" focusable="false" /> {t('progress.reset')}
          </button>
        )}
      </div>
      <p className={styles.message} role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
