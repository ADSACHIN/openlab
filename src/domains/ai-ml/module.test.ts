import { describe, expect, it } from 'vitest';
import { computerScienceModule } from '@domains/computer-science';
import { createRegistry } from '@core/registry';
import { foreignDomains } from '@app/moduleStore';
import { aiMlModule } from './index';
import { gradientEngine } from './simulators/gradient/engine';
import type { GradientState } from './simulators/gradient/engine';
import { tokenizerEngine } from './simulators/tokenizer/engine';

describe('ai-ml module', () => {
  const registry = createRegistry([aiMlModule, computerScienceModule]);

  it('depends on computer-science and orders lessons', () => {
    expect(foreignDomains(aiMlModule)).toEqual(['computer-science']);
    expect(registry.lessonsFor('ai-ml').map((l) => l.slug)).toEqual([
      'the-perceptron',
      'gradient-descent',
      'tokenization',
      'sampling-and-temperature',
    ]);
  });

  it('grades the learning-rate lab', () => {
    const lab = registry.getLab('ai-ml/tune-the-learning-rate');
    const run = (lr: number, n: number) => {
      let s: GradientState =
        gradientEngine.apply?.(gradientEngine.init(1), { type: 'set-lr', lr }) ??
        gradientEngine.init(1);
      for (let i = 0; i < n && !gradientEngine.isDone?.(s); i++) s = gradientEngine.step(s);
      return s;
    };
    expect(lab?.check(run(0.11, 60))).toMatchObject({ passed: false, score: 20 });
    expect(lab?.check(run(0.05, 31))).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(run(0.05, 60))).toMatchObject({ passed: false, score: 60 });
    expect(lab?.check(run(0.1, 60))).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(run(0.08, 30))).toMatchObject({ passed: true, score: 100 });
    expect(lab?.check(run(0.09, 30))).toMatchObject({ passed: true, score: 100 });
  });

  it('grades the tokenizer lab', () => {
    const lab = registry.getLab('ai-ml/compress-the-corpus');
    const after = (n: number) => {
      let s = tokenizerEngine.init(1);
      for (let i = 0; i < n; i++) s = tokenizerEngine.step(s);
      return s;
    };
    expect(lab?.check(after(3))).toMatchObject({ passed: false, score: 30 });
    expect(lab?.check(after(7))).toMatchObject({ passed: false, score: 70 });
    expect(lab?.check(after(6))).toMatchObject({
      passed: true,
      score: 100,
      message: '48 tokens after 6 merges; one fewer would leave 54.',
    });
  });
});
