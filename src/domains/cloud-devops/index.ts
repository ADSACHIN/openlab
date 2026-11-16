import { defineModule } from '@core/model';
import { dockerLab, mergeLab, pipelineLab } from './labs';
import { cicd, containers, reliability, versionControl } from './lessons';
import { simulators } from './simulators';

export const cloudDevopsModule = defineModule({
  id: 'cloud-devops',
  lessons: [versionControl, cicd, containers, reliability],
  labs: [mergeLab, pipelineLab, dockerLab],
  simulators,
});
