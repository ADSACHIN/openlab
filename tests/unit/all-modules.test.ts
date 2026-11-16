import { describe, expect, it } from 'vitest';
import { MODULE_LOADERS } from '@app/modules';
import { createRegistry } from '@core/registry';
import type { DomainModule } from '@core/model';

/**
 * Domains load lazily in the app, so this test is what guarantees that all of
 * them validate *together*: unique ids, resolvable cross-domain references,
 * and no prerequisite cycles spanning domains.
 */
describe('all registered domain modules', () => {
  it('has a loader for every domain folder that exports a module', () => {
    // Vite resolves this glob at build time, so a new domain folder is noticed automatically.
    const folders = Object.keys(import.meta.glob('/src/domains/*/index.ts'))
      .map((path) => /\/src\/domains\/([^/]+)\/index\.ts$/.exec(path)?.[1])
      .filter((id): id is string => id !== undefined)
      .sort();
    expect(Object.keys(MODULE_LOADERS).sort()).toEqual(folders);
  });

  it('load and form one valid registry', async () => {
    const entries = Object.entries(MODULE_LOADERS);
    expect(entries.length).toBeGreaterThan(0);
    const modules: DomainModule[] = await Promise.all(entries.map(([, load]) => load()));
    entries.forEach(([id], i) => {
      expect(modules[i]?.id).toBe(id);
    });
    const registry = createRegistry(modules);
    expect(registry.allLessons().length).toBeGreaterThan(0);
    for (const m of modules) expect(registry.hasContent(m.id)).toBe(true);
  });
});
