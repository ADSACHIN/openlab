/**
 * Shareable lab setups (Phase 6, ADR-0013).
 *
 * Engines are deterministic, so a setup is the learner's *history*, not the
 * state: a positive integer means "that many steps", an object `{ a }` is one
 * learner action. Replaying the log from `init(seed)` reproduces the state
 * exactly, however large it is. Decoded logs are untrusted input.
 */
/** The parts of a simulator engine that replay needs (structurally compatible with SimulatorEngine). */
export interface ReplayableEngine<S, A> {
  init: (seed: number) => S;
  step: (state: S) => S;
  apply?: (state: S, action: A) => S;
  isDone?: (state: S) => boolean;
}

export type LogEntry = number | { readonly a: unknown };
export type ActionLog = readonly LogEntry[];

export const MAX_SETUP_CHARS = 4000;
export const MAX_ENTRIES = 500;
export const MAX_STEPS = 20_000;

export function appendSteps(log: ActionLog, n: number): ActionLog {
  if (n <= 0) return log;
  const last = log[log.length - 1];
  return typeof last === 'number' ? [...log.slice(0, -1), last + n] : [...log, n];
}

export const appendAction = (log: ActionLog, a: unknown): ActionLog => [...log, { a }];

export const totalSteps = (log: ActionLog): number =>
  log.reduce<number>((n, e) => n + (typeof e === 'number' ? e : 0), 0);

function toBase64Url(text: string): string {
  let bin = '';
  for (const byte of new TextEncoder().encode(text)) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): string | null {
  try {
    const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    return new TextDecoder('utf-8', { fatal: true }).decode(
      Uint8Array.from(bin, (c) => c.charCodeAt(0)),
    );
  } catch {
    return null;
  }
}

/** URL-safe encoding, or null if the setup is too long to share as a link. */
export function encodeSetup(log: ActionLog): string | null {
  const encoded = toBase64Url(JSON.stringify(log));
  return encoded.length > MAX_SETUP_CHARS ? null : encoded;
}

function isEntry(e: unknown): e is LogEntry {
  if (typeof e === 'number') return Number.isInteger(e) && e >= 1 && e <= MAX_STEPS;
  if (typeof e !== 'object' || e === null || Array.isArray(e)) return false;
  const keys = Object.keys(e);
  return keys.length === 1 && keys[0] === 'a';
}

/** Strictly validated log, or null for anything malformed, oversized or suspicious. */
export function decodeSetup(text: string): ActionLog | null {
  if (text.length === 0 || text.length > MAX_SETUP_CHARS || !/^[A-Za-z0-9_-]+$/.test(text))
    return null;
  const json = fromBase64Url(text);
  if (json === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length > MAX_ENTRIES || !parsed.every(isEntry)) return null;
  const log = parsed;
  return totalSteps(log) > MAX_STEPS ? null : log;
}

/**
 * Rebuild the state a log describes. Returns null if any action is rejected by
 * throwing or by producing something that is not a state object.
 */
export function replayLog<S, A>(
  engine: ReplayableEngine<S, A>,
  seed: number,
  log: ActionLog,
): S | null {
  try {
    let s = engine.init(seed);
    for (const entry of log) {
      if (typeof entry === 'number') {
        for (let i = 0; i < entry && !(engine.isDone?.(s) ?? false); i++) s = engine.step(s);
      } else {
        if (!engine.apply) return null;
        s = engine.apply(s, entry.a as A);
      }
      if (typeof s !== 'object' || s === null) return null;
    }
    return s;
  } catch {
    return null;
  }
}
