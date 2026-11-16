import { describe, expect, it } from 'vitest';
import {
  canAccess,
  children,
  chmod,
  createHomeFs,
  mkdir,
  modeToString,
  normalize,
  parseMode,
  remove,
  writeFile,
} from './vfs';

describe('vfs', () => {
  it('normalizes paths', () => {
    expect(normalize('..', '/home/learner')).toBe('/home');
    expect(normalize('./projects/../notes.txt', '/home/learner')).toBe('/home/learner/notes.txt');
    expect(normalize('~/.ssh', '/tmp')).toBe('/home/learner/.ssh');
    expect(normalize('/', '/tmp')).toBe('/');
    expect(normalize('/../etc//hostname', '/')).toBe('/etc/hostname');
  });

  it('lists children and renders modes', () => {
    const fs = createHomeFs();
    expect(children(fs, '/')).toEqual(['bin', 'etc', 'home', 'proc', 'tmp', 'usr', 'var']);
    expect(children(fs, '/home/learner')).toEqual(['.ssh', 'notes.txt', 'projects']);
    expect(modeToString(0o755, 'dir')).toBe('drwxr-xr-x');
    expect(modeToString(0o600, 'file')).toBe('-rw-------');
    expect(parseMode('644')).toBe(0o644);
    expect(parseMode('999')).toBeNull();
  });

  it('enforces owner vs other bits', () => {
    const fs = createHomeFs();
    const shadow = fs['/etc/shadow'];
    const notes = fs['/home/learner/notes.txt'];
    if (!shadow || !notes) throw new Error('fixture');
    expect(canAccess(shadow, 'learner', 'r')).toBe(false);
    expect(canAccess(shadow, 'root', 'r')).toBe(true);
    expect(canAccess(notes, 'learner', 'w')).toBe(true);
    expect(canAccess(notes, 'root', 'w')).toBe(false);
  });

  it('mutates immutably with errors mirroring coreutils', () => {
    const fs = createHomeFs();
    const r1 = mkdir(fs, '/home/learner/code', 'learner');
    expect(r1.ok && children(r1.fs, '/home/learner')).toContain('code');
    expect(children(fs, '/home/learner')).not.toContain('code');
    expect(mkdir(fs, '/etc/x', 'learner')).toMatchObject({
      ok: false,
      error: expect.stringContaining('Permission denied') as string,
    });
    const w = writeFile(fs, '/home/learner/a.txt', 'hi\n', 'learner');
    expect(w.ok && w.fs['/home/learner/a.txt']?.content).toBe('hi\n');
    const w2 = w.ok ? writeFile(w.fs, '/home/learner/a.txt', 'there\n', 'learner', true) : w;
    expect(w2.ok && w2.fs['/home/learner/a.txt']?.content).toBe('hi\nthere\n');
    expect(remove(fs, '/home/learner/projects', 'learner', false)).toMatchObject({ ok: false });
    const rr = remove(fs, '/home/learner/projects', 'learner', true);
    expect(rr.ok && Object.keys(rr.fs).some((p) => p.startsWith('/home/learner/projects'))).toBe(
      false,
    );
    const c = chmod(fs, '/home/learner/.ssh/id_ed25519', 0o600, 'learner');
    expect(c.ok && c.fs['/home/learner/.ssh/id_ed25519']?.mode).toBe(0o600);
    expect(chmod(fs, '/etc/hostname', 0o777, 'learner')).toMatchObject({ ok: false });
  });
});
