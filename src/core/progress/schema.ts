/**
 * Learner progress, persisted locally only. Versioned so the shape can evolve;
 * `migrateProgress` is the single entry point for anything read from storage
 * or imported from a file, and it is deliberately strict.
 */
export const PROGRESS_SCHEMA_VERSION = 1 as const;
export const PROGRESS_KEY = 'progress:v1';
/** Hard cap for imported files; real progress is a few KB. */
export const PROGRESS_MAX_BYTES = 256 * 1024;

export interface LessonCompletion {
  completedAt: string;
}
export interface LabRecord {
  passed: boolean;
  score?: number;
  attempts: number;
  lastAttemptAt: string;
}
export interface QuizRecord {
  correct: number;
  total: number;
  at: string;
}
export interface LastVisited {
  path: string;
  at: string;
}

export interface Progress {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION;
  completedLessons: Record<string, LessonCompletion>;
  labResults: Record<string, LabRecord>;
  quizResults: Record<string, QuizRecord>;
  lastVisited: LastVisited | null;
}

export function emptyProgress(): Progress {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    completedLessons: {},
    labResults: {},
    quizResults: {},
    lastVisited: null,
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isIsoDate = (v: unknown): v is string =>
  typeof v === 'string' && !Number.isNaN(Date.parse(v));
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const hasOnlyKeys = (o: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(o).every((k) => keys.includes(k));

function isLessonCompletion(v: unknown): v is LessonCompletion {
  return isRecord(v) && hasOnlyKeys(v, ['completedAt']) && isIsoDate(v.completedAt);
}
function isLabRecord(v: unknown): v is LabRecord {
  if (!isRecord(v) || !hasOnlyKeys(v, ['passed', 'score', 'attempts', 'lastAttemptAt']))
    return false;
  if (typeof v.passed !== 'boolean' || !isFiniteNumber(v.attempts) || !isIsoDate(v.lastAttemptAt))
    return false;
  return v.score === undefined || (isFiniteNumber(v.score) && v.score >= 0 && v.score <= 100);
}
function isQuizRecord(v: unknown): v is QuizRecord {
  return (
    isRecord(v) &&
    hasOnlyKeys(v, ['correct', 'total', 'at']) &&
    isFiniteNumber(v.correct) &&
    isFiniteNumber(v.total) &&
    v.correct <= v.total &&
    isIsoDate(v.at)
  );
}
function isLastVisited(v: unknown): v is LastVisited | null {
  if (v === null) return true;
  return (
    isRecord(v) && hasOnlyKeys(v, ['path', 'at']) && typeof v.path === 'string' && isIsoDate(v.at)
  );
}
function isRecordOf<T>(v: unknown, guard: (x: unknown) => x is T): v is Record<string, T> {
  return isRecord(v) && Object.values(v).every(guard);
}

export function isProgress(v: unknown): v is Progress {
  if (!isRecord(v)) return false;
  if (
    !hasOnlyKeys(v, [
      'schemaVersion',
      'completedLessons',
      'labResults',
      'quizResults',
      'lastVisited',
    ])
  )
    return false;
  return (
    v.schemaVersion === PROGRESS_SCHEMA_VERSION &&
    isRecordOf(v.completedLessons, isLessonCompletion) &&
    isRecordOf(v.labResults, isLabRecord) &&
    isRecordOf(v.quizResults, isQuizRecord) &&
    isLastVisited(v.lastVisited)
  );
}

export type MigrationFailure = 'invalid' | 'unsupported-version';

/**
 * Accepts any stored/imported value and returns a current-schema Progress,
 * or a failure reason. Add `case N:` branches here when the schema bumps.
 */
export function migrateProgress(
  raw: unknown,
): { ok: true; progress: Progress } | { ok: false; reason: MigrationFailure } {
  if (!isRecord(raw)) return { ok: false, reason: 'invalid' };
  const version = raw.schemaVersion;
  if (version === PROGRESS_SCHEMA_VERSION) {
    return isProgress(raw) ? { ok: true, progress: raw } : { ok: false, reason: 'invalid' };
  }
  if (typeof version === 'number' && version > PROGRESS_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupported-version' };
  }
  return { ok: false, reason: 'invalid' };
}
