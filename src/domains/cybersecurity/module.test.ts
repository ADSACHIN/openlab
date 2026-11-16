import { describe, expect, it } from 'vitest';
import { createRegistry } from '@core/registry';
import { programmingModule } from '@domains/programming';
import { foreignDomains } from '@app/moduleStore';
import { cybersecurityModule } from './index';
import { sqliEngine } from './simulators/sqli/engine';
import { xssEngine } from './simulators/xss/engine';

describe('cybersecurity module', () => {
  // SQL injection lists a Programming lesson as a prerequisite, so the registry needs both.
  const registry = createRegistry([cybersecurityModule, programmingModule]);

  it('declares its cross-domain dependency and orders lessons', () => {
    expect(foreignDomains(cybersecurityModule)).toEqual(['programming']);
    expect(() => createRegistry([cybersecurityModule])).toThrow(
      /unknown lesson "programming\/state-and-steps"/,
    );
    expect(registry.lessonsFor('cybersecurity').map((l) => l.slug)).toEqual([
      'encryption-and-keys',
      'passwords-and-entropy',
      'hashing-and-salting',
      'sql-injection',
      'cross-site-scripting',
    ]);
    expect(registry.prerequisitesOf('cybersecurity/sql-injection').map((l) => l.id)).toEqual([
      'programming/state-and-steps',
    ]);
  });

  it('grades the bypass lab', () => {
    const lab = registry.getLab('cybersecurity/bypass-the-login');
    const run = (u: string, p: string, mode: 'concatenated' | 'parameterized' = 'concatenated') => {
      let s = sqliEngine.init(1);
      s = sqliEngine.apply?.(s, { type: 'set-mode', mode }) ?? s;
      s = sqliEngine.apply?.(s, { type: 'set-username', value: u }) ?? s;
      s = sqliEngine.apply?.(s, { type: 'set-password', value: p }) ?? s;
      return sqliEngine.apply?.(s, { type: 'submit' }) ?? s;
    };
    expect(lab?.check(sqliEngine.init(1))).toMatchObject({ passed: false, score: 0 });
    expect(lab?.check(run('admin', 'wrong'))).toMatchObject({ passed: false, score: 10 });
    expect(lab?.check(run('admin', 'Xk9#qL2!'))).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(run('x', "' OR '1'='1"))).toMatchObject({ passed: false, score: 60 });
    expect(lab?.check(run("O'Brien", 'x'))).toMatchObject({ passed: false, score: 40 });
    expect(lab?.check(run("admin' --", 'x', 'parameterized'))).toMatchObject({
      passed: false,
      score: 40,
    });
    expect(lab?.check(run("admin' --", 'x'))).toMatchObject({ passed: true, score: 100 });
  });

  it('grades the escape lab', () => {
    const lab = registry.getLab('cybersecurity/neutralise-the-payload');
    const s = (input: string, mode: 'raw' | 'escaped') => ({ ...xssEngine.init(1), input, mode });
    expect(lab?.check(s('hello', 'escaped'))).toMatchObject({ passed: false, score: 20 });
    expect(lab?.check(s('<script>x()</script>', 'raw'))).toMatchObject({
      passed: false,
      score: 50,
    });
    expect(lab?.check(s('<script>x()</script>', 'escaped'))).toMatchObject({
      passed: true,
      score: 100,
    });
  });
});
