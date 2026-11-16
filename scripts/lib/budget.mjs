// @ts-check
/**
 * Performance budget for the static build (Phase 5).
 * Plain JavaScript with JSDoc types so it runs on any Node ≥ 20 without a
 * TypeScript loader; `tsc` type-checks it via tsconfig.node.json (checkJs).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

/** @typedef {{ file: string; bytes: number; gzip: number }} Measured */
/** @typedef {{ initialJsGzip: number; initialCssGzip: number; lazyChunkGzip: number; totalBytes: number }} Budget */
/** @typedef {{ initialJs: Measured[]; initialCss: Measured[]; lazyChunks: Measured[]; totalBytes: number }} Report */

const KB = 1024;

/** Limits chosen with headroom over the 2026-11-16 build (see docs/development/PERFORMANCE.md). */
export const BUDGET = Object.freeze({
  initialJsGzip: 110 * KB,
  initialCssGzip: 10 * KB,
  lazyChunkGzip: 16 * KB,
  totalBytes: 900 * KB,
});

/**
 * Files a first visit downloads, read from the built index.html.
 * @param {string} html
 * @returns {{ js: string[]; css: string[] }}
 */
export function initialAssets(html) {
  /** @type {string[]} */
  const js = [];
  /** @type {string[]} */
  const css = [];
  for (const m of html.matchAll(/<(script|link)\b([^>]*)>/g)) {
    const attrs = m[2] ?? '';
    const url = /(?:src|href)="[^"]*?(assets\/[^"]+)"/.exec(attrs)?.[1];
    if (!url) continue;
    if (m[1] === 'script' || /rel="modulepreload"/.test(attrs)) js.push(url);
    else if (/rel="stylesheet"/.test(attrs)) css.push(url);
  }
  return { js, css };
}

/**
 * @param {string} dir
 * @returns {string[]} file paths relative to `dir`, with forward slashes
 */
function listFiles(dir) {
  /** @type {string[]} */
  const out = [];
  /** @param {string} d */
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(dir, p).split(sep).join('/'));
    }
  };
  walk(dir);
  return out.sort();
}

/**
 * @param {string} distDir
 * @param {string} file
 * @returns {Measured}
 */
function measureFile(distDir, file) {
  const buf = readFileSync(join(distDir, file));
  return { file, bytes: buf.length, gzip: gzipSync(buf).length };
}

/**
 * @param {string} distDir
 * @returns {Report}
 */
export function measure(distDir) {
  const files = listFiles(distDir);
  const { js, css } = initialAssets(readFileSync(join(distDir, 'index.html'), 'utf8'));
  const initial = new Set([...js, ...css]);
  return {
    initialJs: js.map((f) => measureFile(distDir, f)),
    initialCss: css.map((f) => measureFile(distDir, f)),
    lazyChunks: files
      .filter((f) => f.startsWith('assets/') && f.endsWith('.js') && !initial.has(f))
      .map((f) => measureFile(distDir, f)),
    totalBytes: files.reduce((n, f) => n + statSync(join(distDir, f)).size, 0),
  };
}

/** @param {readonly Measured[]} xs */
const sumGzip = (xs) => xs.reduce((n, x) => n + x.gzip, 0);

/** @param {number} n */
export const kb = (n) => `${(n / KB).toFixed(1)} KB`;

/**
 * @param {Report} r
 * @param {Budget} [budget]
 * @returns {string[]} human-readable violations; empty when within budget
 */
export function evaluate(r, budget = BUDGET) {
  /** @type {string[]} */
  const out = [];
  const js = sumGzip(r.initialJs);
  if (js > budget.initialJsGzip)
    out.push(`Initial JavaScript is ${kb(js)} gzipped (budget ${kb(budget.initialJsGzip)}).`);
  const css = sumGzip(r.initialCss);
  if (css > budget.initialCssGzip)
    out.push(`Initial CSS is ${kb(css)} gzipped (budget ${kb(budget.initialCssGzip)}).`);
  for (const c of r.lazyChunks) {
    if (c.gzip > budget.lazyChunkGzip)
      out.push(
        `${c.file} is ${kb(c.gzip)} gzipped (budget ${kb(budget.lazyChunkGzip)} per lazy chunk).`,
      );
  }
  if (r.totalBytes > budget.totalBytes)
    out.push(`The whole build is ${kb(r.totalBytes)} (budget ${kb(budget.totalBytes)}).`);
  return out;
}

/**
 * @param {Report} r
 * @param {Budget} [budget]
 */
export function formatReport(r, budget = BUDGET) {
  const row = (
    /** @type {string} */ label,
    /** @type {number} */ value,
    /** @type {number} */ limit,
  ) =>
    `${label.padEnd(34)} ${kb(value).padStart(10)}  / ${kb(limit).padStart(9)}  ${value <= limit ? 'ok' : 'OVER'}`;
  const largestLazy = r.lazyChunks.reduce((m, c) => (c.gzip > m.gzip ? c : m), {
    file: '-',
    bytes: 0,
    gzip: 0,
  });
  return [
    row('Initial JavaScript (gzip)', sumGzip(r.initialJs), budget.initialJsGzip),
    row('Initial CSS (gzip)', sumGzip(r.initialCss), budget.initialCssGzip),
    row(`Largest lazy chunk (gzip)`, largestLazy.gzip, budget.lazyChunkGzip),
    row('Whole build (raw)', r.totalBytes, budget.totalBytes),
    `  largest lazy chunk: ${largestLazy.file}; ${String(r.lazyChunks.length)} lazy chunks in total`,
  ].join('\n');
}
