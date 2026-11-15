import type { SimulatorEngine } from '@core/model';

export interface TlsMessage {
  from: 'Client' | 'Server';
  to: 'Client' | 'Server';
  text: string;
  encrypted: boolean;
  note: string;
}

/** TLS 1.3 one-round-trip handshake. */
export const TLS_MESSAGES: readonly TlsMessage[] = [
  {
    from: 'Client',
    to: 'Server',
    text: 'ClientHello',
    encrypted: false,
    note: 'Supported versions and cipher suites, a random, and an ephemeral key share (X25519).',
  },
  {
    from: 'Server',
    to: 'Client',
    text: 'ServerHello',
    encrypted: false,
    note: 'Chosen suite, server random and key share. Both sides can now derive the handshake keys.',
  },
  {
    from: 'Server',
    to: 'Client',
    text: '{EncryptedExtensions}',
    encrypted: true,
    note: 'From here on the handshake itself is encrypted.',
  },
  {
    from: 'Server',
    to: 'Client',
    text: '{Certificate}',
    encrypted: true,
    note: 'The server proves who it is with a certificate chain.',
  },
  {
    from: 'Server',
    to: 'Client',
    text: '{CertificateVerify}',
    encrypted: true,
    note: 'A signature over the transcript using the certificate’s private key.',
  },
  {
    from: 'Server',
    to: 'Client',
    text: '{Finished}',
    encrypted: true,
    note: 'A MAC over the whole handshake so nothing was tampered with.',
  },
  {
    from: 'Client',
    to: 'Server',
    text: '{Finished}',
    encrypted: true,
    note: 'Client confirms the same transcript. Application keys are derived.',
  },
  {
    from: 'Client',
    to: 'Server',
    text: '[Application Data]',
    encrypted: true,
    note: 'The HTTP request, protected by the application traffic keys.',
  },
];

export interface TlsHandshakeState {
  sent: number;
}

export const tlsHandshakeEngine: SimulatorEngine<TlsHandshakeState> = {
  init: () => ({ sent: 0 }),
  step: (s) => ({ sent: Math.min(s.sent + 1, TLS_MESSAGES.length) }),
  isDone: (s) => s.sent >= TLS_MESSAGES.length,
  describe: (s) => {
    if (s.sent === 0) return 'TCP is connected. The client starts the TLS 1.3 handshake.';
    const m = TLS_MESSAGES[s.sent - 1];
    return m ? `${m.from} → ${m.to}: ${m.text}${m.encrypted ? ' (encrypted)' : ''}. ${m.note}` : '';
  },
};
