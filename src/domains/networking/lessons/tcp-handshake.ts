import { defineLesson } from '@core/model';

export const tcpHandshakeLesson = defineLesson({
  slug: 'tcp-handshake',
  domainId: 'networking',
  title: 'TCP: the three-way handshake',
  summary:
    'How two hosts agree to talk, why it takes three segments, and what the sequence numbers are for.',
  estimatedMinutes: 8,
  prerequisites: ['networking/packet-journey'],
  outcomes: [
    'describe SYN, SYN-ACK and ACK and the state each side is in',
    'explain what initial sequence numbers are and why they are random',
    'recognise a half-open connection',
  ],
  tags: ['tcp', 'handshake', 'transport', 'reliability'],
  blocks: [
    {
      type: 'paragraph',
      text: 'TCP promises an ordered, reliable byte stream over an unreliable network. Before any data flows, both sides must agree on starting **sequence numbers** so they can detect loss and reordering. That agreement is the handshake.',
    },
    {
      type: 'interactive',
      simulatorId: 'networking/tcp-handshake',
      caption:
        'Press Step to let the hosts do it, or send the segments yourself. Out-of-order segments are rejected.',
    },
    { type: 'heading', level: 2, text: 'Why three?' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**SYN** — the client proposes its initial sequence number (ISN). State: `SYN-SENT`.',
        '**SYN-ACK** — the server acknowledges the client’s ISN (`ack = ISN + 1`) and proposes its own. State: `SYN-RECEIVED`.',
        '**ACK** — the client acknowledges the server’s ISN. Both sides are now `ESTABLISHED`.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Two messages would let the client confirm the server is there, but the server would never know whether its own SYN arrived. The third segment closes that gap.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Half-open connections',
      text: 'If a server receives many SYNs that are never acknowledged, it keeps half-open state for each one. That is the basis of SYN flooding; SYN cookies let a server avoid storing state until the final ACK arrives.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'networking/tcp-handshake/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'The client’s SYN has `seq=4000`. What `ack` does the SYN-ACK carry?',
            choices: [
              { id: 'a', text: '4000' },
              { id: 'b', text: '4001' },
              { id: 'c', text: 'Its own ISN' },
            ],
            answerId: 'b',
            explanation: 'The SYN consumes one sequence number, so the next expected byte is 4001.',
          },
          {
            id: 'q2',
            prompt: 'After sending SYN-ACK, the server is in state…',
            choices: [
              { id: 'a', text: 'LISTEN' },
              { id: 'b', text: 'SYN-RECEIVED' },
              { id: 'c', text: 'ESTABLISHED' },
            ],
            answerId: 'b',
            explanation: 'It becomes ESTABLISHED only when the client’s ACK arrives.',
          },
        ],
      },
    },
  ],
});
