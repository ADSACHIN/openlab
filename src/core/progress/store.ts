import { readJson, writeJson, isStorageAvailable, removeKey } from '@core/storage/safeStorage';
import type { LabResult } from '@core/model/types';
import {
  PROGRESS_KEY,
  PROGRESS_MAX_BYTES,
  emptyProgress,
  isProgress,
  migrateProgress,
  type Progress,
} from './schema';

export type ImportMode = 'replace' | 'merge';

export type ImportResult =
  | { ok: true; counts: { lessons: number; labs: number; quizzes: number } }
  | { ok: false; reason: 'too-large' | 'invalid-json' | 'invalid' | 'unsupported-version' };

export interface ProgressStore {
  getState: () => Progress;
  subscribe: (listener: () => void) => () => void;
  /** False when localStorage is unusable; the store then lives in memory only. */
  readonly persisted: boolean;

  markLessonComplete: (lessonId: string) => void;
  unmarkLesson: (lessonId: string) => void;
  recordLabResult: (labId: string, result: LabResult) => void;
  recordQuizResult: (quizId: string, correct: number, total: number) => void;
  setLastVisited: (path: string) => void;
  reset: () => void;

  exportJson: () => string;
  importJson: (json: string, mode: ImportMode) => ImportResult;
  /** Write any pending change immediately (call on pagehide). */
  flush: () => void;
}

export interface ProgressStoreOptions {
  now?: () => Date;
  /** Debounce for persisting writes. 0 = synchronous. */
  debounceMs?: number;
  /** Set false in tests that must not touch storage. */
  persist?: boolean;
}

export function createProgressStore(options: ProgressStoreOptions = {}): ProgressStore {
  const now = options.now ?? (() => new Date());
  const debounceMs = options.debounceMs ?? 300;
  const persist = options.persist ?? true;
  const persisted = persist && isStorageAvailable();

  let state: Progress = persisted
    ? (readJson(PROGRESS_KEY, isProgress) ?? emptyProgress())
    : emptyProgress();
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let dirty = false;

  const flush = (): void => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (dirty && persisted) {
      writeJson(PROGRESS_KEY, state);
      dirty = false;
    }
  };

  const commit = (next: Progress): void => {
    if (next === state) return;
    state = next;
    dirty = true;
    for (const l of listeners) l();
    if (!persisted) return;
    if (debounceMs <= 0) {
      flush();
      return;
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  };

  const iso = () => now().toISOString();

  return {
    getState: () => state,
    subscribe: (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    persisted,

    markLessonComplete: (id) => {
      if (id in state.completedLessons) return;
      commit({
        ...state,
        completedLessons: { ...state.completedLessons, [id]: { completedAt: iso() } },
      });
    },
    unmarkLesson: (id) => {
      if (!(id in state.completedLessons)) return;
      const { [id]: _removed, ...rest } = state.completedLessons;
      commit({ ...state, completedLessons: rest });
    },
    recordLabResult: (id, result) => {
      const prev = state.labResults[id];
      const record = {
        passed: result.passed || (prev?.passed ?? false),
        attempts: (prev?.attempts ?? 0) + 1,
        lastAttemptAt: iso(),
        ...(result.score !== undefined
          ? { score: Math.max(result.score, prev?.score ?? 0) }
          : prev?.score !== undefined
            ? { score: prev.score }
            : {}),
      };
      commit({ ...state, labResults: { ...state.labResults, [id]: record } });
    },
    recordQuizResult: (quizId, correct, total) => {
      commit({
        ...state,
        quizResults: { ...state.quizResults, [quizId]: { correct, total, at: iso() } },
      });
    },
    setLastVisited: (path) => {
      if (state.lastVisited?.path === path) return;
      commit({ ...state, lastVisited: { path, at: iso() } });
    },
    reset: () => {
      commit(emptyProgress());
      if (persisted) {
        flush();
        removeKey(PROGRESS_KEY);
        dirty = false;
      }
    },

    exportJson: () => JSON.stringify(state, null, 2),
    importJson: (json, mode) => {
      if (json.length > PROGRESS_MAX_BYTES) return { ok: false, reason: 'too-large' };
      let raw: unknown;
      try {
        raw = JSON.parse(json);
      } catch {
        return { ok: false, reason: 'invalid-json' };
      }
      const migrated = migrateProgress(raw);
      if (!migrated.ok) return { ok: false, reason: migrated.reason };
      const incoming = migrated.progress;
      const next: Progress =
        mode === 'replace'
          ? incoming
          : {
              schemaVersion: 1,
              completedLessons: { ...state.completedLessons, ...incoming.completedLessons },
              labResults: { ...state.labResults, ...incoming.labResults },
              quizResults: { ...state.quizResults, ...incoming.quizResults },
              lastVisited: state.lastVisited ?? incoming.lastVisited,
            };
      commit(next);
      flush();
      return {
        ok: true,
        counts: {
          lessons: Object.keys(incoming.completedLessons).length,
          labs: Object.keys(incoming.labResults).length,
          quizzes: Object.keys(incoming.quizResults).length,
        },
      };
    },
    flush,
  };
}
