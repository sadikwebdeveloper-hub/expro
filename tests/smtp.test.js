/**
 * SMTP integration test.
 *
 * Boots a real SMTP server (smtp-server) on loopback and drives the production
 * mailService against it, so the code under test is the same code the server runs:
 *   mailService.sendWithConfig -> withAddressFailover -> nodemailer.sendMail
 *
 * Outbound SMTP to Gmail is not reachable from every CI/sandbox network, so the
 * server is local; DNS resolution is exercised by pointing the host at names that
 * resolve through both a real A record and /etc/hosts.
 */
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Point the app at a throwaway data file so the test never touches data.json.
const TMP_DATA = path.join(os.tmpdir(), `expro-smtp-test-${process.pid}.json`);
fs.writeFileSync(TMP_DATA, JSON.stringify({
  settings: {
    contact: { notificationEmails: ['admin@exprogroup.test'] },
    smtp: {},
  },
}));

// Must be set before server/database/index.js is imported.
process.env.EXPRO_DATA_FILE = TMP_DATA;
process.env.NODE_ENV = 'development';

const AUTH_USER = 'expro@exprogroup.test';
const AUTH_PASS = 'super-secret-app-password';

const received = [];
let requireAuth = true;

const server = new SMTPServer({
  authOptional: false,
  requireAuth,
  // Plaintext on loopback: exercises the real SMTP state machine (EHLO, AUTH
  // LOGIN, MAIL FROM, RCPT TO, DATA) without needing a trusted certificate.
  disabledCommands: ['STARTTLS'],
  onAuth(auth, session, callback) {
    if (auth.username === AUTH_USER && auth.password === AUTH_PASS) return callback(null, { user: auth.username });
    const err = new Error('Invalid credentials');
    err.responseCode = 535;
    return callback(err);
  },
  async onData(stream, session, callback) {
    const raw = await new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
    const parsed = await simpleParser(raw);
    received.push({
      from: parsed.from?.text,
      to: parsed.to?.text,
      subject: parsed.subject,
      text: parsed.text,
      html: parsed.html,
      replyTo: parsed.replyTo?.text,
    });
    callback();
  },
});

const listen = () =>
  new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.server.address().port));
  });

let passed = 0;
const check = async (name, fn) => {
  try {
    await fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.log(`  FAIL ${name}\n       ${err.message}`);
    process.exitCode = 1;
  }
};

const run = async () => {
  const port = await listen();
  console.log(`test SMTP server listening on 127.0.0.1:${port}\n`);

  // Import AFTER the temp data file exists.
  const { default: db } = await import('../server/database/index.js');
  const { default: settingsService } = await import('../server/services/settingsService.js');
  const { default: mailService } = await import('../server/services/mailService.js');
  const { default: dnsResolver } = await import('../server/services/dnsResolver.js');

  // ---- DNS resolver: IPv4-only, IP literals, hostname fallbacks ----
  console.log('dnsResolver');

  const literal = await dnsResolver.resolveHostAddresses('10.20.30.40');
  await check('passes an IP literal straight through', () => {
    assert.deepEqual(literal.addresses, ['10.20.30.40']);
    assert.equal(literal.servername, '10.20.30.40');
  });

  const v4 = await dnsResolver.resolveHostAddresses('smtp.gmail.com', { allowIpv6: false });
  await check('returns only IPv4 addresses for a dual-stack host', () => {
    assert.ok(v4.addresses.length > 0, 'expected at least one address');
    for (const a of v4.addresses) assert.ok(!a.includes(':'), `expected IPv4, got ${a}`);
  });

  const cached = await dnsResolver.resolveHostAddresses('smtp.gmail.com', { allowIpv6: false });
  await check('caches resolution results', () => assert.deepEqual(cached.addresses, v4.addresses));

  const pick = await dnsResolver.pickReachableAddress(['127.0.0.1'], port);
  await check('pickReachableAddress returns the reachable address', () => assert.equal(pick, '127.0.0.1'));

  const unreachableFirst = await dnsResolver.pickReachableAddress(['127.0.0.1:1', '127.0.0.1'], port);
  await check('pickReachableAddress skips an unreachable candidate', () =>
    assert.equal(unreachableFirst, '127.0.0.1'));

  // ---- mailService against the local server ----
  console.log('\nmailService.sendWithConfig');

  const smtpOverride = {
    host: '127.0.0.1',
    port,
    username: AUTH_USER,
    password: AUTH_PASS,
    encryption: 'None',
    fromEmail: 'expro@exprogroup.test',
    fromName: 'Expro Group',
    replyTo: 'reply@exprogroup.test',
    enabled: true,
  };

  const sent = await mailService.sendWithConfig({
    to: 'someone@example.com',
    subject: 'Integration check',
    text: 'Hello from the test',
    html: '<p>Hello from the test</p>',
    smtpOverride,
  });

  await check('reports the message as delivered', () => {
    assert.equal(sent.delivered, true);
    assert.equal(sent.devMode, false);
    assert.ok(sent.messageId, 'expected a messageId');
  });

  await check('the server received the message', () => {
    assert.equal(received.length, 1);
    assert.equal(received[0].subject, 'Integration check');
    assert.equal(received[0].to, 'someone@example.com');
  });

  await check('sets From, Reply-To and body correctly', () => {
    assert.match(received[0].from, /Expro Group/);
    assert.match(received[0].from, /expro@exprogroup\.test/);
    assert.match(received[0].replyTo, /reply@exprogroup\.test/);
    assert.match(received[0].text, /Hello from the test/);
    assert.match(received[0].html, /<p>Hello from the test<\/p>/);
  });

  // ---- Authentication failures must surface, not hang ----
  console.log('\nmailService failure paths');

  const authError = await mailService
    .sendWithConfig({ to: 'x@example.com', subject: 'bad auth', text: 'x', smtpOverride: { ...smtpOverride, password: 'wrong' } })
    .then(() => null)
    .catch((e) => e);
  await check('rejects when credentials are wrong', () => {
    assert.ok(authError, 'expected an error');
    assert.match(authError.message, /auth|credential|535/i);
  });

  const noConfig = await mailService
    .sendWithConfig({ to: 'x@example.com', subject: 'no config', text: 'x', smtpOverride: { host: '', username: '', password: '' } })
    .then((r) => ({ ok: true, r }))
    .catch((e) => ({ ok: false, e }));
  await check('handles missing configuration without throwing in dev', () => {
    assert.equal(noConfig.ok, true);
    assert.equal(noConfig.r.delivered, false);
  });

  // ---- testConnection ----
  const conn = await mailService.testConnection('probe@example.com', smtpOverride);
  await check('testConnection succeeds and sends a probe email', () => {
    assert.equal(conn.success, true);
    assert.match(conn.message, /SMTP Connected/);
  });
  await check('the probe email arrived', () => {
    const probe = received.find((m) => m.to === 'probe@example.com');
    assert.ok(probe, 'expected probe email');
  });

  const badConn = await mailService.testConnection(null, { ...smtpOverride, port: 1 });
  await check('testConnection reports failure on an unreachable host', () => {
    assert.equal(badConn.success, false);
    assert.match(badConn.message, /failed/i);
  });

  // ---- Contact form notification, driven through stored settings ----
  console.log('\ncontact form notification');

  await settingsService.updateSettings({
    contact: { notificationEmails: ['admin@exprogroup.test', 'ops@exprogroup.test'] },
    smtp: {
      host: '127.0.0.1',
      port,
      username: AUTH_USER,
      encryption: 'None',
      fromEmail: 'expro@exprogroup.test',
      fromName: 'Expro Group',
      replyTo: 'reply@exprogroup.test',
      enabled: true,
      enableContactForm: true,
    },
  }, { smtpPassword: AUTH_PASS });

  const effective = await settingsService.getEffectiveSmtpConfig();
  await check('stored SMTP password round-trips through encryption', () => {
    assert.equal(effective.password, AUTH_PASS);
    assert.equal(effective.host, '127.0.0.1');
  });

  const notif = await mailService.sendContactFormNotification({
    name: 'Ayesha Rahman',
    email: 'ayesha@example.com',
    subject: 'Partnership',
    message: 'We would like to discuss a partnership.',
    date: new Date().toLocaleString(),
  });

  await check('notifies every configured admin address', () => {
    assert.equal(notif.attempted, 2);
    assert.equal(notif.delivered, 2);
    assert.equal(notif.failed, 0);
    assert.equal(notif.skipped, false);
  });

  await check('admin notification contains the submission', () => {
    const admin = received.find((m) => m.to === 'admin@exprogroup.test');
    assert.ok(admin, 'expected admin notification');
    assert.match(admin.subject, /Contact Form: Partnership/);
    assert.match(admin.text, /Ayesha Rahman/);
    assert.match(admin.html, /partnership/i);
  });

  const confirmRes = await mailService.sendContactConfirmation({
    name: 'Ayesha Rahman',
    email: 'ayesha@example.com',
    subject: 'Partnership',
  });
  await check('sends the visitor a confirmation email', () => {
    assert.equal(confirmRes.delivered, true);
    const c = received.find((m) => m.to === 'ayesha@example.com');
    assert.ok(c, 'expected confirmation email');
    assert.match(c.subject, /We received your message/);
  });

  // ---- isConfigured reflects stored state ----
  await check('isConfigured() reflects the stored settings', async () => {
    assert.equal(await mailService.isConfigured(), true);
  });

  // ---- Cleanup ----
  await new Promise((r) => server.close(r));
  try { fs.unlinkSync(TMP_DATA); } catch { /* ignore */ }

  console.log(`\n${passed} checks passed${process.exitCode ? ' — FAILURES PRESENT' : ''}, ${received.length} messages delivered`);
};

run().catch((err) => {
  console.error('Test crashed:', err);
  process.exit(1);
});
