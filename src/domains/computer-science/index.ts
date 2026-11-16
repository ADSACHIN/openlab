import { defineModule } from '@core/model';
import { countdownLab, overflowLab } from './labs';
import { adders, automata, bits, cpuLesson, gatesLesson } from './lessons';
import { simulators } from './simulators';

export const computerScienceModule = defineModule({
  id: 'computer-science',
  lessons: [bits, gatesLesson, adders, cpuLesson, automata],
  labs: [overflowLab, countdownLab],
  simulators,
});
