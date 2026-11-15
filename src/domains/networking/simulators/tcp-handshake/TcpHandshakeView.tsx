import type { SimulatorViewProps } from '@core/model';
import { SequenceDiagram } from '../../components/SequenceDiagram';
import { tcpHandshakeEngine } from './engine';
import type { TcpAction, TcpHandshakeState } from './engine';
import styles from './TcpHandshakeView.module.css';

const BUTTONS: readonly { action: TcpAction; label: string; who: 'Client' | 'Server' }[] = [
  { action: 'send-syn', label: 'Client: send SYN', who: 'Client' },
  { action: 'send-syn-ack', label: 'Server: send SYN-ACK', who: 'Server' },
  { action: 'send-ack', label: 'Client: send ACK', who: 'Client' },
  { action: 'send-data', label: 'Client: send data', who: 'Client' },
];

export function TcpHandshakeView({
  state,
  dispatch,
  reducedMotion,
}: SimulatorViewProps<TcpHandshakeState, TcpAction>) {
  return (
    <div className={styles.wrap}>
      <SequenceDiagram
        actors={['Client', 'Server']}
        messages={state.log}
        visible={state.log.length}
        title="TCP three-way handshake"
        description={tcpHandshakeEngine.describe(state)}
        reducedMotion={reducedMotion}
      />
      <dl className={styles.states}>
        <div>
          <dt>Client state</dt>
          <dd>{state.clientState}</dd>
        </div>
        <div>
          <dt>Server state</dt>
          <dd>{state.serverState}</dd>
        </div>
        <div>
          <dt>Out-of-order attempts</dt>
          <dd>{state.mistakes}</dd>
        </div>
      </dl>
      <div className={styles.actions} role="group" aria-label="Send a segment">
        {BUTTONS.map((b) => (
          <button
            key={b.action}
            type="button"
            className={styles.action}
            onClick={() => dispatch(b.action)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
