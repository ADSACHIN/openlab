import { defineModule } from '@core/model';
import { quantumLab, secureKeyLab } from './labs';
import { filesystem, memory, permissions, processes, shellBasics } from './lessons';
import { simulators } from './simulators';

export const linuxOsModule = defineModule({
  id: 'linux-os',
  lessons: [shellBasics, filesystem, permissions, processes, memory],
  labs: [secureKeyLab, quantumLab],
  simulators,
});
