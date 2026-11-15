import { defineLab } from '@core/model';
import type { TcpHandshakeState } from '../simulators/tcp-handshake/engine';

export const handshakeLab = defineLab({
  slug: 'complete-the-handshake',
  domainId: 'networking',
  title: 'Complete the handshake by hand',
  summary: 'Send SYN, SYN-ACK and ACK yourself, in the right order, then some data.',
  estimatedMinutes: 3,
  prerequisites: ['networking/tcp-handshake'],
  simulatorId: 'networking/tcp-handshake',
  goal: 'Establish the connection with no out-of-order segments, then send one data segment.',
  instructions: [
    {
      type: 'paragraph',
      text: 'Do not press Play or Step — use the **send** buttons. Watch both state columns change. A wrong segment is simply ignored by the peer, but it counts against you.',
    },
  ],
  check: (state) => {
    const s = state as TcpHandshakeState;
    if (s.step < 3)
      return {
        passed: false,
        message: `The connection is not established yet (client ${s.clientState}, server ${s.serverState}).`,
        score: s.step * 20,
      };
    const sentData = s.log.some((m) => m.text.startsWith('PSH'));
    if (!sentData)
      return { passed: false, message: 'Established — now send a data segment.', score: 70 };
    if (s.mistakes > 0)
      return {
        passed: true,
        message: `Done, with ${String(s.mistakes)} out-of-order attempt${s.mistakes === 1 ? '' : 's'} along the way.`,
        score: Math.max(60, 100 - s.mistakes * 15),
      };
    return { passed: true, message: 'Perfect: SYN, SYN-ACK, ACK, then data.', score: 100 };
  },
});
