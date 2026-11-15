import type { SimulatorViewProps } from '@core/model';
import { SequenceDiagram } from '../../components/SequenceDiagram';
import { DNS_ACTORS, DNS_MESSAGES, dnsLookupEngine } from './engine';
import type { DnsLookupState } from './engine';

export function DnsLookupView({ state, reducedMotion }: SimulatorViewProps<DnsLookupState>) {
  return (
    <SequenceDiagram
      actors={DNS_ACTORS}
      messages={DNS_MESSAGES}
      visible={state.sent}
      title="DNS resolution"
      description={dnsLookupEngine.describe(state)}
      reducedMotion={reducedMotion}
    />
  );
}
