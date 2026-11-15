import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
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
 * Mirrors docs/security/SECURITY_POLICY.md.
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
  "frame-ancestors 'none'",
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
  plugins: [react(), cspPlugin],
  resolve: {
    alias: {
      '@': src(''),
      '@app': src('app'),
      '@core': src('core'),
      '@components': src('components'),
      '@domains': src('domains'),
      '@data': src('data'),
      '@hooks': src('hooks'),
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
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
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
