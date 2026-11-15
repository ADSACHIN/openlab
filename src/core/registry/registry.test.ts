import { describe, expect, it } from 'vitest';
import type { ContentBlock, DomainModule, Lesson } from '@core/model/types';
import { defineLab, defineLesson, defineModule, defineSimulator } from '@core/model/helpers';
import { createRegistry, RegistryError } from './registry';

function lesson(slug: string, prerequisites: string[] = [], blocks: ContentBlock[] = []): Lesson {
  return defineLesson({
    slug,
    domainId: 'networking',
    title: slug,
    summary: `about ${slug}`,
    estimatedMinutes: 5,
    prerequisites,
    outcomes: [],
    tags: [],
    blocks,
  });
}

const counter = defineSimulator<{ n: number }>({
  domainId: 'networking',
  slug: 'counter',
  title: 'Counter',
  description: 'counts',
  engine: {
    init: () => ({ n: 0 }),
    step: (s) => ({ n: s.n + 1 }),
    describe: (s) => `n=${String(s.n)}`,
  },
  View: () => null,
});

function moduleWith(partial: Partial<DomainModule>): DomainModule {
  return defineModule({ id: 'networking', lessons: [], labs: [], simulators: [], ...partial });
}

describe('createRegistry', () => {
  it('orders lessons by prerequisites within a domain', () => {
    const r = createRegistry([
      moduleWith({
        lessons: [
          lesson('tcp', ['networking/ip']),
          lesson('ip', ['networking/osi']),
          lesson('osi'),
        ],
      }),
    ]);
    expect(r.lessonsFor('networking').map((l) => l.slug)).toEqual(['osi', 'ip', 'tcp']);
    expect(r.prerequisitesOf('networking/tcp').map((l) => l.slug)).toEqual(['ip']);
    expect(r.dependentsOf('networking/osi').map((l) => l.slug)).toEqual(['ip']);
    expect(r.hasContent('networking')).toBe(true);
    expect(r.hasContent('ai-ml')).toBe(false);
  });

  it('generates routes for domains, lessons and labs', () => {
    const lab = defineLab({
      slug: 'count-to-three',
      domainId: 'networking',
      title: 'Count',
      summary: 's',
      estimatedMinutes: 3,
      prerequisites: [],
      simulatorId: 'networking/counter',
      goal: 'Reach 3',
      instructions: [],
      check: (s) => ({ passed: (s as { n: number }).n >= 3, message: 'ok' }),
    });
    const r = createRegistry([
      moduleWith({ lessons: [lesson('osi')], labs: [lab], simulators: [counter] }),
    ]);
    expect(r.routes().map((x) => x.path)).toEqual([
      '/domains/networking',
      '/domains/networking/lessons/osi',
      '/domains/networking/labs/count-to-three',
    ]);
    expect(r.getLab('networking/count-to-three')?.check({ n: 3 }).passed).toBe(true);
  });

  it('rejects dangling prerequisites', () => {
    expect(() =>
      createRegistry([moduleWith({ lessons: [lesson('tcp', ['networking/ghost'])] })]),
    ).toThrow(/unknown lesson "networking\/ghost"/);
  });

  it('rejects cycles with the path', () => {
    expect(() =>
      createRegistry([
        moduleWith({ lessons: [lesson('a', ['networking/b']), lesson('b', ['networking/a'])] }),
      ]),
    ).toThrow(/cycle: networking\/a → networking\/b → networking\/a/);
  });

  it('rejects duplicate ids, foreign domains and bad slugs', () => {
    expect(() => createRegistry([moduleWith({ lessons: [lesson('x'), lesson('x')] })])).toThrow(
      RegistryError,
    );
    const foreign = { ...lesson('x'), domainId: 'ai-ml' as const };
    expect(() => createRegistry([moduleWith({ lessons: [foreign] })])).toThrow(
      /declares domain "ai-ml"/,
    );
    expect(() =>
      createRegistry([moduleWith({ lessons: [{ ...lesson('x'), slug: 'Bad Slug' }] })]),
    ).toThrow(/kebab-case/);
  });

  it('rejects unknown simulators in lessons and labs', () => {
    expect(() =>
      createRegistry([
        moduleWith({
          lessons: [lesson('x', [], [{ type: 'interactive', simulatorId: 'networking/nope' }])],
        }),
      ]),
    ).toThrow(/unknown simulator/);
  });

  it('validates quizzes', () => {
    const badQuiz: ContentBlock = {
      type: 'quiz',
      quiz: {
        id: 'q',
        questions: [
          {
            id: 'q1',
            prompt: '?',
            choices: [
              { id: 'a', text: 'A' },
              { id: 'b', text: 'B' },
            ],
            answerId: 'zzz',
            explanation: '',
          },
        ],
      },
    };
    expect(() => createRegistry([moduleWith({ lessons: [lesson('x', [], [badQuiz])] })])).toThrow(
      /not a choice/,
    );
  });
});
