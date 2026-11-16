// @ts-check
/**
 * Offline support without a dependency (Phase 5, ADR-0011).
 *
 * At build time this Vite plugin lists every emitted file plus the public
 * folder, derives a version from them (bundle file names already carry content
 * hashes), and writes `sw.js`. The worker precaches those files only: it never
 * stores learner data and never talks to any other origin.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * @param {readonly string[]} assets URLs relative to the worker's scope, e.g. "./assets/index-abc.js"
 * @param {string} version
 * @returns {string} the service worker's source
 */
export function serviceWorkerSource(assets, version) {
  return `/* OPENLAB service worker ${version}. Generated at build time; caches only this site's own files. */
const CACHE = 'openlab-${version}';
const ASSETS = ${JSON.stringify(assets)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('openlab-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Network first so a new deploy is picked up; the cached shell keeps working offline.
    event.respondWith(fetch(request).catch(() => caches.match('./index.html').then((cached) => cached ?? Response.error())));
    return;
  }
  // ignoreVary: module scripts and stylesheets are requested with crossorigin, so they carry an
  // Origin header that the precache requests did not; servers answering "Vary: Origin" would
  // otherwise never match. Safe because every cached file is static and versioned.
  event.respondWith(caches.match(request, { ignoreVary: true }).then((cached) => cached ?? fetch(request)));
});
`;
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
function listFiles(dir) {
  if (!existsSync(dir)) return [];
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
  return out;
}

/**
 * The precache list and version for a build.
 * @param {readonly string[]} bundleFiles file names Vite emitted
 * @param {string} publicDir
 * @returns {{ assets: string[]; version: string }}
 */
export function precacheManifest(bundleFiles, publicDir) {
  const publicFiles = listFiles(publicDir);
  const files = [...new Set([...bundleFiles, ...publicFiles, 'index.html'])]
    .filter((f) => f !== 'sw.js' && !f.endsWith('.map'))
    .sort();
  const hash = createHash('sha256').update(files.join('\n'));
  // Public files have no hash in their names, so their contents go into the version too.
  for (const f of publicFiles) hash.update(readFileSync(join(publicDir, f)));
  return { assets: files.map((f) => `./${f}`), version: hash.digest('hex').slice(0, 12) };
}

/**
 * @param {{ publicDir?: string }} [options]
 * @returns {import('vite').Plugin}
 */
export function serviceWorkerPlugin({ publicDir = 'public' } = {}) {
  return {
    name: 'openlab:service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const { assets, version } = precacheManifest(Object.keys(bundle), publicDir);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: serviceWorkerSource(assets, version),
      });
    },
  };
}
