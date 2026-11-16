import { defineSimulator } from '@core/model';
import { gradientEngine } from './gradient/engine';
import { GradientView } from './gradient/GradientView';
import { perceptronEngine } from './perceptron/engine';
import { PerceptronView } from './perceptron/PerceptronView';
import { samplingEngine } from './sampling/engine';
import { SamplingView } from './sampling/SamplingView';
import { tokenizerEngine } from './tokenizer/engine';
import { TokenizerView } from './tokenizer/TokenizerView';

const domainId = 'ai-ml' as const;

export const perceptron = defineSimulator({
  domainId,
  slug: 'perceptron',
  title: 'Perceptron',
  description: 'A single neuron learning a straight-line boundary.',
  engine: perceptronEngine,
  View: PerceptronView,
  tickRate: 8,
});
export const gradient = defineSimulator({
  domainId,
  slug: 'gradient-descent',
  title: 'Gradient descent',
  description: 'Rolling downhill on a loss surface with a chosen step size.',
  engine: gradientEngine,
  View: GradientView,
  tickRate: 3,
});
export const tokenizer = defineSimulator({
  domainId,
  slug: 'bpe-tokenizer',
  title: 'Byte-pair encoding',
  description: 'Learn subword tokens by merging frequent pairs.',
  engine: tokenizerEngine,
  View: TokenizerView,
  tickRate: 1,
});
export const sampling = defineSimulator({
  domainId,
  slug: 'next-token-sampling',
  title: 'Next-word sampling',
  description: 'Softmax, temperature and drawing the next word.',
  engine: samplingEngine,
  View: SamplingView,
  tickRate: 4,
});

export const simulators = [perceptron, gradient, tokenizer, sampling];
