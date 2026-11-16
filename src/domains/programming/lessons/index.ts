import { defineLesson } from '@core/model';

export const stateAndSteps = defineLesson({
  slug: 'state-and-steps',
  domainId: 'programming',
  title: 'A program is state plus steps',
  summary: 'Variables, assignment and loops, traced one line at a time.',
  estimatedMinutes: 7,
  prerequisites: [],
  outcomes: [
    'explain assignment as replacing a variable’s value',
    'trace a loop by hand and predict its output',
    'read a variable table the way a debugger shows it',
  ],
  tags: ['variables', 'loops', 'tracing', 'basics'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Strip away syntax and every program is the same thing: some **state** (variables holding values) and a sequence of **steps** that change it. Reading code well means being able to run it in your head. The tracer below runs it for you, one line at a time.',
    },
    {
      type: 'interactive',
      simulatorId: 'programming/tracer-sum',
      caption:
        'Press Step. The highlighted line runs next; the table shows the state after each step.',
    },
    { type: 'heading', level: 2, text: 'What to notice' },
    {
      type: 'list',
      items: [
        '`total = total + i` is not an equation. It reads the old `total`, adds `i`, and **replaces** `total` with the result.',
        'The `while` line is visited five times: four times the condition is true, the fifth time it is false and execution jumps past the loop.',
        'The number of steps (16) is more than the number of lines (6). Lines inside a loop run many times.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Trace tables',
      text: 'Before running unfamiliar code, draw a table with one column per variable and one row per step. It is the oldest debugging technique and still the best.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'programming/state-and-steps/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'After the loop finishes, what is `i`?',
            choices: [
              { id: 'a', text: '4' },
              { id: 'b', text: '5' },
              { id: 'c', text: '10' },
            ],
            answerId: 'b',
            explanation: '`i` is incremented to 5, then `5 <= 4` is false and the loop exits.',
          },
          {
            id: 'q2',
            prompt: 'If line 2 were `i = 2`, what would be printed?',
            choices: [
              { id: 'a', text: '9' },
              { id: 'b', text: '10' },
              { id: 'c', text: '6' },
            ],
            answerId: 'a',
            explanation: '2 + 3 + 4 = 9.',
          },
        ],
      },
    },
  ],
});

export const stacksAndQueues = defineLesson({
  slug: 'stacks-and-queues',
  domainId: 'programming',
  title: 'Data structures: stacks and queues',
  summary: 'Two ways to line things up, and where each shows up in real systems.',
  estimatedMinutes: 6,
  prerequisites: ['programming/state-and-steps'],
  outcomes: [
    'define LIFO and FIFO',
    'name the operations of a stack and a queue',
    'give a real example of each',
  ],
  tags: ['data-structures', 'stack', 'queue'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **data structure** is a shape for holding data plus the operations allowed on it. The two simplest are the **stack** (last in, first out — like plates) and the **queue** (first in, first out — like a line at a counter).',
    },
    {
      type: 'interactive',
      simulatorId: 'programming/stack-queue',
      caption:
        'Push and enqueue a few numbers, then pop and dequeue. Notice which number comes out of each.',
    },
    { type: 'heading', level: 2, text: 'Where you meet them' },
    {
      type: 'list',
      items: [
        '**Stack**: function calls (the *call stack*), undo history, the back button, matching brackets in a parser',
        '**Queue**: print jobs, tasks waiting for a worker, the scheduler’s ready queue you saw in Linux & OS, network packets in a buffer',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Overflow and underflow',
      text: 'Popping an empty stack or dequeuing an empty queue is an error — a *stack overflow* is the opposite: pushing until memory runs out, which is what unbounded recursion does.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'programming/stacks-and-queues/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'You push 1, 2, 3 then pop twice. What remains?',
            choices: [
              { id: 'a', text: '1' },
              { id: 'b', text: '3' },
              { id: 'c', text: '1, 2' },
            ],
            answerId: 'a',
            explanation: 'Pop removes 3, then 2. Only 1 is left.',
          },
          {
            id: 'q2',
            prompt: 'Which structure gives fair, in-order service to waiting tasks?',
            choices: [
              { id: 'a', text: 'Stack' },
              { id: 'b', text: 'Queue' },
            ],
            answerId: 'b',
            explanation: 'FIFO serves tasks in arrival order; a stack would starve the earliest.',
          },
        ],
      },
    },
  ],
});

export const sortingLesson = defineLesson({
  slug: 'sorting',
  domainId: 'programming',
  title: 'Sorting: bubble, insertion, selection',
  summary: 'Three simple sorts, how they move elements, and why the input shape matters.',
  estimatedMinutes: 9,
  prerequisites: ['programming/stacks-and-queues'],
  outcomes: [
    'describe how bubble, insertion and selection sort work',
    'count comparisons and swaps for a small input',
    'explain why insertion sort is fast on nearly sorted data',
  ],
  tags: ['algorithms', 'sorting', 'complexity'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Sorting is the classic first algorithm because the three simplest methods are easy to see and differ in instructive ways. Each takes about **n²** comparisons in the worst case for *n* items, but they behave very differently on friendly input.',
    },
    {
      type: 'interactive',
      simulatorId: 'programming/sorting',
      caption:
        'Blue = comparing, amber = swapped, green = in final place. Try each algorithm on each input.',
    },
    { type: 'heading', level: 2, text: 'How they move' },
    {
      type: 'list',
      items: [
        '**Bubble**: compare neighbours, swap if out of order; the largest “bubbles” to the end each pass. Stops early if a pass makes no swaps.',
        '**Insertion**: take the next item and slide it left into the sorted prefix. Does almost nothing when the data is already nearly sorted.',
        '**Selection**: find the smallest of the rest, swap it into place. Always makes the same n(n−1)/2 comparisons, but at most n−1 swaps.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Why the input shape matters',
      text: 'Big-O describes the worst case. Real data is often nearly sorted (appending to a sorted log, re-sorting after one edit), and insertion sort is close to linear there. That is why library sorts use it for small or nearly sorted runs.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'programming/sorting/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Which sort always does the same number of comparisons regardless of input?',
            choices: [
              { id: 'a', text: 'Bubble' },
              { id: 'b', text: 'Insertion' },
              { id: 'c', text: 'Selection' },
            ],
            answerId: 'c',
            explanation: 'Selection sort scans the whole remainder every time; it cannot shortcut.',
          },
          {
            id: 'q2',
            prompt: 'Which does the fewest swaps on reversed input?',
            choices: [
              { id: 'a', text: 'Bubble' },
              { id: 'b', text: 'Insertion' },
              { id: 'c', text: 'Selection' },
            ],
            answerId: 'c',
            explanation:
              'At most one swap per position for selection; the others swap every inversion.',
          },
        ],
      },
    },
  ],
});

export const searching = defineLesson({
  slug: 'searching-and-complexity',
  domainId: 'programming',
  title: 'Searching and Big-O',
  summary: 'Linear versus binary search, and what O(n) and O(log n) actually promise.',
  estimatedMinutes: 8,
  prerequisites: ['programming/sorting'],
  outcomes: [
    'perform binary search by hand',
    'explain why it needs sorted input',
    'estimate guesses as log₂ of the list size',
  ],
  tags: ['algorithms', 'search', 'big-o', 'complexity'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Looking for a value in an unsorted list means checking items one by one: **linear search**, O(n). If the list is sorted, every comparison can throw away half of what remains: **binary search**, O(log n). For 31 items that is at most 5 guesses instead of up to 31; for a billion, about 30.',
    },
    {
      type: 'interactive',
      simulatorId: 'programming/binary-search',
      caption:
        'Press Play for textbook binary search, or click positions yourself. The bright cells are still possible.',
    },
    { type: 'heading', level: 2, text: 'What Big-O means' },
    {
      type: 'list',
      items: [
        'It describes how running time **grows** with input size, ignoring constants: O(n) doubles when n doubles; O(log n) barely moves; O(n²) quadruples.',
        'It is an upper bound on the worst case, not a measurement. A fast O(n²) algorithm can beat a slow O(n log n) one on small inputs.',
        'The right data structure changes the O: a sorted array gives O(log n) lookup, a hash table O(1) on average.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The sorted precondition',
      text: 'Binary search on unsorted data silently returns wrong answers — it does not fail loudly. Sorting first costs O(n log n), worth it when you will search many times.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'programming/searching/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Worst-case guesses for binary search over 1,023 sorted items?',
            choices: [
              { id: 'a', text: '10' },
              { id: 'b', text: '32' },
              { id: 'c', text: '512' },
            ],
            answerId: 'a',
            explanation:
              'Each probe removes the middle item and half of the rest: 1023 → 511 → 255 → … → 1, ten probes (2¹⁰ − 1 = 1023).',
          },
          {
            id: 'q2',
            prompt: 'An algorithm takes 1 s on 1,000 items and 4 s on 2,000. Likely complexity?',
            choices: [
              { id: 'a', text: 'O(n)' },
              { id: 'b', text: 'O(n²)' },
              { id: 'c', text: 'O(log n)' },
            ],
            answerId: 'b',
            explanation: 'Doubling n quadrupled the time: quadratic growth.',
          },
        ],
      },
    },
  ],
});

export const debugging = defineLesson({
  slug: 'debugging',
  domainId: 'programming',
  title: 'Debugging: finding the off-by-one',
  summary: 'A method for locating bugs, practised on a program that is wrong by one character.',
  estimatedMinutes: 7,
  prerequisites: ['programming/state-and-steps'],
  outcomes: [
    'state a bug as expected versus actual behaviour',
    'use a trace to locate where state first goes wrong',
    'recognise off-by-one errors in loop conditions',
  ],
  tags: ['debugging', 'tracing', 'off-by-one'],
  blocks: [
    {
      type: 'paragraph',
      text: 'This program is supposed to print the sum 1 + 2 + 3 + 4 = 10. It prints something else. Do not read the code looking for the bug — **trace it** and find the first step where the state is not what you expected.',
    },
    {
      type: 'interactive',
      simulatorId: 'programming/tracer-buggy',
      caption:
        'Step until the output appears. Then step again from Reset and watch `i` at the moment the loop exits.',
    },
    { type: 'heading', level: 2, text: 'A method, not a hunch' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Reproduce**: run it and record the actual output.',
        '**State the gap**: expected 10, got 6.',
        '**Bisect the trace**: at which step does a variable first differ from what it should be? Here `total` is right through 6; the loop simply ends one iteration early.',
        '**Read that line**: `while i < 4` — the 4 is never added. The fix is `<=`.',
        '**Confirm**: re-run and compare with the expectation again.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Off-by-one',
      text: 'Loop bounds, array indices and string slices are the usual suspects: `<` vs `<=`, 0-based vs 1-based, inclusive vs exclusive ends. When a result is wrong by exactly one item, look there first.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'programming/debugging/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'The buggy program prints…',
            choices: [
              { id: 'a', text: '6' },
              { id: 'b', text: '10' },
              { id: 'c', text: '4' },
            ],
            answerId: 'a',
            explanation: '1 + 2 + 3; the iteration where i = 4 never runs.',
          },
          {
            id: 'q2',
            prompt: 'Which step of the method tells you *where* to look?',
            choices: [
              { id: 'a', text: 'Reproduce' },
              { id: 'b', text: 'Bisect the trace' },
              { id: 'c', text: 'Confirm' },
            ],
            answerId: 'b',
            explanation: 'Finding the first step where state diverges localises the fault.',
          },
        ],
      },
    },
  ],
});
