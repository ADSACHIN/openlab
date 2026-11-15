import type { SimulatorViewProps } from '@core/model';
import { SequenceDiagram } from '../../components/SequenceDiagram';
import { TLS_MESSAGES, tlsHandshakeEngine } from './engine';
import type { TlsHandshakeState } from './engine';

export function TlsHandshakeView({ state, reducedMotion }: SimulatorViewProps<TlsHandshakeState>) {
  const current = state.sent > 0 ? TLS_MESSAGES[state.sent - 1] : undefined;
  return (
    <div>
      <SequenceDiagram
        actors={['Client', 'Server']}
        messages={TLS_MESSAGES.map((m) => ({
          from: m.from,
          to: m.to,
          text: m.text,
          muted: !m.encrypted,
        }))}
        visible={state.sent}
        title="TLS 1.3 handshake"
        description={tlsHandshakeEngine.describe(state)}
        reducedMotion={reducedMotion}
      />
      <p style={{ marginTop: 'var(--space-2)' }}>
        {current
          ? current.note
          : 'Dashed arrows are plaintext; solid arrows are encrypted. Press Step.'}
      </p>
    </div>
  );
}
