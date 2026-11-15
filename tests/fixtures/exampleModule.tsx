/**
 * A tiny but complete DomainModule used by integration tests. It exercises
 * every engine feature: prerequisites, an embedded simulator, a quiz, a lab.
 */
import { defineLab, defineLesson, defineModule, defineSimulator } from '@core/model';

export interface CounterState {
  n: number;
}
export type CounterAction = 'add5' | 'noop';

export const counter = defineSimulator<CounterState, CounterAction>({
  domainId: 'programming',
  slug: 'counter',
  title: 'Counter',
  description: 'Counts up by one each step.',
  engine: {
    init: () => ({ n: 0 }),
    step: (s) => ({ n: s.n + 1 }),
    apply: (s, a) => (a === 'add5' ? { n: s.n + 5 } : s),
    isDone: (s) => s.n >= 20,
    describe: (s) => `Counter is at ${String(s.n)}.`,
  },
  View: ({ state, dispatch }) => (
    <div>
      <output aria-label="counter value">{state.n}</output>
      <button type="button" onClick={() => dispatch('add5')}>
        Add five
      </button>
    </div>
  ),
});

export const intro = defineLesson({
  slug: 'intro',
  domainId: 'programming',
  title: 'What is a program?',
  summary: 'Instructions, state and time.',
  estimatedMinutes: 4,
  prerequisites: [],
  outcomes: ['describe a program as state plus steps'],
  tags: ['basics'],
  blocks: [
    { type: 'paragraph', text: 'A program changes `state` one step at a time.' },
    { type: 'interactive', simulatorId: 'programming/counter', caption: 'Press Step.' },
  ],
});

export const loops = defineLesson({
  slug: 'loops',
  domainId: 'programming',
  title: 'Loops',
  summary: 'Repeating steps until a condition holds.',
  estimatedMinutes: 6,
  prerequisites: ['programming/intro'],
  outcomes: ['write a counted loop'],
  tags: ['control-flow'],
  blocks: [
    { type: 'heading', level: 2, text: 'Counting' },
    { type: 'code', language: 'ts', code: 'for (let i = 0; i < 3; i++) {}' },
    {
      type: 'quiz',
      quiz: {
        id: 'programming/loops/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'How many times does the loop body run?',
            choices: [
              { id: 'a', text: '2' },
              { id: 'b', text: '3' },
            ],
            answerId: 'b',
            explanation: 'i takes 0, 1, 2.',
          },
        ],
      },
    },
  ],
});

export const countLab = defineLab({
  slug: 'reach-ten',
  domainId: 'programming',
  title: 'Reach ten',
  summary: 'Drive the counter to at least 10.',
  estimatedMinutes: 2,
  prerequisites: ['programming/intro'],
  simulatorId: 'programming/counter',
  goal: 'Make the counter show 10 or more.',
  instructions: [{ type: 'paragraph', text: 'Use Step or Add five.' }],
  check: (state) => {
    const n = (state as CounterState).n;
    return n >= 10
      ? { passed: true, message: 'The counter reached ten.', score: 100 }
      : { passed: false, message: `Only at ${String(n)} so far.`, score: Math.min(99, n * 10) };
  },
});

export const exampleModule = defineModule({
  id: 'programming',
  lessons: [loops, intro],
  labs: [countLab],
  simulators: [counter],
});
