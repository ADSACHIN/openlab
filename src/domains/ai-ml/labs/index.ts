import { defineLab } from '@core/model';
import { DIVERGED, TARGET, f } from '../simulators/gradient/engine';
import type { GradientState } from '../simulators/gradient/engine';
import { applyMerge, initialWords, tokenCount } from '../simulators/tokenizer/engine';
import type { TokenizerState } from '../simulators/tokenizer/engine';

export const STEP_BUDGET = 30;

/** Segmentation of the training corpus after applying these merges in order. */
function replay(merges: readonly (readonly [string, string])[]) {
  return Object.fromEntries(
    Object.entries(initialWords()).map(([w, syms]) => [
      w,
      merges.reduce<string[]>((acc, m) => applyMerge(acc, m), [...syms]),
    ]),
  );
}
export const TOKEN_TARGET = 50;

export const learningRateLab = defineLab({
  slug: 'tune-the-learning-rate',
  domainId: 'ai-ml',
  title: 'Tune the learning rate',
  summary: 'Get the loss below 0.01 within 30 steps.',
  estimatedMinutes: 3,
  prerequisites: ['ai-ml/gradient-descent'],
  simulatorId: 'ai-ml/gradient-descent',
  goal: `Choose a learning rate that brings the loss below ${String(TARGET)} within ${String(STEP_BUDGET)} steps, then run until it gets there.`,
  instructions: [
    {
      type: 'paragraph',
      text: 'Too small crawls; too large bounces or explodes. Changing the rate restarts the run.',
    },
  ],
  check: (state) => {
    const s = state as GradientState;
    const first = s.path.findIndex(([x, y]) => f(x, y) < TARGET);
    const last = s.path[s.path.length - 1] ?? [0, 0];
    if (f(last[0], last[1]) > DIVERGED)
      return {
        passed: false,
        message: `At ${String(s.lr)} the loss exploded. Smaller steps.`,
        score: 20,
      };
    if (first === -1)
      return {
        passed: false,
        message:
          s.path.length - 1 > STEP_BUDGET
            ? `After ${String(s.path.length - 1)} steps at ${String(s.lr)} the loss is still above ${String(TARGET)}.`
            : 'Not below the target yet. Keep stepping, or change the rate.',
        score: 30,
      };
    if (first > STEP_BUDGET)
      return {
        passed: false,
        message: `${String(s.lr)} gets there, but takes ${String(first)} steps. A bigger step would be faster.`,
        score: 60,
      };
    return {
      passed: true,
      message: `Below ${String(TARGET)} after ${String(first)} steps at learning rate ${String(s.lr)}.`,
      score: 100,
    };
  },
});

export const tokenizerLab = defineLab({
  slug: 'compress-the-corpus',
  domainId: 'ai-ml',
  title: 'Compress the corpus',
  summary: 'Learn just enough merges to get the corpus under 50 tokens.',
  estimatedMinutes: 3,
  prerequisites: ['ai-ml/tokenization'],
  simulatorId: 'ai-ml/bpe-tokenizer',
  goal: `Step until the corpus is under ${String(TOKEN_TARGET)} tokens, and stop there: every extra merge enlarges the vocabulary.`,
  instructions: [
    {
      type: 'paragraph',
      text: 'Watch the corpus length after each Step. Reset if you go too far.',
    },
  ],
  check: (state) => {
    const s = state as TokenizerState;
    const count = tokenCount(s.words);
    if (count >= TOKEN_TARGET)
      return {
        passed: false,
        message: `${String(count)} tokens after ${String(s.merges.length)} merges. Keep going.`,
        score: Math.min(60, s.merges.length * 10),
      };
    const previous = tokenCount(replay(s.merges.slice(0, -1)));
    if (previous < TOKEN_TARGET)
      return {
        passed: false,
        message: `${String(count)} tokens, but it was already under ${String(TOKEN_TARGET)} (${String(previous)}) one merge earlier. Extra merges cost vocabulary.`,
        score: 70,
      };
    return {
      passed: true,
      message: `${String(count)} tokens after ${String(s.merges.length)} merges; one fewer would leave ${String(previous)}.`,
      score: 100,
    };
  },
});
