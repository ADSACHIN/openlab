import { useId, useState } from 'react';
import type { Quiz as QuizModel } from '@core/model/types';
import { cx } from '@utils/cx';
import { InlineText } from '../InlineText';
import styles from './Quiz.module.css';

export interface QuizResult {
  correct: number;
  total: number;
}

export interface QuizProps {
  quiz: QuizModel;
  onComplete?: (result: QuizResult) => void;
}

export function Quiz({ quiz, onComplete }: QuizProps) {
  const base = useId();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const total = quiz.questions.length;
  const answered = quiz.questions.filter((q) => answers[q.id] !== undefined).length;
  const correct = quiz.questions.filter((q) => answers[q.id] === q.answerId).length;

  const check = () => {
    setChecked(true);
    onComplete?.({ correct, total });
  };
  const retry = () => {
    setAnswers({});
    setChecked(false);
  };

  return (
    <section className={styles.quiz} aria-labelledby={`${base}-title`}>
      <h3 id={`${base}-title`} className={styles.title}>
        {quiz.title ?? 'Check your understanding'}
      </h3>
      <ol className={styles.questions}>
        {quiz.questions.map((q, qi) => {
          const chosen = answers[q.id];
          const isCorrect = checked && chosen === q.answerId;
          const isWrong = checked && chosen !== undefined && chosen !== q.answerId;
          return (
            <li key={q.id} className={styles.question}>
              <fieldset className={styles.fieldset} disabled={checked}>
                <legend className={styles.legend}>
                  <span className={styles.qnum}>{String(qi + 1)}.</span>{' '}
                  <InlineText text={q.prompt} />
                </legend>
                {q.choices.map((c) => {
                  const id = `${base}-${q.id}-${c.id}`;
                  const showCorrect = checked && c.id === q.answerId;
                  return (
                    <div
                      key={c.id}
                      className={cx(
                        styles.choice,
                        showCorrect && styles.choiceCorrect,
                        checked && chosen === c.id && c.id !== q.answerId && styles.choiceWrong,
                      )}
                    >
                      <input
                        type="radio"
                        id={id}
                        name={`${base}-${q.id}`}
                        value={c.id}
                        checked={chosen === c.id}
                        onChange={() => {
                          setAnswers((a) => ({ ...a, [q.id]: c.id }));
                        }}
                      />
                      <label htmlFor={id}>
                        <InlineText text={c.text} />
                      </label>
                    </div>
                  );
                })}
              </fieldset>
              {checked && (
                <p
                  className={cx(
                    styles.feedback,
                    isCorrect && styles.feedbackOk,
                    isWrong && styles.feedbackBad,
                  )}
                >
                  <strong>
                    {isCorrect ? 'Correct.' : chosen === undefined ? 'Not answered.' : 'Not quite.'}
                  </strong>{' '}
                  <InlineText text={q.explanation} />
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className={styles.actions}>
        {checked ? (
          <button type="button" className={styles.secondary} onClick={retry}>
            Try again
          </button>
        ) : (
          <button
            type="button"
            className={styles.primary}
            onClick={check}
            disabled={answered < total}
          >
            Check answers
          </button>
        )}
        <p className={styles.status} role="status" aria-live="polite">
          {checked
            ? `You got ${String(correct)} of ${String(total)} correct.`
            : `${String(answered)} of ${String(total)} answered.`}
        </p>
      </div>
    </section>
  );
}
