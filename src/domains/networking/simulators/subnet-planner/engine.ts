import type { SimulatorEngine } from '@core/model';
import {
  broadcastAddress,
  formatIpv4,
  networkAddress,
  parseIpv4,
  usableHosts,
} from '../../lib/ipv4';

export interface SubnetPlannerState {
  baseIp: number;
  prefix: number;
  requiredHosts: number;
}
export interface SubnetPlannerAction {
  type: 'set-prefix';
  prefix: number;
}

export const PLANNER_BASE = '10.20.0.0';
export const PLANNER_REQUIRED_HOSTS = 50;

export const subnetPlannerEngine: SimulatorEngine<SubnetPlannerState, SubnetPlannerAction> = {
  init: () => ({
    baseIp: parseIpv4(PLANNER_BASE) ?? 0,
    prefix: 24,
    requiredHosts: PLANNER_REQUIRED_HOSTS,
  }),
  // A planner has no autonomous time; stepping is a no-op.
  step: (s) => s,
  isDone: () => false,
  apply: (s, a) =>
    Number.isInteger(a.prefix) && a.prefix >= 8 && a.prefix <= 32 ? { ...s, prefix: a.prefix } : s,
  describe: (s) =>
    `${formatIpv4(networkAddress(s.baseIp, s.prefix))}/${String(s.prefix)}: ${String(usableHosts(s.prefix))} usable hosts, broadcast ${formatIpv4(broadcastAddress(s.baseIp, s.prefix))}. Need ${String(s.requiredHosts)}.`,
};
