import dns from 'dns';
import net from 'net';
import logger from './logger.js';

// Prefer IPv4 globally. Several hosting providers expose an IPv6 interface with no
// working IPv6 route, which makes AAAA connections fail with ENETUNREACH.
dns.setDefaultResultOrder('ipv4first');

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const now = () => Date.now();

/**
 * Resolve a hostname to a list of candidate IP addresses.
 *
 * Why this exists: nodemailer >= 9 resolves the host itself and picks a RANDOM
 * entry out of the combined A + AAAA list (see formatDNSValue in
 * nodemailer/lib/shared/index.js). Its transport-level `family` option is never
 * read by lib/smtp-connection, so setting `family: 4` does nothing. On hosts with
 * a broken IPv6 route roughly half of all connects fail with ENETUNREACH.
 *
 * resolveHostname() short-circuits when `net.isIP(options.host)` is truthy, so
 * handing it a resolved IPv4 literal bypasses that random pick entirely.
 *
 * @param {string} hostname
 * @param {{ prefer?: 'ipv4first'|'ipv6first', allowIpv6?: boolean }} [options]
 * @returns {Promise<{ addresses: string[]; servername: string }>}
 */
export async function resolveHostAddresses(hostname, options = {}) {
  const allowIpv6 = options.allowIpv6 ?? false;
  const cacheKey = `${hostname}|${allowIpv6 ? 'v46' : 'v4'}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now()) {
    return { addresses: cached.addresses, servername: hostname };
  }

  // Already a literal IP address — nothing to resolve.
  if (net.isIP(hostname)) {
    return { addresses: [hostname], servername: hostname };
  }

  const results = { v4: [], v6: [] };

  const lookups = [dns.promises.resolve4(hostname).then((a) => { results.v4 = a || []; }, () => {})];
  if (allowIpv6) {
    lookups.push(dns.promises.resolve6(hostname).then((a) => { results.v6 = a || []; }, () => {}));
  }
  await Promise.all(lookups);

  let addresses = allowIpv6 ? [...results.v4, ...results.v6] : results.v4;

  // Fallback to the OS resolver (honours /etc/hosts, useful in some PaaS networks).
  if (!addresses.length) {
    try {
      const found = await dns.promises.lookup(hostname, {
        all: true,
        verbatim: false,
        family: allowIpv6 ? undefined : 4,
      });
      addresses = found
        .filter((entry) => (allowIpv6 ? true : entry.family === 4))
        .map((entry) => entry.address);
    } catch (err) {
      logger.smtp('DNS lookup fallback failed', { host: hostname, error: err.message });
    }
  }

  // Last resort: hand the raw hostname to nodemailer rather than hard-failing.
  if (!addresses.length) addresses = [hostname];

  if (results.v4.length) {
    cache.set(cacheKey, { addresses, expires: now() + CACHE_TTL_MS });
  }

  return { addresses, servername: hostname };
}

/**
 * Open a raw TCP connection to each candidate in order and return the first one
 * that accepts. This gives real failover between mail-server IPs instead of
 * leaving it to a random pick.
 *
 * @param {string[]} addresses
 * @param {number} port
 * @param {number} [timeoutMs]
 * @returns {Promise<string>} the address that answered
 */
export async function pickReachableAddress(addresses, port, timeoutMs = 8000) {
  const literalIps = addresses.filter((address) => net.isIP(address));

  // No literal IPs (DNS gave us nothing) — let the caller use the hostname.
  if (!literalIps.length) return addresses[0];
  if (literalIps.length === 1) return literalIps[0];

  const attempt = (address) =>
    new Promise((resolve) => {
      const socket = new net.Socket();
      const done = (ok) => {
        socket.removeAllListeners();
        socket.destroy();
        resolve(ok ? address : null);
      };
      socket.setTimeout(timeoutMs);
      socket.once('connect', () => done(true));
      socket.once('timeout', () => done(false));
      socket.once('error', () => done(false));
      socket.connect(port, address);
    });

  for (const address of literalIps) {
    const reachable = await attempt(address);
    if (reachable) return reachable;
  }

  return literalIps[0];
}

export const clearDnsCache = () => cache.clear();

export default { resolveHostAddresses, pickReachableAddress, clearDnsCache };
