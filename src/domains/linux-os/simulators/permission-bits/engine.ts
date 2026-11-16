import type { SimulatorEngine } from '@core/model';
import { modeToOctal, modeToString } from '../../lib/vfs';

export interface PermissionBitsState {
  mode: number;
  isDir: boolean;
}
export type PermissionBitsAction =
  | { type: 'toggle'; bit: number }
  | { type: 'set'; mode: number }
  | { type: 'kind'; isDir: boolean };

export const WHO = ['owner', 'group', 'others'] as const;
export const WHAT = ['read', 'write', 'execute'] as const;

export function hasBit(mode: number, who: number, what: number): boolean {
  return (mode & (1 << (8 - (who * 3 + what)))) !== 0;
}

export function explain(mode: number, isDir: boolean): string {
  const parts = WHO.map((w, i) => {
    const r = hasBit(mode, i, 0);
    const wr = hasBit(mode, i, 1);
    const x = hasBit(mode, i, 2);
    const can: string[] = [];
    if (r) can.push(isDir ? 'list' : 'read');
    if (wr) can.push(isDir ? 'create/delete inside' : 'modify');
    if (x) can.push(isDir ? 'enter' : 'run');
    return `${w}: ${can.length ? can.join(', ') : 'nothing'}`;
  });
  return parts.join('; ');
}

export const permissionBitsEngine: SimulatorEngine<PermissionBitsState, PermissionBitsAction> = {
  init: () => ({ mode: 0o644, isDir: false }),
  step: (s) => s,
  isDone: () => false,
  apply: (s, a) => {
    switch (a.type) {
      case 'toggle':
        return a.bit >= 0 && a.bit <= 8 ? { ...s, mode: s.mode ^ (1 << (8 - a.bit)) } : s;
      case 'set':
        return a.mode >= 0 && a.mode <= 0o777 ? { ...s, mode: a.mode } : s;
      case 'kind':
        return { ...s, isDir: a.isDir };
    }
  },
  describe: (s) =>
    `${modeToString(s.mode, s.isDir ? 'dir' : 'file')} (${modeToOctal(s.mode)}). ${explain(s.mode, s.isDir)}.`,
};
