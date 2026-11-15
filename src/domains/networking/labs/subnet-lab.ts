import { defineLab } from '@core/model';
import { smallestPrefixFor, usableHosts } from '../lib/ipv4';
import type { SubnetPlannerState } from '../simulators/subnet-planner/engine';

export const subnetLab = defineLab({
  slug: 'size-a-subnet',
  domainId: 'networking',
  title: 'Size a subnet for 50 hosts',
  summary: 'Pick the tightest prefix that still leaves room for every host.',
  estimatedMinutes: 4,
  prerequisites: ['networking/ip-addressing'],
  simulatorId: 'networking/subnet-planner',
  goal: 'From 10.20.0.0, choose the longest prefix that still gives at least 50 usable host addresses.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Move the slider. The block must fit **50 hosts** with as little waste as possible: if the next-longer prefix would still fit, you are not done.',
    },
  ],
  check: (state) => {
    const s = state as SubnetPlannerState;
    const hosts = usableHosts(s.prefix);
    const best = smallestPrefixFor(s.requiredHosts);
    if (hosts < s.requiredHosts) {
      return {
        passed: false,
        message: `/${String(s.prefix)} only gives ${String(hosts)} usable hosts; you need ${String(s.requiredHosts)}. Make the prefix shorter.`,
        score: 20,
      };
    }
    if (s.prefix < best) {
      return {
        passed: false,
        message: `/${String(s.prefix)} fits, but wastes addresses: a longer prefix would still hold ${String(s.requiredHosts)} hosts.`,
        score: 60,
      };
    }
    return {
      passed: true,
      message: `/${String(best)} is the tightest fit: ${String(hosts)} usable addresses for ${String(s.requiredHosts)} hosts.`,
      score: 100,
    };
  },
});
