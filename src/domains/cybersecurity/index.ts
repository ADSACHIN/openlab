import { defineModule } from '@core/model';
import { bypassLab, escapeLab } from './labs';
import { encryption, hashing, passwords, sqlInjection, xssLesson } from './lessons';
import { simulators } from './simulators';

export const cybersecurityModule = defineModule({
  id: 'cybersecurity',
  lessons: [encryption, passwords, hashing, sqlInjection, xssLesson],
  labs: [bypassLab, escapeLab],
  simulators,
});
