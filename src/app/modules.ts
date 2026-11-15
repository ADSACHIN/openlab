import type { DomainModule } from '@core/model';
import { networkingModule } from '@domains/networking';

/** Every registered learning domain, in catalogue order. */
export const MODULES: readonly DomainModule[] = [networkingModule];
