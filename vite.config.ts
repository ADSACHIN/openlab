import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { serviceWorkerPlugin } from './scripts/lib/service-worker.mjs';
import { fileURLToPath, URL } from 'node:url';

/**
 * OPENLAB Vite + Vitest configuration (single file, as Vitest recommends).
 *
 * - `base` is the repository name because the site is served from
 *   https://adsachin.github.io/openlab/. HashRouter means no server-side
 *   routing configuration is needed on GitHub Pages.
 * - Set VITE_BASE_PATH="/" when deploying to a custom domain or root.
 * - Vite 8 bundles with Rolldown; vendor chunking uses `codeSplitting`.
 */
/**
 * Content Security Policy, injected only into the production build: the dev
 * server needs inline scripts (React Fast Refresh) and a websocket (HMR).
 * Mirrors docs/security/SECURITY_POLICY.md. frame-ancestors is omitted on purpose: browsers ignore it
 * in a meta-delivered policy and log a console error.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

const cspPlugin: Plugin = {
  name: 'openlab:csp',
  apply: 'build',
  transformIndexHtml: () => [
    {
      tag: 'meta',
      attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
      injectTo: 'head-prepend',
    },
  ],
};

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/openlab/',
  plugins: [react(), cspPlugin, serviceWorkerPlugin()],
  resolve: {
    alias: {
      '@': src(''),
      '@app': src('app'),
      '@core': src('core'),
      '@components': src('components'),
      '@domains': src('domains'),
      '@data': src('data'),
      '@hooks': src('hooks'),
      '@i18n': src('i18n'),
      '@styles': src('styles'),
      '@typings': src('types'),
      '@utils': src('utils'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rolldownOptions: {
      output: {
        // Keep React in a stable chunk so it caches well between deploys (Rolldown codeSplitting).
        // Name lazy domain chunks after their domain, e.g. assets/domain-networking-<hash>.js.
        chunkFileNames: (chunk: { facadeModuleId: string | null }) => {
          const m = /\/src\/domains\/([^/]+)\//.exec(chunk.facadeModuleId ?? '');
          return m ? `assets/domain-${m[1]}-[hash].js` : 'assets/[name]-[hash].js';
        },
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Generous: user-event tests can exceed 5 s on a loaded laptop without anything being wrong.
    testTimeout: 15_000,
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/scripts/**/*.test.ts',
      // Opt-in timing (skipped unless VITE_BENCH=1): see tests/bench/engines.test.ts.
      'tests/bench/**/*.test.ts',
    ],
    exclude: ['node_modules', 'dist', 'tests/e2e', 'tests/accessibility'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts', 'src/**/*.stories.tsx'],
    },
  },
});
