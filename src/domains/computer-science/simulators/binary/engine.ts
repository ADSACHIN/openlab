import type { SimulatorEngine } from '@core/model';

export interface BinaryState {
  /** Unsigned 8-bit value, 0–255. */
  value: number;
}
export type BinaryAction = { type: 'toggle'; bit: number } | { type: 'set'; value: number };

export const toBits = (v: number): string => v.toString(2).padStart(8, '0');
export const toHex = (v: number): string => v.toString(16).toUpperCase().padStart(2, '0');
/** Two's complement reading of the same eight bits. */
export const toSigned = (v: number): number => (v >= 128 ? v - 256 : v);

export const binaryEngine: SimulatorEngine<BinaryState, BinaryAction> = {
  init: () => ({ value: 0 }),
  // Playing counts upward, wrapping from 255 back to 0 like a real 8-bit register.
  step: (s) => ({ value: (s.value + 1) & 0xff }),
  isDone: () => false,
  apply: (s, a) => {
    if (a.type === 'toggle')
      return a.bit >= 0 && a.bit <= 7 ? { value: s.value ^ (1 << a.bit) } : s;
    return Number.isInteger(a.value) && a.value >= 0 && a.value <= 255 ? { value: a.value } : s;
  },
  describe: (s) =>
    `${toBits(s.value)}: ${String(s.value)} unsigned, ${String(toSigned(s.value))} signed (two's complement), hex ${toHex(s.value)}.`,
};
