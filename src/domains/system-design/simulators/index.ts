import { defineSimulator } from '@core/model';
import { cacheEngine } from './cache/engine';
import { CacheView } from './cache/CacheView';
import { lbEngine } from './load-balancer/engine';
import { LoadBalancerView } from './load-balancer/LoadBalancerView';
import { queueEngine } from './queue/engine';
import { QueueView } from './queue/QueueView';
import { quorumEngine } from './quorum/engine';
import { QuorumView } from './quorum/QuorumView';

const domainId = 'system-design' as const;

export const loadBalancer = defineSimulator({
  domainId,
  slug: 'load-balancer',
  title: 'Load balancer',
  description: 'Three algorithms, one slow server, and a queue limit.',
  engine: lbEngine,
  View: LoadBalancerView,
  tickRate: 4,
});
export const cache = defineSimulator({
  domainId,
  slug: 'lru-cache',
  title: 'LRU cache',
  description: 'A cache in front of a slow database under skewed traffic.',
  engine: cacheEngine,
  View: CacheView,
  tickRate: 12,
});
export const queue = defineSimulator({
  domainId,
  slug: 'message-queue',
  title: 'Message queue',
  description: 'Producers, consumers, a burst, and Little’s law.',
  engine: queueEngine,
  View: QueueView,
  tickRate: 4,
});
export const quorum = defineSimulator({
  domainId,
  slug: 'quorum',
  title: 'Replication quorum',
  description: 'Write to W replicas, read from R, and see when reads go stale.',
  engine: quorumEngine,
  View: QuorumView,
  tickRate: 0.75,
});

export const simulators = [loadBalancer, cache, queue, quorum];
