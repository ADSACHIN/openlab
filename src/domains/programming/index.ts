import { defineModule } from '@core/model';
import { fiveGuessesLab, nearlySortedLab } from './labs';
import { debugging, searching, sortingLesson, stacksAndQueues, stateAndSteps } from './lessons';
import { simulators } from './simulators';

export const programmingModule = defineModule({
  id: 'programming',
  lessons: [stateAndSteps, stacksAndQueues, sortingLesson, searching, debugging],
  labs: [nearlySortedLab, fiveGuessesLab],
  simulators,
});
