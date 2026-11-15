import { createContext, useContext } from 'react';
import type { Progress, ProgressStore } from '@core/progress';

export interface ProgressContextValue {
  progress: Progress;
  store: ProgressStore;
}

export const ProgressContext = createContext<ProgressContextValue | null>(null);

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
