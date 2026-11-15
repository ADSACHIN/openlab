import { defineLesson } from '@core/model';

export const osiModel = defineLesson({
  slug: 'osi-model',
  domainId: 'networking',
  title: 'The layers: OSI and TCP/IP',
  summary:
    'Why networking is split into layers, what each one is responsible for, and how the two models line up.',
  estimatedMinutes: 8,
  prerequisites: [],
  outcomes: [
    'name the seven OSI layers and the job of each',
    'map the OSI layers onto the four TCP/IP layers',
    'say which unit (bits, frame, packet, segment) belongs to which layer',
  ],
  tags: ['osi', 'tcp/ip', 'layers', 'fundamentals'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Sending a web page across the world involves radio or copper, addresses, routes, retransmissions and encryption. No single piece of software handles all of that. Instead, each concern lives in a **layer** that only talks to the layer directly above and below it.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Why layers?',
      text: 'A layer can be replaced without touching the others. Wi-Fi replaced Ethernet cables, IPv6 is replacing IPv4, QUIC is replacing TCP for the web — and HTTP kept working through all of it.',
    },
    { type: 'heading', level: 2, text: 'Explore the seven layers' },
    {
      type: 'paragraph',
      text: 'Select a layer below, or press Play to walk down the stack. Note the **unit** each layer works with: the same bytes are called a segment, then a packet, then a frame, as headers are added.',
    },
    {
      type: 'interactive',
      simulatorId: 'networking/layer-explorer',
      caption:
        'The OSI reference model, top (closest to your program) to bottom (closest to the wire).',
    },
    { type: 'heading', level: 2, text: 'OSI versus TCP/IP' },
    {
      type: 'paragraph',
      text: 'Real networks are built on the four-layer TCP/IP model. OSI is the vocabulary everyone uses to talk about them. The mapping is simple:',
    },
    {
      type: 'list',
      items: [
        'TCP/IP **Application** = OSI layers 7, 6 and 5',
        'TCP/IP **Transport** = OSI layer 4',
        'TCP/IP **Internet** = OSI layer 3',
        'TCP/IP **Link** = OSI layers 2 and 1',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'When someone says "a layer 3 switch" or "a layer 7 load balancer", they mean the OSI number: routes on IP addresses, or routes on HTTP content.',
    },
    {
      type: 'quiz',
      quiz: {
        id: 'networking/osi-model/quiz',
        questions: [
          {
            id: 'q1',
            prompt: 'Which layer decides the path a packet takes between networks?',
            choices: [
              { id: 'a', text: 'Transport (4)' },
              { id: 'b', text: 'Network (3)' },
              { id: 'c', text: 'Data Link (2)' },
            ],
            answerId: 'b',
            explanation:
              'Routing between networks uses IP addresses, a layer 3 concern. Layer 2 only delivers on one link.',
          },
          {
            id: 'q2',
            prompt: 'A TCP segment with its IP header added is called a…',
            choices: [
              { id: 'a', text: 'Frame' },
              { id: 'b', text: 'Packet' },
              { id: 'c', text: 'Datagram unit' },
            ],
            answerId: 'b',
            explanation:
              'Layer 3 wraps the segment into a packet; layer 2 then wraps the packet into a frame.',
          },
          {
            id: 'q3',
            prompt: 'Which OSI layers does the TCP/IP Application layer cover?',
            choices: [
              { id: 'a', text: '7 only' },
              { id: 'b', text: '7 and 6' },
              { id: 'c', text: '7, 6 and 5' },
            ],
            answerId: 'c',
            explanation:
              'Presentation and session concerns are folded into the application protocol in TCP/IP.',
          },
        ],
      },
    },
  ],
});
