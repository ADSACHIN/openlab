import { describe, expect, it } from 'vitest';
import {
  broadcastAddress,
  formatIpv4,
  maskFromPrefix,
  networkAddress,
  parseIpv4,
  smallestPrefixFor,
  toBinary,
  usableHosts,
} from './ipv4';

describe('ipv4', () => {
  it('parses and formats', () => {
    expect(formatIpv4(parseIpv4('192.168.10.77') ?? -1)).toBe('192.168.10.77');
    expect(parseIpv4('256.1.1.1')).toBeNull();
    expect(parseIpv4('1.2.3')).toBeNull();
    expect(parseIpv4('a.b.c.d')).toBeNull();
    expect(formatIpv4(0xffffffff)).toBe('255.255.255.255');
  });

  it('computes masks, network and broadcast', () => {
    expect(formatIpv4(maskFromPrefix(24))).toBe('255.255.255.0');
    expect(formatIpv4(maskFromPrefix(0))).toBe('0.0.0.0');
    expect(formatIpv4(maskFromPrefix(32))).toBe('255.255.255.255');
    const ip = parseIpv4('10.1.37.200') ?? 0;
    expect(formatIpv4(networkAddress(ip, 20))).toBe('10.1.32.0');
    expect(formatIpv4(broadcastAddress(ip, 20))).toBe('10.1.47.255');
  });

  it('counts usable hosts and picks the tightest prefix', () => {
    expect(usableHosts(24)).toBe(254);
    expect(usableHosts(30)).toBe(2);
    expect(usableHosts(31)).toBe(2);
    expect(usableHosts(32)).toBe(1);
    expect(smallestPrefixFor(50)).toBe(26);
    expect(smallestPrefixFor(254)).toBe(24);
    expect(smallestPrefixFor(255)).toBe(23);
  });

  it('renders binary', () => {
    expect(toBinary(parseIpv4('192.168.1.1') ?? 0)).toBe('11000000.10101000.00000001.00000001');
  });
});
