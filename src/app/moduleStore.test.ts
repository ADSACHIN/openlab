import { describe, expect, it, vi } from 'vitest';
import { defineLesson, defineModule } from '@core/model';
import type { DomainModule } from '@core/model';
import { createModuleStore, foreignDomains } from './moduleStore';

const lesson = (
  domainId: 'networking' | 'linux-os' | 'ai-ml',
  slug: string,
  prerequisites: string[] = [],
) =>
  defineLesson({
    slug,
    domainId,
    title: slug,
    summary: '',
    estimatedMinutes: 1,
    prerequisites,
    outcomes: [],
    tags: [],
    blocks: [],
  });

const net = defineModule({
  id: 'networking',
  lessons: [lesson('networking', 'osi')],
  labs: [],
  simulators: [],
});
// linux-os depends on networking through a cross-domain prerequisite
const linux = defineModule({
  id: 'linux-os',
  lessons: [lesson('linux-os', 'sockets', ['networking/osi'])],
  labs: [],
  simulators: [],
});

function deferred() {
  let resolve!: (m: DomainModule) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<DomainModule>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('module store', () => {
  it('knows registered domains without loading anything', () => {
    const loader = vi.fn(() => Promise.resolve(net));
    const store = createModuleStore({ loaders: { networking: loader } });
    expect(store.registered).toEqual(['networking']);
    expect(store.isRegistered('networking')).toBe(true);
    expect(store.isRegistered('ai-ml')).toBe(false);
    expect(store.isLoaded(['networking'])).toBe(false);
    expect(store.getSnapshot().registry.allLessons()).toEqual([]);
    expect(loader).not.toHaveBeenCalled();
  });

  it('loads on demand, de-duplicates requests and notifies subscribers once', async () => {
    const loader = vi.fn(() => Promise.resolve(net));
    const store = createModuleStore({ loaders: { networking: loader } });
    const listener = vi.fn();
    store.subscribe(listener);
    const p1 = store.load(['networking']);
    const p2 = store.load(['networking']);
    expect(p1).toBe(p2);
    await p1;
    expect(loader).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.isLoaded(['networking'])).toBe(true);
    expect(store.getSnapshot().registry.getLesson('networking/osi')?.title).toBe('osi');
    await store.load(['networking']);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('pulls in cross-domain dependencies before exposing a module', async () => {
    const netLoad = deferred();
    const store = createModuleStore({
      loaders: { networking: () => netLoad.promise, 'linux-os': () => Promise.resolve(linux) },
    });
    expect(foreignDomains(linux)).toEqual(['networking']);
    const p = store.load(['linux-os']);
    await Promise.resolve();
    expect(store.isLoaded(['linux-os'])).toBe(false);
    netLoad.resolve(net);
    await p;
    expect(store.isLoaded(['linux-os', 'networking'])).toBe(true);
    expect(
      store
        .getSnapshot()
        .registry.prerequisitesOf('linux-os/sockets')
        .map((l) => l.id),
    ).toEqual(['networking/osi']);
  });

  it('does not deadlock when two domains depend on each other', async () => {
    // Domain-level cycle without a lesson-level cycle: networking/a → linux-os/b, linux-os/c → networking/d.
    const a = defineModule({
      id: 'networking',
      lessons: [lesson('networking', 'a', ['linux-os/b']), lesson('networking', 'd')],
      labs: [],
      simulators: [],
    });
    const b = defineModule({
      id: 'linux-os',
      lessons: [lesson('linux-os', 'b'), lesson('linux-os', 'c', ['networking/d'])],
      labs: [],
      simulators: [],
    });
    expect(foreignDomains(a)).toEqual(['linux-os']);
    expect(foreignDomains(b)).toEqual(['networking']);
    const store = createModuleStore({
      loaders: { networking: () => Promise.resolve(a), 'linux-os': () => Promise.resolve(b) },
    });
    await store.load(['networking']);
    expect(store.isLoaded(['networking', 'linux-os'])).toBe(true);
    expect(store.getSnapshot().registry.allLessons()).toHaveLength(4);
  });

  it('rejects on loader failure and allows a retry', async () => {
    let fail = true;
    const store = createModuleStore({
      loaders: {
        networking: () => (fail ? Promise.reject(new Error('offline')) : Promise.resolve(net)),
      },
    });
    await expect(store.load(['networking'])).rejects.toThrow('offline');
    fail = false;
    await store.load(['networking']);
    expect(store.isLoaded(['networking'])).toBe(true);
  });

  it('treats preloaded modules as loaded and ignores unregistered ids', async () => {
    const store = createModuleStore({ preloaded: [net] });
    expect(store.isLoaded(['networking', 'ai-ml'])).toBe(true);
    await expect(store.load(['ai-ml'])).resolves.toBeUndefined();
  });

  it('rejects a loader that returns the wrong module', async () => {
    const store = createModuleStore({ loaders: { 'linux-os': () => Promise.resolve(net) } });
    await expect(store.load(['linux-os'])).rejects.toThrow(/returned module "networking"/);
  });
});
