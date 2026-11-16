import { defineLesson } from '@core/model';

export const perceptronLesson = defineLesson({
  slug: 'the-perceptron',
  domainId: 'ai-ml',
  title: 'The perceptron: a neuron that learns',
  summary: 'Weighted inputs, a threshold, a learning rule — and the one problem it cannot solve.',
  estimatedMinutes: 8,
  // Cross-domain: XOR was introduced as a logic gate.
  prerequisites: ['computer-science/logic-gates'],
  outcomes: [
    'describe a perceptron as a weighted sum plus a threshold',
    'explain the perceptron learning rule',
    'explain why XOR needs more than one neuron',
  ],
  tags: ['neural-networks', 'perceptron', 'classification', 'xor'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **perceptron** multiplies each input by a weight, adds a bias, and outputs +1 if the total is positive, −1 otherwise. Geometrically, it draws a straight line and labels the two sides.',
    },
    {
      type: 'paragraph',
      text: '**Learning**: show it one example at a time. If it is right, do nothing. If it is wrong, nudge the weights towards the right answer. Repeat over the data (each pass is an **epoch**) until a pass makes no mistakes.',
    },
    {
      type: 'interactive',
      simulatorId: 'ai-ml/perceptron',
      caption: 'Press Play on the separable data, then switch to the XOR corners and try again.',
    },
    { type: 'heading', level: 2, text: 'What happens' },
    {
      type: 'list',
      items: [
        'On separable data the line settles within a few epochs and every point ends up on the correct side. For data that a line *can* split, this is guaranteed (the perceptron convergence theorem).',
        'On the XOR corners it never settles: it gives up after 25 epochs. No straight line puts both same-sign corners on one side and both opposite-sign corners on the other.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Why this mattered',
      text: 'In 1969 Minsky and Papert showed that single-layer perceptrons cannot compute XOR, and enthusiasm for neural networks collapsed for years. The fix — stacking layers of neurons with a non-linear step between them, trained by gradient descent — is the basis of every modern network.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'ai-ml/perceptron/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'When does the perceptron rule change the weights?',
            choices: [
              { id: 'a', text: 'After every example' },
              { id: 'b', text: 'Only when it misclassifies an example' },
              { id: 'c', text: 'Only at the end of an epoch' },
            ],
            answerId: 'b',
            explanation: 'Correct answers leave the weights alone.',
          },
          {
            id: 'q2',
            prompt: 'Why can a single perceptron not learn XOR?',
            choices: [
              { id: 'a', text: 'Too little data' },
              {
                id: 'b',
                text: 'Its boundary is a straight line, and XOR is not linearly separable',
              },
              { id: 'c', text: 'The learning rate is wrong' },
            ],
            answerId: 'b',
            explanation: 'No setting of the weights helps; it needs another layer.',
          },
        ],
      },
    },
  ],
});

export const gradientLesson = defineLesson({
  slug: 'gradient-descent',
  domainId: 'ai-ml',
  title: 'Gradient descent and the learning rate',
  summary: 'How models learn by walking downhill, and why the step size can make or break it.',
  estimatedMinutes: 9,
  prerequisites: ['ai-ml/the-perceptron'],
  outcomes: [
    'explain loss, gradient and learning rate',
    'recognise crawling, converging, oscillating and diverging',
    'explain why steep and shallow directions make training hard',
  ],
  tags: ['optimisation', 'gradient-descent', 'learning-rate', 'training'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Training a model means minimising a **loss**: a number that measures how wrong it is. The **gradient** points uphill, so each step moves the parameters a little in the opposite direction. How far is set by the **learning rate**.',
    },
    {
      type: 'paragraph',
      text: 'The surface here is loss = x² + 10y²: a long valley, ten times steeper across (y) than along it (x). We start at (4, 1), where the loss is 26.',
    },
    {
      type: 'interactive',
      simulatorId: 'ai-ml/gradient-descent',
      caption: 'Try 0.05, 0.08, 0.1 and 0.11. Each step is one update.',
    },
    { type: 'heading', level: 2, text: 'Four behaviours' },
    {
      type: 'list',
      items: [
        '**Crawling**: at 0.05 the path converges but needs more than 30 steps to get the loss under 0.01.',
        '**Converging**: at 0.08 or 0.09 it gets there within 30 steps.',
        '**Oscillating**: at exactly 0.1 the steep direction overshoots perfectly, and y bounces between +1 and −1 forever.',
        '**Diverging**: at 0.11 each bounce is bigger than the last, and the loss explodes.',
      ],
    },
    {
      type: 'paragraph',
      text: 'The steep direction decides the largest safe step: here anything at or above 0.1 never settles. But a step that small is slow along the shallow direction. Real models have millions of directions with wildly different steepness, which is why optimisers such as momentum and Adam adapt the step per parameter.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'ai-ml/gradient/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Which direction does a gradient-descent step move?',
            choices: [
              { id: 'a', text: 'Along the gradient' },
              { id: 'b', text: 'Against the gradient' },
              { id: 'c', text: 'At random' },
            ],
            answerId: 'b',
            explanation: 'The gradient points uphill; we want downhill.',
          },
          {
            id: 'q2',
            prompt: 'On this surface, what happens at learning rate 0.11?',
            choices: [
              { id: 'a', text: 'It converges quickly' },
              { id: 'b', text: 'It crawls' },
              { id: 'c', text: 'It diverges' },
            ],
            answerId: 'c',
            explanation: 'In the steep direction each step multiplies y by −1.2, so it grows.',
          },
        ],
      },
    },
  ],
});

export const tokenization = defineLesson({
  slug: 'tokenization',
  domainId: 'ai-ml',
  title: 'Tokenization: how text becomes numbers',
  summary: 'Byte-pair encoding, the subword trick behind language models’ vocabularies.',
  estimatedMinutes: 8,
  prerequisites: ['ai-ml/gradient-descent'],
  outcomes: [
    'explain why models use subword tokens rather than words or characters',
    'run byte-pair encoding by hand',
    'predict how an unseen word will be split',
  ],
  tags: ['nlp', 'tokenization', 'bpe', 'llm'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Language models do not see letters or words; they see **tokens** from a fixed vocabulary. Whole words would need an endless vocabulary; single characters make sequences very long. **Byte-pair encoding** (BPE) finds the middle ground automatically.',
    },
    {
      type: 'paragraph',
      text: 'Start with every word split into characters plus an end-of-word marker. Count every adjacent pair across the corpus, merge the most frequent pair into a new symbol, and repeat. Each merge makes the vocabulary one symbol bigger and the text shorter.',
    },
    {
      type: 'interactive',
      simulatorId: 'ai-ml/bpe-tokenizer',
      caption:
        'The corpus from the 2016 paper that brought BPE to language models: low ×5, lower ×2, newest ×6, widest ×3. Press Step to learn one merge.',
    },
    { type: 'heading', level: 2, text: 'What to notice' },
    {
      type: 'list',
      items: [
        'The corpus starts at 95 tokens. The first merges are `es`, `est`, `est_`, `lo` and `low`: common endings and stems emerge on their own.',
        'Six merges bring the corpus under 50 tokens (48).',
        'Words never seen in training still work: after six merges, “lowest” becomes `low` + `est_`, and “newer” falls back to smaller pieces.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Why you should care',
      text: 'Model limits and prices are counted in tokens, not words. And because a model sees `est_` rather than e-s-t, tasks like counting the letters in a word are surprisingly hard for it.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'ai-ml/tokenization/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'What does each BPE step merge?',
            choices: [
              { id: 'a', text: 'The two rarest symbols' },
              { id: 'b', text: 'The most frequent adjacent pair' },
              { id: 'c', text: 'Whole words' },
            ],
            answerId: 'b',
            explanation: 'Counted across the whole corpus, weighted by word frequency.',
          },
          {
            id: 'q2',
            prompt: 'How many merges does this corpus need to drop below 50 tokens?',
            choices: [
              { id: 'a', text: '3' },
              { id: 'b', text: '6' },
              { id: 'c', text: '10' },
            ],
            answerId: 'b',
            explanation: '95 → 86 → 77 → 68 → 61 → 54 → 48.',
          },
        ],
      },
    },
  ],
});

export const samplingLesson = defineLesson({
  slug: 'sampling-and-temperature',
  domainId: 'ai-ml',
  title: 'Choosing the next word: softmax and temperature',
  summary:
    'How a language model turns scores into probabilities, and what the temperature setting really does.',
  estimatedMinutes: 7,
  prerequisites: ['ai-ml/tokenization'],
  outcomes: [
    'explain logits and softmax',
    'predict the effect of raising or lowering temperature',
    'distinguish greedy decoding from sampling',
  ],
  tags: ['llm', 'softmax', 'temperature', 'sampling'],
  blocks: [
    {
      type: 'paragraph',
      text: 'For every possible next token, a language model outputs a score called a **logit**. **Softmax** turns the scores into probabilities that add up to 1. Then one token is chosen, appended, and the whole process repeats.',
    },
    {
      type: 'paragraph',
      text: '**Temperature** divides every logit before the softmax. Below 1 it sharpens the distribution towards the top choice; above 1 it flattens it.',
    },
    {
      type: 'interactive',
      simulatorId: 'ai-ml/next-token-sampling',
      caption: '“The cat sat on the …” Draw 50 samples at temperature 0.1, 1 and 2.',
    },
    {
      type: 'list',
      items: [
        'At temperature 1, “mat” has about a 50% chance.',
        'At 2, it drops to about a third, and over 50 samples even “keyboard” and “moon” turn up.',
        'At 0.1, “mat” has over 99.9%: effectively **greedy decoding**, always the same answer.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Which setting?',
      text: 'Low temperatures suit factual answers and code, where the top choice is usually right and variety is risk. Higher temperatures suit brainstorming. Real systems combine temperature with other filters such as top-p, which samples only from the smallest set of tokens covering most of the probability.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'ai-ml/sampling/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Raising the temperature does what to the distribution?',
            choices: [
              { id: 'a', text: 'Sharpens it' },
              { id: 'b', text: 'Flattens it' },
              { id: 'c', text: 'Nothing' },
            ],
            answerId: 'b',
            explanation: 'Dividing logits by a larger number shrinks their differences.',
          },
          {
            id: 'q2',
            prompt: 'Temperature close to 0 is effectively…',
            choices: [
              { id: 'a', text: 'Greedy decoding' },
              { id: 'b', text: 'Uniform sampling' },
            ],
            answerId: 'a',
            explanation: 'The top token takes almost all of the probability.',
          },
        ],
      },
    },
  ],
});
