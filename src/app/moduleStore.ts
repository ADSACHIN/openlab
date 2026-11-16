import type { DomainModule } from '@core/model';
import { splitContentId } from '@core/model';
import { createRegistry } from '@core/registry';
import type { Registry } from '@core/registry';
import { buildSearchIndex } from '@core/search';
import type { SearchIndex } from '@core/search';
import type { DomainId } from '@typings/domain';

/**
 * Lazy domain loading (ADR-0009).
 *
 * Each domain is a dynamic import, so its lessons, simulators and views ship
 * as a separate chunk that downloads only when a page needs it. The store
 * also loads any domain referenced by cross-domain prerequisites or
 * simulators, and only exposes modules whose dependencies are all present,
 * so the registry never sees a dangling reference.
 */
export type ModuleLoader = () => Promise<DomainModule>;
export type ModuleLoaders = Partial<Record<DomainId, ModuleLoader>>;

export interface ModuleSnapshot {
  registry: Registry;
  searchIndex: SearchIndex;
  /** Domains whose module (and every dependency) is loaded. */
  loaded: readonly DomainId[];
}

export interface ModuleStore {
  /** Domains that have content, known without downloading anything. */
  readonly registered: readonly DomainId[];
  isRegistered: (id: string) => boolean;
  isLoaded: (ids: readonly string[]) => boolean;
  /** Loads the given domains (and their dependencies). Same request ⇒ same promise until it settles. */
  load: (ids: readonly string[]) => Promise<void>;
  getSnapshot: () => ModuleSnapshot;
  subscribe: (listener: () => void) => () => void;
}

export interface ModuleStoreOptions {
  loaders?: ModuleLoaders;
  /** Modules available synchronously (tests, or a future SSR/prerender pass). */
  preloaded?: readonly DomainModule[];
}

/** Other domains a module points at through prerequisites or simulator ids. */
export function foreignDomains(m: DomainModule): string[] {
  const out = new Set<string>();
  const add = (contentId: string) => {
    const d = splitContentId(contentId)?.domainId;
    if (d !== undefined && d !== m.id) out.add(d);
  };
  for (const l of m.lessons) {
    l.prerequisites.forEach(add);
    for (const b of l.blocks) if (b.type === 'interactive') add(b.simulatorId);
  }
  for (const l of m.labs) {
    l.prerequisites.forEach(add);
    add(l.simulatorId);
  }
  return [...out];
}

export function createModuleStore({
  loaders = {},
  preloaded = [],
}: ModuleStoreOptions = {}): ModuleStore {
  const modules = new Map<string, DomainModule>();
  for (const m of preloaded) modules.set(m.id, m);

  const registered = [
    ...new Set<DomainId>([...preloaded.map((m) => m.id), ...(Object.keys(loaders) as DomainId[])]),
  ];
  const registeredSet = new Set<string>(registered);
  const listeners = new Set<() => void>();
  const inflight = new Map<string, Promise<void>>();
  const requests = new Map<string, Promise<void>>();

  const build = (): ModuleSnapshot => {
    // Keep only modules whose dependency closure is fully loaded.
    const ready = new Set(modules.keys());
    let changed = true;
    while (changed) {
      changed = false;
      for (const id of ready) {
        const m = modules.get(id);
        if (m && foreignDomains(m).some((d) => !ready.has(d))) {
          ready.delete(id);
          changed = true;
        }
      }
    }
    const ordered = registered.filter((id) => ready.has(id));
    const list = ordered
      .map((id) => modules.get(id))
      .filter((m): m is DomainModule => m !== undefined);
    const registry = createRegistry(list);
    return { registry, searchIndex: buildSearchIndex(registry), loaded: ordered };
  };

  let snapshot = build();
  let loadedSet = new Set<string>(snapshot.loaded);

  const rebuild = () => {
    snapshot = build();
    loadedSet = new Set(snapshot.loaded);
    for (const l of listeners) l();
  };

  const loadOne = (id: string): Promise<void> => {
    if (modules.has(id)) return Promise.resolve();
    const existing = inflight.get(id);
    if (existing) return existing;
    const loader = loaders[id as DomainId];
    // Unregistered ids are ignored; the registry reports any dangling reference.
    if (!loader) return Promise.resolve();
    const p = loader()
      .then(async (m) => {
        if (m.id !== id) throw new Error(`Loader for "${id}" returned module "${m.id}"`);
        // Record before loading dependencies so cross-domain cycles cannot deadlock.
        modules.set(id, m);
        await Promise.all(foreignDomains(m).map(loadOne));
      })
      .finally(() => {
        inflight.delete(id);
      });
    inflight.set(id, p);
    return p;
  };

  const isLoaded = (ids: readonly string[]) =>
    ids.filter((id) => registeredSet.has(id)).every((id) => loadedSet.has(id));

  return {
    registered,
    isRegistered: (id) => registeredSet.has(id),
    isLoaded,
    load: (ids) => {
      const targets = [...new Set(ids.filter((id) => registeredSet.has(id)))].sort();
      if (isLoaded(targets)) return Promise.resolve();
      const key = targets.join(',');
      const existing = requests.get(key);
      if (existing) return existing;
      const p = Promise.all(targets.map(loadOne))
        .then(() => {
          rebuild();
        })
        .finally(() => {
          // Settled requests are dropped: success is visible via isLoaded, failure can be retried.
          requests.delete(key);
        });
      requests.set(key, p);
      return p;
    },
    getSnapshot: () => snapshot,
    subscribe: (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}
