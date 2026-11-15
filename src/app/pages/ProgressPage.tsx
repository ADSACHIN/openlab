import { Download, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import type { ImportResult } from '@core/progress';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useProgress } from '@app/providers/ProgressContext';
import { useRegistry } from '@app/providers/RegistryContext';
import styles from './ProgressPage.module.css';

const REASONS: Record<Extract<ImportResult, { ok: false }>['reason'], string> = {
  'too-large': 'That file is too large to be an OPENLAB progress export.',
  'invalid-json': 'That file is not valid JSON.',
  invalid: 'That file is not an OPENLAB progress export.',
  'unsupported-version': 'That export comes from a newer version of OPENLAB. Update and try again.',
};

export function ProgressPage() {
  useDocumentTitle('Your progress');
  const id = useId();
  const { progress, store } = useProgress();
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
    setMessage('Progress exported.');
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const result = store.importJson(text, 'merge');
    setMessage(
      result.ok
        ? `Imported ${String(result.counts.lessons)} lessons, ${String(result.counts.labs)} labs and ${String(result.counts.quizzes)} quizzes.`
        : REASONS[result.reason],
    );
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <section aria-labelledby={`${id}-title`} className={styles.page}>
      <h1 id={`${id}-title`} className={styles.title}>
        Your progress
      </h1>
      <p className={styles.lede}>
        Stored only in this browser
        {store.persisted ? '' : ' (storage is unavailable, so it will not survive a reload)'}.
        Export a file to move it to another device.
      </p>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Lessons completed</dt>
          <dd>
            {String(lessonsDone)}
            {lessonsTotal > 0 && <span className={styles.of}> / {String(lessonsTotal)}</span>}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt>Labs passed</dt>
          <dd>
            {String(labsPassed)}
            {labsTotal > 0 && <span className={styles.of}> / {String(labsTotal)}</span>}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt>Quiz answers correct</dt>
          <dd>
            {String(quizCorrect)}
            {quizTotal > 0 && <span className={styles.of}> / {String(quizTotal)}</span>}
          </dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={exportFile}>
          <Download size={16} aria-hidden="true" focusable="false" /> Export JSON
        </button>
        <label className={styles.secondary}>
          <Upload size={16} aria-hidden="true" focusable="false" /> Import JSON
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
            Delete all progress?
            <button
              type="button"
              className={styles.danger}
              onClick={() => {
                store.reset();
                setConfirmReset(false);
                setMessage('Progress cleared.');
              }}
            >
              Yes, delete
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setConfirmReset(false);
              }}
            >
              Cancel
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
            <Trash2 size={16} aria-hidden="true" focusable="false" /> Reset
          </button>
        )}
      </div>
      <p className={styles.message} role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
