import { useMediaQuery } from './useMediaQuery';

/** True when the OS asks for reduced motion. In-app override is handled by the preferences provider. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
