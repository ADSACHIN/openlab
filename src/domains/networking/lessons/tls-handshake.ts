import { defineLesson } from '@core/model';

export const tlsHandshakeLesson = defineLesson({
  slug: 'tls-handshake',
  domainId: 'networking',
  title: 'TLS 1.3: securing the connection',
  summary: 'What happens between the TCP handshake and the first encrypted HTTP byte.',
  estimatedMinutes: 9,
  prerequisites: ['networking/tcp-handshake'],
  outcomes: [
    'list the TLS 1.3 handshake messages in order',
    'explain what the certificate and the Finished messages prove',
    'say why TLS 1.3 needs only one round trip',
  ],
  tags: ['tls', 'https', 'encryption', 'certificates'],
  blocks: [
    {
      type: 'paragraph',
      text: 'HTTPS is HTTP inside TLS. Before the request is sent, client and server agree on keys nobody else knows and the server proves its identity. In TLS 1.3 this takes a single round trip.',
    },
    {
      type: 'interactive',
      simulatorId: 'networking/tls-handshake',
      caption:
        'Dashed arrows are plaintext; solid arrows are already encrypted with handshake keys.',
    },
    { type: 'heading', level: 2, text: 'Three things the handshake achieves' },
    {
      type: 'list',
      items: [
        '**Key agreement** — both sides contribute an ephemeral Diffie-Hellman share in the Hello messages; the shared secret never crosses the wire. Compromising the server later does not reveal past sessions (forward secrecy).',
        '**Authentication** — the server sends its certificate and a `CertificateVerify` signature over the transcript, proving it holds the private key for that certificate.',
        '**Integrity** — each side’s `Finished` message is a MAC over everything said so far, so a tampered handshake is detected.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Why 1-RTT?',
      text: 'TLS 1.2 negotiated the cipher first and exchanged keys afterwards (two round trips). TLS 1.3 sends the key share optimistically in ClientHello, so the server can encrypt from its very first flight.',
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'Everything after ServerHello is encrypted, including the certificate. Observers see which server you connected to (the IP, and usually the SNI name) but not what you asked for.',
    },
  ],
});
