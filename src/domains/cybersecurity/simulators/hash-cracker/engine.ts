import type { SimulatorEngine } from '@core/model';
import { sha256 } from '../../lib/sha256';

export interface Account {
  name: string;
  password: string;
  salt: string;
}

/** Alice and Dave chose the same password; Carol's is not in the attacker's list. */
export const ACCOUNTS: readonly Account[] = [
  { name: 'alice', password: 'sunshine', salt: 'a1f9' },
  { name: 'bob', password: 'qwerty', salt: '7c2e' },
  { name: 'carol', password: 'velvet-otter-71', salt: 'e04b' },
  { name: 'dave', password: 'sunshine', salt: '5d83' },
];

export const WORDLIST: readonly string[] = [
  '123456',
  'password',
  'qwerty',
  'letmein',
  'sunshine',
  'dragon',
  'monkey',
  'football',
  'iloveyou',
  'admin',
];

export function storedHash(a: Account, salted: boolean): string {
  return sha256(salted ? a.salt + a.password : a.password);
}

export interface CrackerState {
  salted: boolean;
  /** Wordlist entries tried so far. */
  index: number;
  cracked: Readonly<Record<string, string>>;
  /** SHA-256 computations the attacker has spent. */
  hashes: number;
}
export interface CrackerAction {
  type: 'set-salted';
  salted: boolean;
}

function init(salted: boolean): CrackerState {
  return { salted, index: 0, cracked: {}, hashes: 0 };
}

export const crackerEngine: SimulatorEngine<CrackerState, CrackerAction> = {
  init: () => init(false),
  step: (s) => {
    const word = WORDLIST[s.index];
    if (word === undefined) return s;
    const cracked = { ...s.cracked };
    let hashes = s.hashes;
    if (s.salted) {
      // Each account has its own salt, so each guess must be hashed once per account.
      for (const a of ACCOUNTS) {
        hashes++;
        if (sha256(a.salt + word) === storedHash(a, true)) cracked[a.name] = word;
      }
    } else {
      // One hash per guess, compared against every stored hash at once.
      hashes++;
      const h = sha256(word);
      for (const a of ACCOUNTS) if (h === storedHash(a, false)) cracked[a.name] = word;
    }
    return { ...s, index: s.index + 1, cracked, hashes };
  },
  isDone: (s) => s.index >= WORDLIST.length,
  apply: (_s, a) => init(a.salted),
  describe: (s) => {
    const n = Object.keys(s.cracked).length;
    const tried = WORDLIST[s.index - 1];
    const head = tried === undefined ? 'No guesses yet.' : `Tried "${tried}".`;
    return `${head} ${String(n)} of ${String(ACCOUNTS.length)} accounts cracked after ${String(s.hashes)} hash computations (${s.salted ? 'salted' : 'unsalted'}).`;
  },
};
