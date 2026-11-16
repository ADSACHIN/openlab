import { defineSimulator } from '@core/model';
import { binarySearchEngine } from './binary-search/engine';
import { BinarySearchView } from './binary-search/BinarySearchView';
import { sortingEngine } from './sorting/engine';
import { SortingView } from './sorting/SortingView';
import { stackQueueEngine } from './stack-queue/engine';
import { StackQueueView } from './stack-queue/StackQueueView';
import { BUGGY_PROGRAM, SUM_PROGRAM, createTracerEngine } from './tracer/engine';
import { createTracerView } from './tracer/TracerView';

const domainId = 'programming' as const;

export const tracerSum = defineSimulator({
  domainId,
  slug: 'tracer-sum',
  title: 'Code tracer: sum 1 to 4',
  description: 'Step through a loop one line at a time and watch the variables.',
  engine: createTracerEngine(SUM_PROGRAM),
  View: createTracerView(SUM_PROGRAM),
  tickRate: 1.5,
});
export const tracerBuggy = defineSimulator({
  domainId,
  slug: 'tracer-buggy',
  title: 'Code tracer: the off-by-one',
  description: 'The same program with one character changed.',
  engine: createTracerEngine(BUGGY_PROGRAM),
  View: createTracerView(BUGGY_PROGRAM),
  tickRate: 1.5,
});
export const stackQueue = defineSimulator({
  domainId,
  slug: 'stack-queue',
  title: 'Stack and queue',
  description: 'Push, pop, enqueue, dequeue.',
  engine: stackQueueEngine,
  View: StackQueueView,
  tickRate: 1,
});
export const sorting = defineSimulator({
  domainId,
  slug: 'sorting',
  title: 'Sorting visualiser',
  description: 'Bubble, insertion and selection sort on different inputs.',
  engine: sortingEngine,
  View: SortingView,
  tickRate: 4,
});
export const binarySearch = defineSimulator({
  domainId,
  slug: 'binary-search',
  title: 'Binary search',
  description: 'Find a number in a sorted list by halving.',
  engine: binarySearchEngine,
  View: BinarySearchView,
  tickRate: 1,
});

export const simulators = [tracerSum, tracerBuggy, stackQueue, sorting, binarySearch];
