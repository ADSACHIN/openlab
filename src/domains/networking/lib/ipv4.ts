/** IPv4 arithmetic on unsigned 32-bit integers. Pure; no I/O. */

export function parseIpv4(text: string): number | null {
  const parts = text.trim().split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

export function formatIpv4(n: number): string {
  return [24, 16, 8, 0].map((s) => String((n >>> s) & 255)).join('.');
}

export function isValidPrefix(prefix: number): boolean {
  return Number.isInteger(prefix) && prefix >= 0 && prefix <= 32;
}

export function maskFromPrefix(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

export function networkAddress(ip: number, prefix: number): number {
  return (ip & maskFromPrefix(prefix)) >>> 0;
}

export function broadcastAddress(ip: number, prefix: number): number {
  return (networkAddress(ip, prefix) | (~maskFromPrefix(prefix) >>> 0)) >>> 0;
}

/** Usable host addresses in a block (network and broadcast excluded; /31 and /32 per RFC 3021 / host route). */
export function usableHosts(prefix: number): number {
  if (prefix >= 32) return 1;
  if (prefix === 31) return 2;
  return 2 ** (32 - prefix) - 2;
}

/** Smallest block (largest prefix) that still fits `hosts` usable addresses. */
export function smallestPrefixFor(hosts: number): number {
  for (let p = 32; p >= 0; p--) if (usableHosts(p) >= hosts) return p;
  return 0;
}

export function toBinary(n: number): string {
  return [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, '0')).join('.');
}
