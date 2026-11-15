import { defineLesson } from '@core/model';

export const ipAddressing = defineLesson({
  slug: 'ip-addressing',
  domainId: 'networking',
  title: 'IP addressing and subnetting',
  summary: 'Addresses as 32-bit numbers, prefixes and masks, and how to size a subnet.',
  estimatedMinutes: 10,
  prerequisites: ['networking/osi-model'],
  outcomes: [
    'convert between dotted decimal, binary and prefix notation',
    'compute network and broadcast addresses for a prefix',
    'choose the smallest prefix that fits a host count',
  ],
  tags: ['ipv4', 'subnetting', 'cidr', 'mask'],
  blocks: [
    {
      type: 'paragraph',
      text: 'An IPv4 address is a 32-bit number written as four decimal bytes, like `192.168.1.20`. A **prefix length** (`/24`) says how many leading bits identify the network; the rest identify the host.',
    },
    {
      type: 'code',
      language: 'text',
      code: '192.168.1.20/24\n11000000.10101000.00000001.00010100\n|<------ network (24) ------>|<host>|\nmask      255.255.255.0\nnetwork   192.168.1.0\nbroadcast 192.168.1.255\nusable    192.168.1.1 – 192.168.1.254  (254 hosts)',
    },
    { type: 'heading', level: 2, text: 'Sizing a block' },
    {
      type: 'paragraph',
      text: 'A prefix of `/n` leaves `32 - n` host bits, giving `2^(32-n)` addresses. Two are reserved: the all-zeros **network** address and the all-ones **broadcast** address. Drag the slider and watch the numbers.',
    },
    {
      type: 'interactive',
      simulatorId: 'networking/subnet-planner',
      caption: 'Shorter prefix = bigger block. Find the longest prefix that still fits 50 hosts.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Rule of thumb',
      text: 'Each bit you take from the host part halves the block and doubles the number of subnets. /25 splits a /24 in two; /26 in four.',
    },
    { type: 'heading', level: 2, text: 'Private and special ranges' },
    {
      type: 'list',
      items: [
        '`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` — private, never routed on the internet (RFC 1918)',
        '`127.0.0.0/8` — loopback, your own machine',
        '`169.254.0.0/16` — link-local, self-assigned when DHCP fails',
        '`0.0.0.0/0` — the default route: "everything else"',
      ],
    },
    {
      type: 'quiz',
      quiz: {
        id: 'networking/ip-addressing/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'How many usable host addresses are in a `/26`?',
            choices: [
              { id: 'a', text: '64' },
              { id: 'b', text: '62' },
              { id: 'c', text: '126' },
            ],
            answerId: 'b',
            explanation: '2^(32-26) = 64 addresses, minus network and broadcast = 62.',
          },
          {
            id: 'q2',
            prompt: 'What is the broadcast address of `10.1.37.200/20`?',
            choices: [
              { id: 'a', text: '10.1.47.255' },
              { id: 'b', text: '10.1.37.255' },
              { id: 'c', text: '10.1.255.255' },
            ],
            answerId: 'a',
            explanation:
              'A /20 keeps 4 bits of the third byte: 37 = 0010 0101 → network 32, broadcast 47.',
          },
          {
            id: 'q3',
            prompt: 'You need 300 hosts in one subnet. Smallest block?',
            choices: [
              { id: 'a', text: '/24' },
              { id: 'b', text: '/23' },
              { id: 'c', text: '/22' },
            ],
            answerId: 'b',
            explanation: '/24 gives 254; /23 gives 510, which fits.',
          },
        ],
      },
    },
  ],
});
