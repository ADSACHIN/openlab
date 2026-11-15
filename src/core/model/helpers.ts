import type { DomainId } from '@typings/domain';
import type {
  DomainModule,
  Lab,
  Lesson,
  LessonId,
  SimulatorDefinition,
  SimulatorId,
} from './types';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function contentId(domainId: DomainId, slug: string): string {
  return `${domainId}/${slug}`;
}

export function splitContentId(id: string): { domainId: string; slug: string } | null {
  const i = id.indexOf('/');
  if (i <= 0 || i === id.length - 1) return null;
  return { domainId: id.slice(0, i), slug: id.slice(i + 1) };
}

/** Identity helpers that give authors inference and a single place to add defaults. */
export function defineLesson(lesson: Omit<Lesson, 'id'>): Lesson {
  return { ...lesson, id: contentId(lesson.domainId, lesson.slug) };
}

export function defineLab(lab: Omit<Lab, 'id'>): Lab {
  return { ...lab, id: contentId(lab.domainId, lab.slug) };
}

export function defineSimulator<S, A = never>(
  sim: Omit<SimulatorDefinition<S, A>, 'id'>,
): SimulatorDefinition<S, A> {
  return { ...sim, id: contentId(sim.domainId, sim.slug) };
}

export function defineModule(module: DomainModule): DomainModule {
  return module;
}

export type { LessonId, SimulatorId };
