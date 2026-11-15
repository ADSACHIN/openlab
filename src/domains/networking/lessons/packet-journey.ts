import { defineLesson } from '@core/model';

export const packetJourney = defineLesson({
  slug: 'packet-journey',
  domainId: 'networking',
  title: 'Encapsulation: a packet’s journey',
  summary:
    'How data gains a header at each layer on the way out, and loses them again on the way in.',
  estimatedMinutes: 6,
  prerequisites: ['networking/osi-model'],
  outcomes: [
    'explain encapsulation and decapsulation',
    'read a frame as nested headers around a payload',
    'say which addresses change hop by hop and which do not',
  ],
  tags: ['encapsulation', 'headers', 'frame', 'packet'],
  blocks: [
    {
      type: 'paragraph',
      text: 'Each layer treats everything it receives from above as an opaque payload and prepends its own **header**. The receiver does the reverse. Press Step to follow one HTTP request.',
    },
    {
      type: 'interactive',
      simulatorId: 'networking/encapsulation',
      caption:
        'Transport, network and link layers each wrap the payload; the receiver unwraps in reverse order.',
    },
    { type: 'heading', level: 2, text: 'What is in the headers' },
    {
      type: 'list',
      items: [
        '**TCP header**: source and destination *ports*, sequence and acknowledgement numbers, flags such as SYN and ACK.',
        '**IP header**: source and destination *IP addresses*, TTL, protocol number (6 = TCP).',
        '**Ethernet header**: source and destination *MAC addresses* and an EtherType; a checksum (FCS) is appended as a trailer.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Which addresses change?',
      text: 'IP addresses stay the same end to end. MAC addresses are rewritten at every router, because a frame only lives on one link. That is why the frame’s destination MAC on your laptop is your router, not the web server.',
    },
    {
      type: 'code',
      language: 'text',
      code: '| Ethernet | IP | TCP | GET /index.html HTTP/1.1 ... | FCS |\n  14 B      20 B 20 B  payload                         4 B',
      caption: 'A frame on the wire: headers nest left to right.',
    },
  ],
});
