import type { SimulatorEngine } from '@core/model';

export interface DnsMessage {
  from: DnsActor;
  to: DnsActor;
  text: string;
}
export type DnsActor = 'Client' | 'Resolver' | 'Root' | 'TLD' | 'Authoritative';
export const DNS_ACTORS: readonly DnsActor[] = [
  'Client',
  'Resolver',
  'Root',
  'TLD',
  'Authoritative',
];

export const DNS_MESSAGES: readonly DnsMessage[] = [
  { from: 'Client', to: 'Resolver', text: 'A? www.example.org' },
  { from: 'Resolver', to: 'Root', text: 'A? www.example.org' },
  { from: 'Root', to: 'Resolver', text: 'Try the .org servers (NS + glue)' },
  { from: 'Resolver', to: 'TLD', text: 'A? www.example.org' },
  { from: 'TLD', to: 'Resolver', text: 'Try ns1.example.org (NS + glue)' },
  { from: 'Resolver', to: 'Authoritative', text: 'A? www.example.org' },
  { from: 'Authoritative', to: 'Resolver', text: 'A 93.184.216.34, TTL 3600' },
  { from: 'Resolver', to: 'Client', text: 'A 93.184.216.34 (cached for 3600 s)' },
];

export interface DnsLookupState {
  /** Number of messages sent so far. */
  sent: number;
}

export const dnsLookupEngine: SimulatorEngine<DnsLookupState> = {
  init: () => ({ sent: 0 }),
  step: (s) => ({ sent: Math.min(s.sent + 1, DNS_MESSAGES.length) }),
  isDone: (s) => s.sent >= DNS_MESSAGES.length,
  describe: (s) => {
    if (s.sent === 0)
      return 'The client needs the address for www.example.org and asks its recursive resolver.';
    const m = DNS_MESSAGES[s.sent - 1];
    if (!m) return '';
    const suffix = s.sent === DNS_MESSAGES.length ? ' Lookup complete.' : '';
    return `${m.from} → ${m.to}: ${m.text}.${suffix}`;
  },
};
