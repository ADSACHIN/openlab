import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  lessonFiles,
  simulatorFiles,
  simulatorRegistration,
  toCamel,
  toPascal,
  validate,
  writeNew,
} from '../../scripts/lib/scaffold.mjs';

let root = '';
afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = '';
});

function fakeRepo(): string {
  root = mkdtempSync(join(tmpdir(), 'openlab-scaffold-'));
  mkdirSync(join(root, 'src/domains/networking'), { recursive: true });
  writeFileSync(join(root, 'src/domains/networking/index.ts'), 'export {};');
  return root;
}

describe('scaffolding', () => {
  it('names things consistently', () => {
    expect(toPascal('arp-table')).toBe('ArpTable');
    expect(toCamel('arp-table')).toBe('arpTable');
    expect(toCamel('tcp2-handshake')).toBe('tcp2Handshake');
  });

  it('validates domain and slug', () => {
    const r = fakeRepo();
    expect(validate(r, 'networking', 'arp-table')).toBeNull();
    expect(validate(r, 'astrology', 'x')).toMatch(/Unknown domain/);
    expect(validate(r, 'networking', 'Bad Slug')).toMatch(/kebab-case/);
    expect(validate(r, 'networking', 'double--dash')).toMatch(/kebab-case/);
  });

  it('produces the expected files and a registration snippet', () => {
    expect(Object.keys(lessonFiles('networking', 'http-basics'))).toEqual([
      'src/domains/networking/lessons/http-basics.ts',
    ]);
    expect(Object.keys(simulatorFiles('networking', 'arp-table')).sort()).toEqual([
      'src/domains/networking/simulators/arp-table/ArpTableView.module.css',
      'src/domains/networking/simulators/arp-table/ArpTableView.tsx',
      'src/domains/networking/simulators/arp-table/engine.test.ts',
      'src/domains/networking/simulators/arp-table/engine.ts',
    ]);
    expect(
      lessonFiles('networking', 'http-basics')['src/domains/networking/lessons/http-basics.ts'],
    ).toContain("slug: 'http-basics'");
    expect(simulatorRegistration('arp-table')).toContain(
      'engine: arpTableEngine, View: ArpTableView',
    );
  });

  it('writes files but never overwrites', () => {
    const r = fakeRepo();
    const files = lessonFiles('networking', 'http-basics');
    expect(writeNew(r, files)).toEqual(Object.keys(files));
    expect(existsSync(join(r, 'src/domains/networking/lessons/http-basics.ts'))).toBe(true);
    expect(() => writeNew(r, files)).toThrow(/Refusing to overwrite/);
  });
});
