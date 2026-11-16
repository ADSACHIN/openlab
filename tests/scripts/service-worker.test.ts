import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Script } from 'node:vm';
import { afterEach, describe, expect, it } from 'vitest';
import { precacheManifest, serviceWorkerSource } from '../../scripts/lib/service-worker.mjs';

let dir = '';
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = '';
});

function publicDir(files: Record<string, string>): string {
  dir = mkdtempSync(join(tmpdir(), 'openlab-sw-'));
  mkdirSync(dir, { recursive: true });
  for (const [n, c] of Object.entries(files)) writeFileSync(join(dir, n), c);
  return dir;
}

describe('service worker generation', () => {
  it('precaches bundle and public files, never itself or source maps', () => {
    const pub = publicDir({ 'favicon.svg': '<svg/>', 'manifest.webmanifest': '{}' });
    const { assets } = precacheManifest(
      ['assets/index-a1.js', 'assets/index-a1.js.map', 'sw.js', 'assets/domain-networking-b2.js'],
      pub,
    );
    expect(assets).toEqual([
      './assets/domain-networking-b2.js',
      './assets/index-a1.js',
      './favicon.svg',
      './index.html',
      './manifest.webmanifest',
    ]);
  });

  it('changes version when any file name or public file content changes', () => {
    const pub = publicDir({ 'favicon.svg': '<svg/>' });
    const v1 = precacheManifest(['assets/index-a1.js'], pub).version;
    expect(precacheManifest(['assets/index-a1.js'], pub).version).toBe(v1);
    expect(precacheManifest(['assets/index-a2.js'], pub).version).not.toBe(v1);
    writeFileSync(join(pub, 'favicon.svg'), '<svg id="new"/>');
    expect(precacheManifest(['assets/index-a1.js'], pub).version).not.toBe(v1);
  });

  it('emits syntactically valid JavaScript that caches only its own origin', () => {
    const src = serviceWorkerSource(['./index.html', './assets/x.js'], 'abc123');
    expect(() => new Script(src)).not.toThrow();
    expect(src).toContain("const CACHE = 'openlab-abc123';");
    expect(src).toContain('["./index.html","./assets/x.js"]');
    expect(src).toContain('self.location.origin');
    expect(src).not.toMatch(/https?:\/\//);
    // Regression: crossorigin requests carry Origin; without ignoreVary nothing matched offline.
    expect(src).toContain('ignoreVary: true');
  });
});
