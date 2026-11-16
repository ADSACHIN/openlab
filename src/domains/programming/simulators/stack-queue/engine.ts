import type { SimulatorEngine } from '@core/model';

export interface StackQueueState {
  stack: readonly number[];
  queue: readonly number[];
  next: number;
  lastEvent: string;
}
export type StackQueueAction =
  { type: 'push' } | { type: 'pop' } | { type: 'enqueue' } | { type: 'dequeue' };

const CAP = 6;

export const stackQueueEngine: SimulatorEngine<StackQueueState, StackQueueAction> = {
  init: () => ({ stack: [], queue: [], next: 1, lastEvent: 'Both structures are empty.' }),
  // Scripted demo when played: push/enqueue three, then pop/dequeue.
  // Phases are keyed on the item counter, so the demo always terminates.
  step: (s) => {
    if (s.next <= 3) return apply(s, { type: 'push' });
    if (s.next <= 6) return apply(s, { type: 'enqueue' });
    if (s.stack.length > 0) return apply(s, { type: 'pop' });
    if (s.queue.length > 0) return apply(s, { type: 'dequeue' });
    return s;
  },
  isDone: (s) => s.next > 6 && s.stack.length === 0 && s.queue.length === 0,
  apply,
  describe: (s) =>
    `${s.lastEvent} Stack top→bottom: ${[...s.stack].reverse().join(', ') || 'empty'}. Queue front→back: ${s.queue.join(', ') || 'empty'}.`,
};

function apply(s: StackQueueState, a: StackQueueAction): StackQueueState {
  switch (a.type) {
    case 'push':
      if (s.stack.length >= CAP) return { ...s, lastEvent: 'Stack is full (overflow).' };
      return {
        ...s,
        stack: [...s.stack, s.next],
        next: s.next + 1,
        lastEvent: `Pushed ${String(s.next)} onto the stack.`,
      };
    case 'pop': {
      const top = s.stack[s.stack.length - 1];
      if (top === undefined) return { ...s, lastEvent: 'Stack is empty (underflow).' };
      return {
        ...s,
        stack: s.stack.slice(0, -1),
        lastEvent: `Popped ${String(top)} — the most recently pushed.`,
      };
    }
    case 'enqueue':
      if (s.queue.length >= CAP) return { ...s, lastEvent: 'Queue is full.' };
      return {
        ...s,
        queue: [...s.queue, s.next],
        next: s.next + 1,
        lastEvent: `Enqueued ${String(s.next)} at the back.`,
      };
    case 'dequeue': {
      const [front, ...rest] = s.queue;
      if (front === undefined) return { ...s, lastEvent: 'Queue is empty.' };
      return { ...s, queue: rest, lastEvent: `Dequeued ${String(front)} — the earliest enqueued.` };
    }
  }
}
