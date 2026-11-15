/**
 * Global Vitest setup.
 * Extends `expect` with Testing Library's DOM matchers and resets
 * localStorage between tests so persistence logic is always isolated.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
