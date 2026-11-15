/**
 * The only module allowed to touch `localStorage`.
 * Every call is defensive: private mode, disabled storage, quota errors and
 * corrupt JSON all degrade to "nothing stored" instead of throwing.
 */
const PREFIX = 'openlab:';

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const s = window.localStorage;
    // Some browsers expose the object but throw on access.
    const probe = `${PREFIX}__probe__`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export type Guard<T> = (value: unknown) => value is T;

/** Read and validate a JSON value. Returns `null` when missing, invalid or unavailable. */
export function readJson<T>(key: string, guard: Guard<T>): T | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(PREFIX + key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Persist a JSON-serialisable value. Returns `false` if storage is unavailable or full. */
export function writeJson(key: string, value: unknown): boolean {
  const s = storage();
  if (!s) return false;
  try {
    s.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** True when storage is usable right now. */
export function isStorageAvailable(): boolean {
  return storage() !== null;
}
