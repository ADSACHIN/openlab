import type { DomainId } from '@typings/domain';
import type {
  AnySimulatorDefinition,
  DomainModule,
  Lab,
  LabId,
  Lesson,
  LessonId,
  SimulatorId,
} from '@core/model/types';
import { contentId, isSlug } from '@core/model/helpers';
import { CycleError, topologicalOrder } from './graph';

export class RegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistryError';
  }
}

export type RegistryRoute =
  | { kind: 'domain'; domainId: DomainId; path: string }
  | { kind: 'lesson'; domainId: DomainId; id: LessonId; path: string }
  | { kind: 'lab'; domainId: DomainId; id: LabId; path: string };

export interface Registry {
  readonly modules: readonly DomainModule[];
  readonly domainIds: readonly DomainId[];
  getModule: (domainId: string) => DomainModule | undefined;
  hasContent: (domainId: string) => boolean;
  getLesson: (id: string) => Lesson | undefined;
  getLab: (id: string) => Lab | undefined;
  getSimulator: (id: string) => AnySimulatorDefinition | undefined;
  /** Lessons of a domain in prerequisite order (dependencies first). */
  lessonsFor: (domainId: string) => readonly Lesson[];
  labsFor: (domainId: string) => readonly Lab[];
  allLessons: () => readonly Lesson[];
  allLabs: () => readonly Lab[];
  prerequisitesOf: (lessonId: string) => readonly Lesson[];
  /** Lessons that list `lessonId` as a prerequisite. */
  dependentsOf: (lessonId: string) => readonly Lesson[];
  routes: () => readonly RegistryRoute[];
}

export const paths = {
  domain: (domainId: string) => `/domains/${domainId}`,
  lesson: (domainId: string, slug: string) => `/domains/${domainId}/lessons/${slug}`,
  lab: (domainId: string, slug: string) => `/domains/${domainId}/labs/${slug}`,
} as const;

/**
 * Build the registry, validating every cross-reference up front so that
 * content mistakes fail at startup (and in tests), never at click time.
 */
export function createRegistry(modules: readonly DomainModule[]): Registry {
  const byDomain = new Map<string, DomainModule>();
  const lessons = new Map<string, Lesson>();
  const labs = new Map<string, Lab>();
  const simulators = new Map<string, AnySimulatorDefinition>();

  for (const m of modules) {
    if (byDomain.has(m.id)) throw new RegistryError(`Duplicate domain module "${m.id}"`);
    byDomain.set(m.id, m);

    for (const s of m.simulators) {
      assertOwned('Simulator', s, m.id);
      if (simulators.has(s.id)) throw new RegistryError(`Duplicate simulator id "${s.id}"`);
      simulators.set(s.id, s);
    }
    for (const l of m.lessons) {
      assertOwned('Lesson', l, m.id);
      if (lessons.has(l.id)) throw new RegistryError(`Duplicate lesson id "${l.id}"`);
      lessons.set(l.id, l);
    }
    for (const l of m.labs) {
      assertOwned('Lab', l, m.id);
      if (labs.has(l.id)) throw new RegistryError(`Duplicate lab id "${l.id}"`);
      labs.set(l.id, l);
    }
  }

  // Cross-references
  for (const l of lessons.values()) {
    for (const p of l.prerequisites) {
      if (!lessons.has(p))
        throw new RegistryError(`Lesson "${l.id}" requires unknown lesson "${p}"`);
    }
    for (const b of l.blocks) {
      if (b.type === 'interactive' && !simulators.has(b.simulatorId)) {
        throw new RegistryError(`Lesson "${l.id}" embeds unknown simulator "${b.simulatorId}"`);
      }
      if (b.type === 'quiz') assertQuizValid(b.quiz, l.id);
    }
  }
  for (const l of labs.values()) {
    if (!simulators.has(l.simulatorId)) {
      throw new RegistryError(`Lab "${l.id}" uses unknown simulator "${l.simulatorId}"`);
    }
    for (const p of l.prerequisites) {
      if (!lessons.has(p)) throw new RegistryError(`Lab "${l.id}" requires unknown lesson "${p}"`);
    }
  }

  // Global prerequisite DAG
  let globalOrder: string[];
  try {
    globalOrder = topologicalOrder(
      [...lessons.keys()],
      (id) => lessons.get(id)?.prerequisites ?? [],
    );
  } catch (e) {
    if (e instanceof CycleError) throw new RegistryError(e.message);
    throw e;
  }
  const rank = new Map(globalOrder.map((id, i) => [id, i] as const));

  const dependents = new Map<string, Lesson[]>();
  for (const l of lessons.values()) {
    for (const p of l.prerequisites) {
      const arr = dependents.get(p) ?? [];
      arr.push(l);
      dependents.set(p, arr);
    }
  }

  const lessonsForCache = new Map<string, readonly Lesson[]>();
  const lessonsFor = (domainId: string): readonly Lesson[] => {
    const cached = lessonsForCache.get(domainId);
    if (cached) return cached;
    const m = byDomain.get(domainId);
    const list = m
      ? [...m.lessons].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
      : [];
    lessonsForCache.set(domainId, list);
    return list;
  };

  const domainIds = [...byDomain.keys()] as DomainId[];

  return {
    modules,
    domainIds,
    getModule: (id) => byDomain.get(id),
    hasContent: (id) => {
      const m = byDomain.get(id);
      return !!m && (m.lessons.length > 0 || m.labs.length > 0);
    },
    getLesson: (id) => lessons.get(id),
    getLab: (id) => labs.get(id),
    getSimulator: (id) => simulators.get(id),
    lessonsFor,
    labsFor: (domainId) => byDomain.get(domainId)?.labs ?? [],
    allLessons: () => globalOrder.map((id) => lessons.get(id)).filter((l): l is Lesson => !!l),
    allLabs: () => [...labs.values()],
    prerequisitesOf: (id) =>
      (lessons.get(id)?.prerequisites ?? [])
        .map((p) => lessons.get(p))
        .filter((l): l is Lesson => !!l),
    dependentsOf: (id) => dependents.get(id) ?? [],
    routes: () => {
      const out: RegistryRoute[] = [];
      for (const d of domainIds) {
        out.push({ kind: 'domain', domainId: d, path: paths.domain(d) });
        for (const l of lessonsFor(d)) {
          out.push({ kind: 'lesson', domainId: d, id: l.id, path: paths.lesson(d, l.slug) });
        }
        for (const l of byDomain.get(d)?.labs ?? []) {
          out.push({ kind: 'lab', domainId: d, id: l.id, path: paths.lab(d, l.slug) });
        }
      }
      return out;
    },
  };
}

function assertOwned(
  kind: string,
  item: { id: string; slug: string; domainId: DomainId },
  domainId: DomainId,
): void {
  if (item.domainId !== domainId) {
    throw new RegistryError(
      `${kind} "${item.id}" declares domain "${item.domainId}" but is registered under "${domainId}"`,
    );
  }
  if (!isSlug(item.slug)) throw new RegistryError(`${kind} slug "${item.slug}" must be kebab-case`);
  const expected = contentId(domainId, item.slug);
  if (item.id !== expected)
    throw new RegistryError(`${kind} id "${item.id}" must equal "${expected}"`);
}

function assertQuizValid(
  quiz: {
    id: string;
    questions: readonly { id: string; choices: readonly { id: string }[]; answerId: string }[];
  },
  lessonId: string,
): void {
  if (quiz.questions.length === 0)
    throw new RegistryError(`Quiz "${quiz.id}" in "${lessonId}" has no questions`);
  const qids = new Set<string>();
  for (const q of quiz.questions) {
    if (qids.has(q.id)) throw new RegistryError(`Quiz "${quiz.id}" repeats question id "${q.id}"`);
    qids.add(q.id);
    if (q.choices.length < 2)
      throw new RegistryError(`Question "${q.id}" in quiz "${quiz.id}" needs at least two choices`);
    if (!q.choices.some((c) => c.id === q.answerId)) {
      throw new RegistryError(
        `Question "${q.id}" in quiz "${quiz.id}" has answerId "${q.answerId}" that is not a choice`,
      );
    }
  }
}

export type { SimulatorId };
