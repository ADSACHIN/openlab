import type { SimulatorEngine } from '@core/model';

export const POOLS = [
  { name: 'lowercase', size: 26, test: /[a-z]/ },
  { name: 'uppercase', size: 26, test: /[A-Z]/ },
  { name: 'digits', size: 10, test: /[0-9]/ },
  // 32 ASCII punctuation characters plus space
  { name: 'symbols', size: 33, test: /[^a-zA-Z0-9]/ },
] as const;

/** Guesses per second for an offline attack on a fast, unsalted hash with one modern GPU rig. */
export const GUESSES_PER_SECOND = 1e10;

export const COMMON_PASSWORDS: readonly string[] = [
  '123456',
  'password',
  '123456789',
  'qwerty',
  '12345678',
  'letmein',
  'sunshine',
  'dragon',
  'monkey',
  'football',
  'iloveyou',
  'admin',
  'welcome',
  'abc123',
  'password1',
];

export interface Strength {
  length: number;
  pool: number;
  pools: readonly string[];
  /** Naive entropy: length × log2(pool). Only meaningful for randomly generated passwords. */
  bits: number;
  common: boolean;
  /** Average seconds to brute-force (half the space) at GUESSES_PER_SECOND. 0 if common. */
  seconds: number;
}

export function strength(password: string): Strength {
  const used = POOLS.filter((p) => p.test.test(password));
  const pool = used.reduce((n, p) => n + p.size, 0);
  // Count user-perceived characters (grapheme clusters), so an emoji is one character, not several.
  const length = [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(password)]
    .length;
  const bits = pool === 0 ? 0 : length * Math.log2(pool);
  const common = COMMON_PASSWORDS.includes(password.toLowerCase());
  return {
    length,
    pool,
    pools: used.map((p) => p.name),
    bits,
    common,
    seconds: common ? 0 : 2 ** (bits - 1) / GUESSES_PER_SECOND,
  };
}

export function humanDuration(seconds: number): string {
  if (seconds < 1) return 'instantly';
  const units: readonly [string, number][] = [
    ['years', 31_557_600],
    ['days', 86_400],
    ['hours', 3_600],
    ['minutes', 60],
    ['seconds', 1],
  ];
  for (const [name, size] of units) {
    if (seconds >= size) {
      const v = seconds / size;
      if (name === 'years' && v >= 1e6)
        return `${v.toExponential(1).replace('e+', ' × 10^')} years`;
      return `${Math.round(v).toLocaleString('en-US')} ${name}`;
    }
  }
  return 'instantly';
}

export interface PasswordState {
  password: string;
}
export interface PasswordAction {
  type: 'set';
  password: string;
}

export const PASSWORD_EXAMPLES: readonly string[] = [
  'sunshine',
  'Tr0ub4dor&3',
  'correcthorsebatterystaple',
  'q7$Lm2#vX9!p',
];

export const passwordEngine: SimulatorEngine<PasswordState, PasswordAction> = {
  init: () => ({ password: 'sunshine' }),
  // Playing cycles through the examples.
  step: (s) => {
    const i = PASSWORD_EXAMPLES.indexOf(s.password);
    return { password: PASSWORD_EXAMPLES[(i + 1) % PASSWORD_EXAMPLES.length] ?? 'sunshine' };
  },
  isDone: () => false,
  apply: (_s, a) => ({ password: a.password.slice(0, 64) }),
  describe: (s) => {
    const r = strength(s.password);
    if (s.password === '') return 'Type a password to estimate it.';
    if (r.common)
      return `${String(r.length)} characters, but it is on the common-password list: guessed instantly.`;
    return `${String(r.length)} characters from a pool of ${String(r.pool)}: about ${r.bits.toFixed(1)} bits if chosen at random. Average brute-force time: ${humanDuration(r.seconds)}.`;
  },
};
