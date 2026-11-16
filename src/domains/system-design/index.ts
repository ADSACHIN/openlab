import { defineModule } from '@core/model';
import { balanceLab, cacheLab } from './labs';
import { caching, queues, replication, scaling } from './lessons';
import { simulators } from './simulators';

export const systemDesignModule = defineModule({
  id: 'system-design',
  lessons: [scaling, caching, queues, replication],
  labs: [balanceLab, cacheLab],
  simulators,
});
