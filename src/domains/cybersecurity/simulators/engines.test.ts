import { describe, expect, it } from 'vitest';
import { ALPHABET, caesarEngine, ciphertextOf, englishScore, shiftText } from './caesar/engine';
import { ACCOUNTS, WORDLIST, crackerEngine, storedHash } from './hash-cracker/engine';
import { COMMON_PASSWORDS, humanDuration, strength } from './password/engine';
import { SqlError, USERS, buildQuery, login, parseWhere, tokenize } from './sqli/engine';
import { analyse, escapeHtml, renderComment, xssEngine } from './xss/engine';

function account(name: string) {
  const a = ACCOUNTS.find((x) => x.name === name);
  if (!a) throw new Error(`no account ${name}`);
  return a;
}

function runAll<S>(
  engine: { init: (seed: number) => S; step: (s: S) => S; isDone?: (s: S) => boolean },
  from?: S,
  max = 1000,
): S {
  let s = from ?? engine.init(1);
  for (let i = 0; i < max && !engine.isDone?.(s); i++) s = engine.step(s);
  return s;
}

describe('caesar', () => {
  it('encrypts, decrypts and is found by brute force', () => {
    expect(shiftText('attack at dawn', 3)).toBe('dwwdfn dw gdzq');
    expect(shiftText('Hello, World', 13)).toBe('Uryyb, Jbeyq');
    expect(shiftText(shiftText('Zebra', 25), -25)).toBe('Zebra');
    expect(englishScore('attack at dawn')).toBe(3);
    const end = runAll(caesarEngine);
    expect(end.tried).toBe(ALPHABET);
    expect(end.best).toEqual({ key: 3, score: 3 });
    expect(ciphertextOf(end)).toBe('dwwdfn dw gdzq');
  });
});

describe('password strength', () => {
  it('matches the numbers stated in the lesson', () => {
    const sunshine = strength('sunshine');
    expect(sunshine.common).toBe(true);
    expect(sunshine.bits).toBeCloseTo(37.6, 1);
    expect(sunshine.seconds).toBe(0);
    const troubador = strength('Tr0ub4dor&3');
    expect(troubador.pool).toBe(95);
    expect(troubador.bits).toBeCloseTo(72.3, 1);
    const horse = strength('correcthorsebatterystaple');
    expect(horse.bits).toBeCloseTo(117.5, 1);
    // Four words drawn uniformly from a 2048-word list:
    expect(4 * Math.log2(2048)).toBe(44);
    expect(COMMON_PASSWORDS).toContain('password');
  });

  it('formats durations', () => {
    expect(humanDuration(0.2)).toBe('instantly');
    expect(humanDuration(90)).toBe('2 minutes');
    expect(humanDuration(2 * 86_400)).toBe('2 days');
    expect(humanDuration(strength('Tr0ub4dor&3').seconds)).toBe('9,012 years');
    // Four random words from a 2048-word list (44 bits): fast hash vs a slow hash at ~10,000 guesses/s.
    expect(humanDuration(2 ** 43 / 1e10)).toBe('15 minutes');
    expect(humanDuration(2 ** 43 / 1e4)).toBe('28 years');
  });
});

describe('hash cracker', () => {
  it('unsalted: duplicates are visible and one hash per guess suffices', () => {
    expect(storedHash(account('alice'), false)).toBe(storedHash(account('dave'), false));
    const end = runAll(crackerEngine);
    expect(end.hashes).toBe(WORDLIST.length);
    expect(end.cracked).toEqual({ alice: 'sunshine', bob: 'qwerty', dave: 'sunshine' });
  });

  it('salted: same cracks, but four times the work and no visible duplicates', () => {
    expect(storedHash(account('alice'), true)).not.toBe(storedHash(account('dave'), true));
    const end = runAll(
      crackerEngine,
      crackerEngine.apply?.(crackerEngine.init(1), { type: 'set-salted', salted: true }),
    );
    expect(end.hashes).toBe(WORDLIST.length * ACCOUNTS.length);
    expect(end.hashes).toBe(40);
    expect(Object.keys(end.cracked).sort()).toEqual(['alice', 'bob', 'dave']);
  });
});

describe('sql injection', () => {
  it('parses with AND binding tighter than OR, and comments', () => {
    const alice = USERS.find((u) => u.name === 'alice');
    if (!alice) throw new Error('fixture');
    expect(parseWhere("name = 'x' AND password = '' OR '1'='1'")(alice)).toBe(true);
    expect(parseWhere("name = 'alice' -- AND password = 'nope'")(alice)).toBe(true);
    expect(tokenize("name = 'a' -- ignored")).toHaveLength(3);
    expect(() => parseWhere("name = 'O'Brien'")).toThrow(SqlError);
    expect(() => parseWhere("email = 'x'")).toThrow(/no such column/);
  });

  it('concatenated login falls to the classic payloads', () => {
    expect(login('concatenated', 'alice', 's3cret!')).toEqual({
      kind: 'ok',
      user: 'alice',
      rows: 1,
    });
    expect(login('concatenated', 'alice', 'wrong')).toEqual({ kind: 'denied' });
    expect(login('concatenated', "admin' --", 'anything')).toEqual({
      kind: 'ok',
      user: 'admin',
      rows: 1,
    });
    expect(login('concatenated', 'x', "' OR '1'='1")).toEqual({
      kind: 'ok',
      user: 'alice',
      rows: 3,
    });
    expect(login('concatenated', "O'Brien", 'pw')).toEqual({
      kind: 'error',
      message: 'unterminated string literal',
    });
    expect(buildQuery("admin' --", 'p')).toBe(
      "SELECT * FROM users WHERE name = 'admin' --' AND password = 'p'",
    );
  });

  it('parameterized login treats every payload as data', () => {
    expect(login('parameterized', "admin' --", 'anything')).toEqual({ kind: 'denied' });
    expect(login('parameterized', 'x', "' OR '1'='1")).toEqual({ kind: 'denied' });
    expect(login('parameterized', "O'Brien", 'pw')).toEqual({ kind: 'denied' });
    expect(login('parameterized', 'admin', 'Xk9#qL2!')).toEqual({
      kind: 'ok',
      user: 'admin',
      rows: 1,
    });
  });
});

describe('xss', () => {
  it('detects the three classic vectors in raw output', () => {
    expect(analyse(renderComment("<script>alert('xss')</script>", 'raw'))).toEqual({
      executes: true,
      code: "alert('xss')",
      vector: 'script tag',
    });
    expect(analyse(renderComment('<img src=x onerror="steal()">', 'raw'))).toMatchObject({
      executes: true,
      code: 'steal()',
      vector: 'event handler',
    });
    expect(analyse(renderComment('<a href="javascript:steal()">x</a>', 'raw'))).toMatchObject({
      executes: true,
      vector: 'javascript: URL',
    });
    expect(analyse(renderComment('This is <b>important</b>', 'raw')).executes).toBe(false);
  });

  it('escaping neutralises every payload', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
    for (const p of [
      "<script>alert('xss')</script>",
      '<img src=x onerror="steal()">',
      '<a href="javascript:steal()">x</a>',
    ]) {
      const html = renderComment(p, 'escaped');
      expect(html).not.toMatch(/<(?!p class="comment">|\/p>)/);
      expect(analyse(html).executes).toBe(false);
    }
    expect(xssEngine.describe({ input: '<script>x()</script>', mode: 'escaped' })).toBe(
      'Escaped output: shown as text, nothing runs.',
    );
  });
});

describe('password length counting', () => {
  it('counts an emoji as one character', () => {
    expect(strength('ab👍🏽').length).toBe(3);
  });
});
