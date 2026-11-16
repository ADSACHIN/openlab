import type { ReactNode } from 'react';
import type { ModuleStore } from '@app/moduleStore';
import { ModuleStoreContext } from './RegistryContext';

export function RegistryProvider({ store, children }: { store: ModuleStore; children: ReactNode }) {
  return <ModuleStoreContext value={store}>{children}</ModuleStoreContext>;
}
