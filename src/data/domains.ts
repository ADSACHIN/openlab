import type { DomainSummary } from '@typings/domain';

/**
 * The domain catalogue shown on the home page.
 * Order here is display order. Status flips as modules land (see ROADMAP.md).
 */
export const DOMAINS: readonly DomainSummary[] = [
  {
    id: 'networking',
    title: 'Networking',
    tagline: 'Watch packets travel, layer by layer.',
    description:
      'OSI and TCP/IP layers, addressing and subnetting, routing, DNS, TCP and TLS handshakes — all as step-through simulations.',
    icon: 'network',
    status: 'planned',
    topics: ['OSI / TCP-IP', 'Subnetting', 'DNS', 'TCP & TLS handshakes'],
  },
  {
    id: 'linux-os',
    title: 'Linux & OS',
    tagline: 'A shell you can break without consequences.',
    description:
      'Shell basics, the filesystem and permissions, processes and scheduling, virtual memory and sockets, inside a safe simulated terminal.',
    icon: 'terminal',
    status: 'planned',
    topics: ['Shell', 'Filesystem & permissions', 'Processes', 'Memory'],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    tagline: 'Think like an attacker, build like a defender.',
    description:
      'Ciphers and keyspace, password strength, hashing and salting, SQL injection and cross-site scripting — attacked and defended inside sandboxed simulators.',
    icon: 'shield',
    status: 'planned',
    topics: ['Keys & ciphers', 'Password hashing', 'SQL injection', 'XSS'],
  },
  {
    id: 'programming',
    title: 'Programming',
    tagline: 'See every step your code takes.',
    description:
      'Data structures, algorithms and paradigms visualised one operation at a time, plus debugging as a skill of its own.',
    icon: 'code',
    status: 'planned',
    topics: ['Data structures', 'Algorithms', 'Complexity', 'Debugging'],
  },
  {
    id: 'system-design',
    title: 'System Design',
    tagline: 'Overload a system and watch what bends first.',
    description:
      'Scaling, load balancing, caching, queues and consistency, explored with simulators you can push to failure.',
    icon: 'boxes',
    status: 'planned',
    topics: ['Load balancing', 'Caching', 'Queues', 'Consistency'],
  },
  {
    id: 'computer-science',
    title: 'Computer Science',
    tagline: 'From a single bit to a running CPU.',
    description:
      'Binary and two\u2019s complement, logic gates, an adder built from gates, a working CPU, and the finite automata behind regular expressions.',
    icon: 'cpu',
    status: 'planned',
    topics: ['Binary & logic', 'Adders', 'CPU cycle', 'Automata'],
  },
  {
    id: 'ai-ml',
    title: 'AI & ML',
    tagline: 'Train a model with your own hands.',
    description:
      'Perceptrons, gradient descent, how text becomes tokens, and how a language model picks its next word — each with a model you can tune.',
    icon: 'brain',
    status: 'planned',
    topics: ['Perceptron', 'Gradient descent', 'Tokenization', 'Sampling'],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps',
    tagline: 'Ship it, watch it, fix it.',
    description:
      'Version control, CI/CD pipelines, container image layers and reliability targets, built up piece by piece.',
    icon: 'cloud',
    status: 'planned',
    topics: ['Git', 'CI/CD', 'Containers', 'SLOs'],
  },
];

export function findDomain(id: string): DomainSummary | undefined {
  return DOMAINS.find((d) => d.id === id);
}
