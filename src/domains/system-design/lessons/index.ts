import { defineLesson } from '@core/model';

export const scaling = defineLesson({
  slug: 'scaling-and-load-balancing',
  domainId: 'system-design',
  title: 'Scaling out and load balancing',
  summary:
    'Spreading requests across servers, and why the spreading rule matters as much as the server count.',
  estimatedMinutes: 9,
  prerequisites: [],
  outcomes: [
    'compute a server pool’s capacity',
    'compare round robin, least connections and random balancing',
    'explain why a slow server hurts round robin',
  ],
  tags: ['scaling', 'load-balancing', 'capacity'],
  blocks: [
    {
      type: 'paragraph',
      text: 'One server has a limit. **Scaling out** adds servers behind a **load balancer** that decides where each request goes. The pool here has two fast servers (3 work units per tick) and one old, slow one (1 unit per tick). Requests need 1 to 3 units, 2 on average, so the pool can sustain (3 + 3 + 1) ÷ 2 = **3.5 requests per tick**.',
    },
    {
      type: 'interactive',
      simulatorId: 'system-design/load-balancer',
      caption:
        'Run round robin at 3 requests per tick, then least connections. Watch the slow server’s queue and the dropped count.',
    },
    { type: 'heading', level: 2, text: 'What happens' },
    {
      type: 'list',
      items: [
        '**Round robin** sends every third request to the slow server no matter how busy it is. Its queue fills and requests are dropped, even though the pool as a whole has spare capacity.',
        '**Least connections** sends each request to the server with the shortest queue. The slow server naturally gets less work, and nothing is dropped.',
        '**Random** spreads load evenly on average, so it suffers the same way round robin does.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'More servers is not always the fix',
      text: 'At 5 requests per tick, least connections copes with four servers. Round robin still drops requests with six, because the slow server keeps receiving its full share. Fix the routing before buying hardware.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'system-design/scaling/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Speeds 3, 3 and 1 with requests averaging 2 work units. Sustainable rate?',
            choices: [
              { id: 'a', text: '3 requests per tick' },
              { id: 'b', text: '3.5 requests per tick' },
              { id: 'c', text: '7 requests per tick' },
            ],
            answerId: 'b',
            explanation: '7 units per tick ÷ 2 units per request.',
          },
          {
            id: 'q2',
            prompt: 'Why does round robin drop requests here while capacity remains?',
            choices: [
              { id: 'a', text: 'It ignores how busy each server is' },
              { id: 'b', text: 'It is slower to compute' },
              { id: 'c', text: 'It sends everything to one server' },
            ],
            answerId: 'a',
            explanation: 'It keeps feeding the slow server its full share.',
          },
        ],
      },
    },
  ],
});

export const caching = defineLesson({
  slug: 'caching',
  domainId: 'system-design',
  title: 'Caching',
  summary: 'Keeping hot data close, hit ratios, and why the first few slots matter most.',
  estimatedMinutes: 8,
  prerequisites: ['system-design/scaling-and-load-balancing'],
  outcomes: [
    'define hit ratio and compute average latency from it',
    'explain LRU eviction',
    'explain why skewed traffic makes small caches effective',
  ],
  tags: ['caching', 'lru', 'latency'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **cache** keeps copies of recently used data in fast storage. Here a cache answer takes 1 ms; going to the database takes 50 ms. When the cache is full, **LRU** (least recently used) eviction throws out whatever has gone unused the longest.',
    },
    {
      type: 'paragraph',
      text: 'Average latency = hit ratio × 1 ms + miss ratio × 50 ms. At a 90% hit ratio that is 0.9 × 1 + 0.1 × 50 = **5.9 ms**, against 50 ms with no cache at all.',
    },
    {
      type: 'interactive',
      simulatorId: 'system-design/lru-cache',
      caption: 'Play 200 requests. Then try sizes 1, 4, 6, 10 and 20 and compare the hit ratio.',
    },
    { type: 'heading', level: 2, text: 'Why small caches work' },
    {
      type: 'paragraph',
      text: 'Real traffic is skewed. Here popularity follows a Zipf distribution: the top 4 of 20 products receive about 58% of all requests. A cache holding just 6 products reaches a 60% hit ratio; going from 16 to 20 products buys far less. Even a cache big enough for everything misses 10% here — the first request for each of the 20 products, called **cold misses**.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The hard part',
      text: 'Caches serve old data until it is evicted or invalidated. Deciding when a cached copy is too stale is one of the genuinely hard problems in system design.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'system-design/caching/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Hit 1 ms, miss 50 ms, hit ratio 90%. Average latency?',
            choices: [
              { id: 'a', text: '5.9 ms' },
              { id: 'b', text: '45.1 ms' },
              { id: 'c', text: '1 ms' },
            ],
            answerId: 'a',
            explanation: '0.9 × 1 + 0.1 × 50.',
          },
          {
            id: 'q2',
            prompt: 'With LRU, which item is evicted?',
            choices: [
              { id: 'a', text: 'The oldest inserted' },
              { id: 'b', text: 'The one unused for longest' },
              { id: 'c', text: 'The least popular overall' },
            ],
            answerId: 'b',
            explanation: 'LRU tracks recency of use, not insertion order or long-run popularity.',
          },
        ],
      },
    },
  ],
});

export const queues = defineLesson({
  slug: 'queues-and-backpressure',
  domainId: 'system-design',
  title: 'Queues and backpressure',
  summary: 'Absorbing bursts, the one rule that decides whether a queue drains, and Little’s law.',
  estimatedMinutes: 8,
  prerequisites: ['system-design/scaling-and-load-balancing'],
  outcomes: [
    'explain how a queue decouples producers and consumers',
    'predict whether a queue drains from arrival and service rates',
    'apply Little’s law L = λW',
  ],
  tags: ['queues', 'async', 'backpressure', 'littles-law'],
  blocks: [
    {
      type: 'paragraph',
      text: 'A **message queue** sits between producers and consumers. Producers drop work in and move on; consumers take work out at their own pace. A queue turns a sudden burst into a backlog that drains later instead of a wave of errors.',
    },
    {
      type: 'interactive',
      simulatorId: 'system-design/message-queue',
      caption:
        'Five messages arrive per tick, plus a burst of ten extra for three ticks. Try 2, 3 and 4 consumers.',
    },
    { type: 'heading', level: 2, text: 'The rule' },
    {
      type: 'paragraph',
      text: 'If consumers can process fewer messages than arrive on average, the queue grows forever — no queue size fixes that. With 2 consumers handling 4 per tick against 5 arriving, it never catches up. With 3 consumers (6 per tick) the burst piles up briefly and then drains.',
    },
    { type: 'heading', level: 2, text: 'Little’s law' },
    {
      type: 'paragraph',
      text: 'For any stable queue, the average number of items inside (L) equals the arrival rate (λ) times the average time each spends inside (W): **L = λW**. If 4 messages arrive per second and each waits 2 seconds, 8 are in the system on average. The simulator shows both sides. Mid-run they differ, because messages still waiting have not finished their wait; once the queue has drained they match exactly.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Backpressure',
      text: 'When a queue cannot drain, the honest response is to push back on producers: reject, slow down or shed load early. A queue that silently grows just turns an outage into a slower, bigger outage.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'system-design/queues/quiz',
        questions: [
          {
            id: 'q1',
            prompt:
              '4 messages per second arrive and each spends 2 s in the system. Average number inside?',
            choices: [
              { id: 'a', text: '2' },
              { id: 'b', text: '6' },
              { id: 'c', text: '8' },
            ],
            answerId: 'c',
            explanation: 'L = λW = 4 × 2.',
          },
          {
            id: 'q2',
            prompt: 'Consumers handle 4 per tick; 5 arrive per tick. What happens?',
            choices: [
              { id: 'a', text: 'A bigger queue fixes it' },
              { id: 'b', text: 'The queue grows without bound' },
              { id: 'c', text: 'It drains slowly' },
            ],
            answerId: 'b',
            explanation: 'Arrivals exceed service rate, so the backlog only grows.',
          },
        ],
      },
    },
  ],
});

export const replication = defineLesson({
  slug: 'replication-and-consistency',
  domainId: 'system-design',
  title: 'Replication and consistency',
  summary: 'Copies of data on several machines, stale reads, and the quorum rule R + W > N.',
  estimatedMinutes: 9,
  prerequisites: ['system-design/caching'],
  outcomes: [
    'explain replication lag and stale reads',
    'state and use the quorum condition R + W > N',
    'describe the trade-off between consistency, latency and availability',
  ],
  tags: ['replication', 'consistency', 'quorum', 'distributed-systems'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Storing each item on several replicas (here N = 3) survives machine failures and spreads read load. But copies take time to update. A write is acknowledged once **W** replicas have it; a read asks **R** replicas and keeps the newest answer.',
    },
    {
      type: 'interactive',
      simulatorId: 'system-design/quorum',
      caption:
        'Step through a write and a read with W = 1, R = 1, then try W = 2, R = 2. The table shows the worst case for every setting.',
    },
    { type: 'heading', level: 2, text: 'The quorum rule' },
    {
      type: 'paragraph',
      text: 'If R + W > N, any R replicas you read must overlap with the W that took the write, so you always see the latest acknowledged value. If R + W ≤ N, an unlucky read can hit only replicas that have not caught up yet and return **stale** data — until background replication finishes.',
    },
    {
      type: 'list',
      items: [
        'W = 3, R = 1: fast reads, but a write fails if any replica is down.',
        'W = 1, R = 3: fast writes, slow and fragile reads.',
        'W = 2, R = 2: the common middle ground for N = 3, tolerating one failure on each side.',
        'W = 1, R = 1: fastest and most available, but only **eventually** consistent.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'There is no free lunch',
      text: 'During a network partition a system must choose between refusing some requests and serving possibly stale data. Every real database documents which it chooses, and when.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'system-design/replication/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'N = 3 and W = 2. Smallest R that guarantees reading the latest write?',
            choices: [
              { id: 'a', text: '1' },
              { id: 'b', text: '2' },
              { id: 'c', text: '3' },
            ],
            answerId: 'b',
            explanation: 'R + W > N requires R > 1.',
          },
          {
            id: 'q2',
            prompt: 'W = 1, R = 1 with N = 3 gives…',
            choices: [
              { id: 'a', text: 'Strong consistency' },
              { id: 'b', text: 'Eventual consistency' },
            ],
            answerId: 'b',
            explanation: '1 + 1 ≤ 3, so reads can be stale until replication catches up.',
          },
        ],
      },
    },
  ],
});
