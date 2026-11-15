import type { SimulatorEngine } from '@core/model';

export type TcpAction = 'send-syn' | 'send-syn-ack' | 'send-ack' | 'send-data';
export const TCP_ORDER: readonly TcpAction[] = ['send-syn', 'send-syn-ack', 'send-ack'];

export interface TcpMessage {
  from: 'Client' | 'Server';
  to: 'Client' | 'Server';
  text: string;
}

export interface TcpHandshakeState {
  /** 0..3 correct steps completed. */
  step: number;
  clientState: string;
  serverState: string;
  log: readonly TcpMessage[];
  /** Out-of-order actions attempted (labs grade on this). */
  mistakes: number;
  clientIsn: number;
  serverIsn: number;
}

const CLIENT_STATES = ['CLOSED', 'SYN-SENT', 'SYN-SENT', 'ESTABLISHED'] as const;
const SERVER_STATES = ['LISTEN', 'SYN-RECEIVED', 'SYN-RECEIVED', 'ESTABLISHED'] as const;

function isn(seed: number, salt: number): number {
  // Deterministic pseudo-random initial sequence number from the seed.
  let x = (seed * 2654435761 + salt * 40503) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0x5bd1e995) >>> 0;
  return x % 100000;
}

function messageFor(action: TcpAction, s: TcpHandshakeState): TcpMessage {
  switch (action) {
    case 'send-syn':
      return { from: 'Client', to: 'Server', text: `SYN seq=${String(s.clientIsn)}` };
    case 'send-syn-ack':
      return {
        from: 'Server',
        to: 'Client',
        text: `SYN-ACK seq=${String(s.serverIsn)} ack=${String(s.clientIsn + 1)}`,
      };
    case 'send-ack':
      return {
        from: 'Client',
        to: 'Server',
        text: `ACK seq=${String(s.clientIsn + 1)} ack=${String(s.serverIsn + 1)}`,
      };
    case 'send-data':
      return { from: 'Client', to: 'Server', text: 'PSH-ACK "GET / HTTP/1.1"' };
  }
}

export function applyTcp(s: TcpHandshakeState, action: TcpAction): TcpHandshakeState {
  if (action === 'send-data') {
    if (s.step < 3) return { ...s, mistakes: s.mistakes + 1 };
    return { ...s, log: [...s.log, messageFor(action, s)] };
  }
  const expected = TCP_ORDER[s.step];
  if (action !== expected) return { ...s, mistakes: s.mistakes + 1 };
  const step = s.step + 1;
  return {
    ...s,
    step,
    clientState: CLIENT_STATES[step] ?? s.clientState,
    serverState: SERVER_STATES[step] ?? s.serverState,
    log: [...s.log, messageFor(action, s)],
  };
}

export const tcpHandshakeEngine: SimulatorEngine<TcpHandshakeState, TcpAction> = {
  init: (seed) => ({
    step: 0,
    clientState: 'CLOSED',
    serverState: 'LISTEN',
    log: [],
    mistakes: 0,
    clientIsn: isn(seed, 1),
    serverIsn: isn(seed, 2),
  }),
  step: (s) => {
    const next = TCP_ORDER[s.step];
    return next ? applyTcp(s, next) : s;
  },
  apply: applyTcp,
  isDone: (s) => s.step >= 3,
  describe: (s) => {
    const last = s.log[s.log.length - 1];
    const states = `Client ${s.clientState}, server ${s.serverState}.`;
    if (!last) return `No segments yet. ${states}`;
    return `${last.from} sent ${last.text}. ${states}${s.step >= 3 ? ' Connection established.' : ''}`;
  },
};
