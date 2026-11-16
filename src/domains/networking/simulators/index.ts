import { defineSimulator } from '@core/model';
import { dnsLookupEngine } from './dns-lookup/engine';
import { DnsLookupView } from './dns-lookup/DnsLookupView';
import { encapsulationEngine } from './encapsulation/engine';
import { EncapsulationView } from './encapsulation/EncapsulationView';
import { layerExplorerEngine } from './layer-explorer/engine';
import { LayerExplorerView } from './layer-explorer/LayerExplorerView';
import { subnetPlannerEngine } from './subnet-planner/engine';
import { SubnetPlannerView } from './subnet-planner/SubnetPlannerView';
import { tcpHandshakeEngine } from './tcp-handshake/engine';
import { TcpHandshakeView } from './tcp-handshake/TcpHandshakeView';
import { tlsHandshakeEngine } from './tls-handshake/engine';
import { TlsHandshakeView } from './tls-handshake/TlsHandshakeView';

const domainId = 'networking' as const;

export const layerExplorer = defineSimulator({
  domainId,
  slug: 'layer-explorer',
  title: 'OSI layer explorer',
  description: 'Pick a layer to see its job, unit and protocols.',
  engine: layerExplorerEngine,
  View: LayerExplorerView,
  tickRate: 0.5,
});
export const encapsulation = defineSimulator({
  domainId,
  slug: 'encapsulation',
  title: 'Packet journey',
  description: 'Watch data gain and lose headers on its way across a link.',
  engine: encapsulationEngine,
  View: EncapsulationView,
  tickRate: 1,
});
export const dnsLookup = defineSimulator({
  domainId,
  slug: 'dns-lookup',
  title: 'DNS resolution',
  description: 'Follow a recursive resolver through root, TLD and authoritative servers.',
  engine: dnsLookupEngine,
  View: DnsLookupView,
  tickRate: 1,
});
export const tcpHandshake = defineSimulator({
  domainId,
  slug: 'tcp-handshake',
  title: 'TCP three-way handshake',
  description: 'SYN, SYN-ACK, ACK — step through or send the segments yourself.',
  engine: tcpHandshakeEngine,
  View: TcpHandshakeView,
  tickRate: 1,
});
export const tlsHandshake = defineSimulator({
  domainId,
  slug: 'tls-handshake',
  title: 'TLS 1.3 handshake',
  description: 'From ClientHello to encrypted application data in one round trip.',
  engine: tlsHandshakeEngine,
  View: TlsHandshakeView,
  tickRate: 0.75,
});
export const subnetPlanner = defineSimulator({
  domainId,
  slug: 'subnet-planner',
  title: 'Subnet planner',
  description: 'Choose a prefix length and see the resulting block.',
  engine: subnetPlannerEngine,
  View: SubnetPlannerView,
  controls: 'reset',
});

export const simulators = [
  layerExplorer,
  encapsulation,
  dnsLookup,
  tcpHandshake,
  tlsHandshake,
  subnetPlanner,
];
