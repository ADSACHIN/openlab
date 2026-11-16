import type { SimulatorEngine } from '@core/model';

export const PER_CONSUMER = 2;
export const ARRIVAL_TICKS = 40;
export const BURST_TICKS: readonly number[] = [10, 11, 12];
export const BURST_EXTRA = 10;
export const MAX_TICKS = 200;

export interface QueueState {
  rate: number;
  consumers: number;
  tick: number;
  /** Arrival tick of each queued message, oldest first. */
  queue: readonly number[];
  history: readonly number[];
  arrived: number;
  processed: number;
  /** Σ over ticks of messages in the system (counted after arrivals). */
  areaUnderQueue: number;
  /** Σ over processed messages of (departure tick − arrival tick). */
  totalTimeInSystem: number;
  peak: number;
}
export type QueueAction =
  { type: 'set-rate'; rate: number } | { type: 'set-consumers'; consumers: number };

export function arrivalsAt(tick: number, rate: number): number {
  if (tick >= ARRIVAL_TICKS) return 0;
  return rate + (BURST_TICKS.includes(tick) ? BURST_EXTRA : 0);
}

export function initQueue(rate: number, consumers: number): QueueState {
  return {
    rate,
    consumers,
    tick: 0,
    queue: [],
    history: [],
    arrived: 0,
    processed: 0,
    areaUnderQueue: 0,
    totalTimeInSystem: 0,
    peak: 0,
  };
}

export function tickQueue(s: QueueState): QueueState {
  if (isQueueDone(s)) return s;
  const n = arrivalsAt(s.tick, s.rate);
  const queue = [...s.queue, ...Array.from({ length: n }, () => s.tick)];
  const inSystem = queue.length;
  const capacity = s.consumers * PER_CONSUMER;
  const served = queue.splice(0, capacity);
  const departure = s.tick + 1;
  return {
    ...s,
    tick: s.tick + 1,
    queue,
    history: [...s.history, queue.length],
    arrived: s.arrived + n,
    processed: s.processed + served.length,
    areaUnderQueue: s.areaUnderQueue + inSystem,
    totalTimeInSystem: s.totalTimeInSystem + served.reduce((sum, a) => sum + (departure - a), 0),
    peak: Math.max(s.peak, queue.length),
  };
}

export function isQueueDone(s: QueueState): boolean {
  return s.tick >= MAX_TICKS || (s.tick >= ARRIVAL_TICKS && s.queue.length === 0);
}

/** Little's law: L = λ × W. */
export const littlesL = (lambda: number, w: number): number => lambda * w;

export const queueEngine: SimulatorEngine<QueueState, QueueAction> = {
  init: () => initQueue(5, 3),
  step: tickQueue,
  isDone: isQueueDone,
  apply: (s, a) => {
    if (a.type === 'set-rate')
      return a.rate >= 1 && a.rate <= 8 ? initQueue(a.rate, s.consumers) : s;
    return a.consumers >= 1 && a.consumers <= 6 ? initQueue(s.rate, a.consumers) : s;
  },
  describe: (s) => {
    const growing = s.consumers * PER_CONSUMER < s.rate;
    const end = isQueueDone(s)
      ? s.queue.length === 0
        ? ' Drained.'
        : ' Stopped: the queue never drains.'
      : '';
    return `Tick ${String(s.tick)}: ${String(s.queue.length)} waiting (peak ${String(s.peak)}). ${String(s.consumers)} consumers handle ${String(s.consumers * PER_CONSUMER)} per tick against ${String(s.rate)} arriving${growing ? ' — the queue can only grow' : ''}.${end}`;
  },
};
