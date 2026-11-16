import type { Lesson } from '@core/model/types';
import type { Registry } from '@core/registry/registry';

/**
 * Learning paths (Phase 6): everything a goal lesson builds on, across
 * domains, in an order where each lesson comes after its prerequisites.
 */

/** The goal plus all of its transitive prerequisites. Empty if the goal is unknown. */
export function prerequisiteClosure(registry: Registry, goalId: string): Set<string> {
  const out = new Set<string>();
  if (!registry.getLesson(goalId)) return out;
  const stack = [goalId];
  while (stack.length > 0) {
    const id = stack.pop();
    if (id === undefined || out.has(id)) continue;
    out.add(id);
    for (const p of registry.prerequisitesOf(id)) stack.push(p.id);
  }
  return out;
}

/** The path to `goalId`, in the registry's global prerequisite order (dependencies first, goal last). */
export function learningPath(registry: Registry, goalId: string): Lesson[] {
  const closure = prerequisiteClosure(registry, goalId);
  return registry.allLessons().filter((l) => closure.has(l.id));
}

export interface PathSummary {
  lessons: number;
  domains: number;
  minutes: number;
  done: number;
  /** First lesson on the path not yet completed, if any. */
  next: Lesson | undefined;
}

export function summarizePath(
  path: readonly Lesson[],
  completed: ReadonlySet<string>,
): PathSummary {
  return {
    lessons: path.length,
    domains: new Set(path.map((l) => l.domainId)).size,
    minutes: path.reduce((n, l) => n + l.estimatedMinutes, 0),
    done: path.filter((l) => completed.has(l.id)).length,
    next: path.find((l) => !completed.has(l.id)),
  };
}

/** Goals whose paths cross domains, longest first: good starting suggestions. */
export function suggestedGoals(registry: Registry, limit = 6): Lesson[] {
  return registry
    .allLessons()
    .map((lesson) => ({ lesson, path: learningPath(registry, lesson.id) }))
    .filter(({ path }) => new Set(path.map((l) => l.domainId)).size >= 2)
    .sort((a, b) => b.path.length - a.path.length || a.lesson.id.localeCompare(b.lesson.id))
    .slice(0, limit)
    .map(({ lesson }) => lesson);
}
