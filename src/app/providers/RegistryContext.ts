import { createContext, useContext } from 'react';
import type { Registry } from '@core/registry';
import type { SearchIndex } from '@core/search';

export interface RegistryContextValue {
  registry: Registry;
  searchIndex: SearchIndex;
}

export const RegistryContext = createContext<RegistryContextValue | null>(null);

export function useRegistry(): RegistryContextValue {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useRegistry must be used inside <RegistryProvider>');
  return ctx;
}
