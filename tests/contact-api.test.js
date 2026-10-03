/**
 * End-to-end contact form test.
 *
 * Boots the real Express app (server/app.js) plus a real SMTP server on loopback
 * and drives the public HTTP endpoint a visitor's browser would call:
 *
 *   POST /api/messages -> contentController.createMessage
 *                      -> mailService.sendContactFormNotification
 *                      -> nodemailer -> SMTP server
 *
 * This is what proves the "SMTP system" claim end to end, including that the API
 * tells the truth about delivery.
 */
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const AUTH_USER = 'expro@exprogroup.test';
const AUTH_PASS = 'super-secret-app-password';

const TMP_DATA = path.join(os.tmpdir(), `expro-api-test-${process.pid}.json`);
fs.writeFileSync(TMP_DATA, JSON.stringify({
  config: {},
  messages: [],
  settings: {
    contact: { notificationEmails: ['admin@exprogroup.test', 'ops@exprogroup.test'] },
    smtp: {},
  },
}));

// Must be set before any server module is imported.
process.env.EXPRO_DATA_FILE = TMP_DATA;
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'test-secret';

const received = [];

const smtp = new SMTPServer({
  disabledCommands: ['STARTTLS'],
  onAuth(auth, session, callback) {
    if (auth.username === AUTH_USER && auth.password === AUTH_PASS) return callback(null, { user: auth.username });
    const err = new Error('Invalid credentials');
    err.responseCode = 535;
    callback(err);
  },
  async onData(stream, session, callback) {
    const raw = await new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
    const parsed = await simpleParser(raw);
    received.push({ to: parsed.to?.text, subject: parsed.subject, text: parsed.text });
    callback();
  },
});

// SMTPServer wraps its net server as `.server`; http.Server is one directly.
const listen = (server, host = '127.0.0.1') =>
  new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, () => {
      const target = typeof server.address === 'function' ? server : server.server;
      resolve(target.address().port);
    });
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
  const smtpPort = await listen(smtp);
  console.log(`test SMTP server on 127.0.0.1:${smtpPort}`);

  const { default: settingsService } = await import('../server/services/settingsService.js');
  const { default: app } = await import('../server/app.js');

  // Point the stored SMTP settings at the local server.
  await settingsService.updateSettings({
    contact: { notificationEmails: ['admin@exprogroup.test', 'ops@exprogroup.test'] },
    smtp: {
      host: '127.0.0.1',
      port: smtpPort,
      username: AUTH_USER,
      encryption: 'None',
      fromEmail: 'expro@exprogroup.test',
      fromName: 'Expro Group',
      replyTo: 'reply@exprogroup.test',
      enabled: true,
      enableContactForm: true,
    },
  }, { smtpPassword: AUTH_PASS });

  const httpServer = app.listen(0, '127.0.0.1');
  const apiPort = await new Promise((resolve) => httpServer.once('listening', () => resolve(httpServer.address().port)));
  const base = `http://127.0.0.1:${apiPort}`;
  console.log(`test API server on ${base}\n`);

  const post = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  };

  console.log('POST /api/messages');

  const submission = {
    name: 'Nadia Karim',
    email: 'nadia@example.com',
    subject: 'Distribution partnership',
    message: 'We would like to distribute your agro products in the north.',
  };

  const result = await post(`${base}/api/messages`, submission);

  await check('responds 200', () => assert.equal(result.status, 200));

  await check('reports the notification as delivered', () => {
    assert.equal(result.json.success, true);
    assert.equal(result.json.data.emailNotification.delivered, true);
    assert.equal(result.json.data.emailNotification.failed, 0);
  });

  await check('returns the stored message id', () => {
    assert.equal(typeof result.json.data.id, 'number');
  });

  await check('emails every configured admin address', () => {
    const adminMails = received.filter((m) => /exprogroup\.test/.test(m.to || ''));
    assert.equal(adminMails.length, 2, `expected 2 admin mails, got ${adminMails.length}`);
  });

  await check('admin email carries the submission content', () => {
    const admin = received.find((m) => (m.to || '').includes('admin@exprogroup.test'));
    assert.ok(admin, 'expected admin@ notification');
    assert.match(admin.subject, /Contact Form: Distribution partnership/);
    assert.match(admin.text, /Nadia Karim/);
    assert.match(admin.text, /distribute your agro products/);
  });

  await check('emails the visitor a confirmation', () => {
    const confirmation = received.find((m) => (m.to || '').includes('nadia@example.com'));
    assert.ok(confirmation, 'expected confirmation email');
    assert.match(confirmation.subject, /We received your message/);
  });

  await check('the message is persisted to the store', async () => {
    const res = await fetch(`${base}/api/messages`, { headers: { Accept: 'application/json' } });
    // /messages is admin-only; a 401 still proves the route exists.
    assert.ok([200, 401].includes(res.status), `unexpected status ${res.status}`);
    const raw = JSON.parse(fs.readFileSync(TMP_DATA, 'utf8'));
    const stored = (raw.messages || []).find((m) => m.email === 'nadia@example.com');
    assert.ok(stored, 'expected the submission to be stored');
    assert.equal(stored.subject, 'Distribution partnership');
  });

  console.log('\nvalidation');

  await check('rejects an invalid submission', async () => {
    const res = await post(`${base}/api/messages`, { name: '', email: 'not-an-email', subject: '', message: '' });
    // server/middleware/validate.js answers validation failures with 422.
    assert.equal(res.status, 422, `expected 422, got ${res.status}`);
    assert.equal(res.json.success, false);
  });

  await check('does not store a rejected submission', async () => {
    const raw = JSON.parse(fs.readFileSync(TMP_DATA, 'utf8'));
    const bad = (raw.messages || []).find((m) => m.email === 'not-an-email');
    assert.equal(bad, undefined, 'an invalid submission should not be persisted');
  });

  console.log('\nSMTP disabled path');

  await settingsService.updateSettings({ smtp: { enabled: false } });
  const disabled = await post(`${base}/api/messages`, { ...submission, subject: 'While SMTP is off' });
  await check('still stores the message and reports the skip honestly', () => {
    assert.equal(disabled.status, 200);
    assert.equal(disabled.json.data.emailNotification.delivered, false);
    assert.equal(disabled.json.data.emailNotification.skipped, true);
  });

  await new Promise((r) => httpServer.close(r));
  await new Promise((r) => smtp.close(r));
  try { fs.unlinkSync(TMP_DATA); } catch { /* ignore */ }

  console.log(`\n${passed} checks passed${process.exitCode ? ' — FAILURES PRESENT' : ''}, ${received.length} emails delivered`);
};

run().catch((err) => {
  console.error('Test crashed:', err);
  process.exit(1);
});
