import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { DomainModule } from '@core/model';
import { createRegistry } from '@core/registry';
import { buildSearchIndex } from '@core/search';
import { RegistryContext } from './RegistryContext';

export function RegistryProvider({
  modules,
  children,
}: {
  modules: readonly DomainModule[];
  children: ReactNode;
}) {
  const value = useMemo(() => {
    const registry = createRegistry(modules);
    return { registry, searchIndex: buildSearchIndex(registry) };
  }, [modules]);
  return <RegistryContext value={value}>{children}</RegistryContext>;
}
