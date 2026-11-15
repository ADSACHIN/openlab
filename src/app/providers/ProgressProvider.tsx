import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createProgressStore } from '@core/progress';
import type { ProgressStore } from '@core/progress';
import { ProgressContext } from './ProgressContext';

export function ProgressProvider({
  children,
  store: injected,
}: {
  children: ReactNode;
  store?: ProgressStore;
}) {
  const [store] = useState(() => injected ?? createProgressStore());
  const progress = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  // Don't lose a debounced write when the tab is closed or backgrounded.
  useEffect(() => {
    const flush = () => {
      store.flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
      store.flush();
    };
  }, [store]);

  const value = useMemo(() => ({ progress, store }), [progress, store]);
  return <ProgressContext value={value}>{children}</ProgressContext>;
}
