import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { BUDGET, evaluate, initialAssets, measure } from '../../scripts/lib/budget.mjs';

const HTML = `<!doctype html><html><head>
<script type="module" crossorigin src="/openlab/assets/index-abc.js"></script>
<link rel="modulepreload" crossorigin href="/openlab/assets/react-def.js">
<link rel="stylesheet" crossorigin href="/openlab/assets/index-ghi.css">
<link rel="icon" href="./favicon.svg">
</head></html>`;

let dir = '';
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = '';
});

function fakeDist(files: Record<string, string>): string {
  dir = mkdtempSync(join(tmpdir(), 'openlab-budget-'));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  return dir;
}

describe('performance budget', () => {
  it('finds what a first visit downloads', () => {
    expect(initialAssets(HTML)).toEqual({
      js: ['assets/index-abc.js', 'assets/react-def.js'],
      css: ['assets/index-ghi.css'],
    });
  });

  it('separates initial and lazy chunks and passes a small build', () => {
    const d = fakeDist({
      'index.html': HTML,
      'assets/index-abc.js': 'console.log(1)',
      'assets/react-def.js': 'export {}',
      'assets/index-ghi.css': 'body{}',
      'assets/domain-networking-xyz.js': 'export const a = 1',
      'favicon.svg': '<svg/>',
    });
    const r = measure(d);
    expect(r.initialJs.map((m) => m.file)).toEqual(['assets/index-abc.js', 'assets/react-def.js']);
    expect(r.lazyChunks.map((m) => m.file)).toEqual(['assets/domain-networking-xyz.js']);
    expect(evaluate(r)).toEqual([]);
  });

  it('reports every kind of violation', () => {
    // High-entropy but deterministic text (xorshift), so gzip cannot shrink it much.
    const big = (kb: number) => {
      let x = 2463534242;
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let s = '';
      for (let k = 0; k < kb * 1024; k++) {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        s += alphabet.charAt((x >>> 0) % 64);
      }
      return s;
    };
    const d = fakeDist({
      'index.html': HTML,
      'assets/index-abc.js': big(160),
      'assets/react-def.js': '',
      'assets/index-ghi.css': big(16),
      'assets/domain-huge-xyz.js': big(24),
    });
    const v = evaluate(measure(d), { ...BUDGET, totalBytes: 100 * 1024 });
    expect(v).toHaveLength(4);
    expect(v.join('\n')).toMatch(/Initial JavaScript/);
    expect(v.join('\n')).toMatch(/Initial CSS/);
    expect(v.join('\n')).toMatch(/domain-huge-xyz\.js/);
    expect(v.join('\n')).toMatch(/whole build/);
  });
});
