import { defineSimulator } from '@core/model';
import { pagingEngine } from './paging/engine';
import { PagingView } from './paging/PagingView';
import { permissionBitsEngine } from './permission-bits/engine';
import { PermissionBitsView } from './permission-bits/PermissionBitsView';
import { schedulerEngine } from './scheduler/engine';
import { SchedulerView } from './scheduler/SchedulerView';
import { terminalEngine } from './terminal/engine';
import { TerminalView } from './terminal/TerminalView';

const domainId = 'linux-os' as const;

export const terminal = defineSimulator({
  domainId,
  slug: 'terminal',
  title: 'Sandbox shell',
  description: 'A safe shell with a small filesystem: ls, cd, cat, echo, mkdir, chmod and friends.',
  engine: terminalEngine,
  View: TerminalView,
  controls: 'reset',
});
export const permissionBits = defineSimulator({
  domainId,
  slug: 'permission-bits',
  title: 'Permission bits',
  description: 'Toggle rwx bits and see the symbolic and octal forms.',
  engine: permissionBitsEngine,
  View: PermissionBitsView,
  controls: 'reset',
});
export const scheduler = defineSimulator({
  domainId,
  slug: 'scheduler',
  title: 'Round-robin scheduler',
  description: 'Three processes share one CPU; pick the quantum.',
  engine: schedulerEngine,
  View: SchedulerView,
  tickRate: 2,
});
export const paging = defineSimulator({
  domainId,
  slug: 'paging',
  title: 'Page replacement',
  description: 'FIFO vs LRU over a reference string.',
  engine: pagingEngine,
  View: PagingView,
  tickRate: 1.5,
});

export const simulators = [terminal, permissionBits, scheduler, paging];
