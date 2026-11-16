import { defineModule } from '@core/model';
import { learningRateLab, tokenizerLab } from './labs';
import { gradientLesson, perceptronLesson, samplingLesson, tokenization } from './lessons';
import { simulators } from './simulators';

export const aiMlModule = defineModule({
  id: 'ai-ml',
  lessons: [perceptronLesson, gradientLesson, tokenization, samplingLesson],
  labs: [learningRateLab, tokenizerLab],
  simulators,
});
