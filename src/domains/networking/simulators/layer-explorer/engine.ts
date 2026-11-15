import type { SimulatorEngine } from '@core/model';

export interface Layer {
  number: number;
  name: string;
  unit: string;
  job: string;
  examples: string;
}

export const LAYERS: readonly Layer[] = [
  {
    number: 7,
    name: 'Application',
    unit: 'Data',
    job: 'The protocol your program speaks.',
    examples: 'HTTP, DNS, SMTP, SSH',
  },
  {
    number: 6,
    name: 'Presentation',
    unit: 'Data',
    job: 'Encoding, compression, encryption of the payload.',
    examples: 'TLS, JSON/UTF-8, JPEG',
  },
  {
    number: 5,
    name: 'Session',
    unit: 'Data',
    job: 'Opening, keeping and closing a dialogue.',
    examples: 'RPC sessions, NetBIOS',
  },
  {
    number: 4,
    name: 'Transport',
    unit: 'Segment',
    job: 'Process-to-process delivery; ports; reliability.',
    examples: 'TCP, UDP, QUIC',
  },
  {
    number: 3,
    name: 'Network',
    unit: 'Packet',
    job: 'Host-to-host delivery across networks; logical addressing; routing.',
    examples: 'IPv4, IPv6, ICMP',
  },
  {
    number: 2,
    name: 'Data Link',
    unit: 'Frame',
    job: 'Delivery on one link; hardware addresses; error detection.',
    examples: 'Ethernet, Wi-Fi, ARP',
  },
  {
    number: 1,
    name: 'Physical',
    unit: 'Bits',
    job: 'Signals on a medium: voltage, light, radio.',
    examples: 'Cat6, fibre, 802.11 radio',
  },
];

export interface LayerExplorerState {
  /** Index into LAYERS (0 = Application). */
  selected: number;
}
export interface LayerExplorerAction {
  type: 'select';
  index: number;
}

export const layerExplorerEngine: SimulatorEngine<LayerExplorerState, LayerExplorerAction> = {
  init: () => ({ selected: 0 }),
  step: (s) => ({ selected: (s.selected + 1) % LAYERS.length }),
  apply: (s, a) => (a.index >= 0 && a.index < LAYERS.length ? { selected: a.index } : s),
  describe: (s) => {
    const l = LAYERS[s.selected];
    return l ? `Layer ${String(l.number)}, ${l.name}: ${l.job} Unit: ${l.unit}.` : '';
  },
};
