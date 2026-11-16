import { defineLab } from '@core/model';
import type { BinarySearchState } from '../simulators/binary-search/engine';
import type { SortingState } from '../simulators/sorting/engine';
import { current } from '../simulators/sorting/engine';

export const nearlySortedLab = defineLab({
  slug: 'nearly-sorted',
  domainId: 'programming',
  title: 'Sort nearly sorted data cheaply',
  summary: 'Choose the algorithm that finishes a nearly sorted list with the fewest comparisons.',
  estimatedMinutes: 3,
  prerequisites: ['programming/sorting'],
  simulatorId: 'programming/sorting',
  goal: 'With the input set to Nearly sorted, pick the algorithm that completes in at most 12 comparisons and run it to the end.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Select the input, choose an algorithm, press Play (or Step to the end), then check. Change the algorithm if the count is too high.',
    },
  ],
  check: (state) => {
    const s = state as SortingState;
    const snap = current(s);
    const done = s.index >= s.trace.length - 1;
    if (s.input !== 'nearly-sorted')
      return { passed: false, message: 'Set the input to Nearly sorted first.', score: 10 };
    if (!done)
      return { passed: false, message: 'Run the sort to completion before checking.', score: 20 };
    if (snap.comparisons > 12)
      return {
        passed: false,
        message: `${s.algorithm} sort needed ${String(snap.comparisons)} comparisons. Another algorithm barely touches data that is already in order.`,
        score: 50,
      };
    return {
      passed: true,
      message: `${s.algorithm} sort finished in ${String(snap.comparisons)} comparisons — it only moves the few out-of-place items.`,
      score: 100,
    };
  },
});

export const fiveGuessesLab = defineLab({
  slug: 'five-guesses',
  domainId: 'programming',
  title: 'Find it in five guesses',
  summary: 'Locate the target in a sorted list of 31 using at most five probes.',
  estimatedMinutes: 3,
  prerequisites: ['programming/searching-and-complexity'],
  simulatorId: 'programming/binary-search',
  goal: 'Click positions yourself (not Play) and find the target in 5 guesses or fewer.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Always probe the middle of the remaining range. Each wrong guess leaves at most half: 31 → 15 → 7 → 3 → 1, so five probes are always enough.',
    },
  ],
  check: (state) => {
    const s = state as BinarySearchState;
    if (!s.found)
      return {
        passed: false,
        message: `Not found yet after ${String(s.guesses.length)} guesses. Keep halving the highlighted range.`,
        score: 10,
      };
    if (s.guesses.length > 5)
      return {
        passed: false,
        message: `Found, but in ${String(s.guesses.length)} guesses. Press Reset and aim for the middle each time.`,
        score: 60,
      };
    return {
      passed: true,
      message: `Found in ${String(s.guesses.length)} guesses. The worst case for 31 items is five.`,
      score: 100,
    };
  },
});
