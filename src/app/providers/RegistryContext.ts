import { createContext, use, useContext, useSyncExternalStore } from 'react';
import type { ModuleSnapshot, ModuleStore } from '@app/moduleStore';

export const ModuleStoreContext = createContext<ModuleStore | null>(null);

/**
 * A promise React already knows is fulfilled: `use()` reads its `status` and returns
 * without suspending. Calling `use()` on every render (with this when nothing needs
 * loading) keeps hook order stable, which React requires after a component has
 * suspended through `use()`.
 */
const READY: Promise<void> = Object.assign(Promise.resolve(), {
  status: 'fulfilled' as const,
  value: undefined,
});

export function useModuleStore(): ModuleStore {
  const store = useContext(ModuleStoreContext);
  if (!store) throw new Error('useModuleStore must be used inside <RegistryProvider>');
  return store;
}

/** Registry and search index over the domains loaded so far. */
export function useRegistry(): ModuleSnapshot {
  const store = useModuleStore();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/**
 * Ensures the given domains are loaded, suspending the caller until they are.
 * Unregistered ids are ignored, so pages for "coming soon" domains never suspend.
 */
export function useDomains(ids: readonly string[] | 'all'): void {
  const store = useModuleStore();
  // Subscribe so a completed load re-renders the caller.
  useRegistry();
  const targets = ids === 'all' ? store.registered : ids;
  use(store.isLoaded(targets) ? READY : store.load(targets));
}
