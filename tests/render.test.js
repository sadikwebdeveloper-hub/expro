/**
 * Renders the real app in jsdom and asserts each public route produces content.
 *
 * Requires the Express server to be running on PORT (default 5000) so the pages
 * can fetch their data, exactly as they do in the browser.
 */
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 5000;
const BASE = `http://127.0.0.1:${PORT}`;
const BUNDLE = path.join(ROOT, 'tests', '.render-bundle.cjs');

const ROUTES = [
  { hash: '#/', mustContain: ['Legacy of Excellence', 'impact areas'] },
  { hash: '#/companies', mustContain: ['Companies & subsidiaries'] },
  { hash: '#/products', mustContain: ['Products & services'] },
  {
    hash: '#/products',
    maintenance: true,
    minChars: 120,
    mustContain: ['A little work behind the scenes.', 'Temporary maintenance for testing', 'Administrator sign in'],
    mustNotContain: ['Products & services'],
  },
  { hash: '#/media', mustContain: ['Media & gallery'] },
  { hash: '#/contact', mustContain: ['Send a message', 'Get in touch'] },
  { hash: '#/about/strategies', mustContain: ['Core Principles'] },
  { hash: '#/about/vision', mustContain: ['Our vision'] },
  { hash: '#/about/chairman', mustContain: ['Founder & Chairman'] },
  { hash: '#/about/md', mustContain: ['Managing Director'] },
  { hash: '#/about/coordinator', mustContain: ['Coordinator'] },
  { hash: '#/this-page-does-not-exist', mustContain: ['This page has moved on'] },
  // A compact form, so it legitimately has far less text than the public pages.
  { hash: '#/admin/login', maintenance: true, mustContain: ['Admin Login', 'Expro Group Management'], minChars: 60 },
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
const check = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (err) {
    console.log(`  FAIL ${name}\n       ${err.message}`);
    process.exitCode = 1;
  }
};

const makeDom = (hash, maintenance = false) => {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => errors.push(`jsdomError: ${e.message}`));
  virtualConsole.on('error', (...args) => {
    const text = args.map(String).join(' ');
    // React logs caught render errors here; network noise from images is fine.
    if (!/Could not load img|Error: Not implemented/.test(text)) errors.push(text);
  });

  const dom = new JSDOM(
    `<!DOCTYPE html><html><body><div id="root"></div></body></html>`,
    {
      url: `${BASE}/${hash}`,
      runScripts: 'outside-only',
      pretendToBeVisual: true,
      virtualConsole,
    }
  );

  const { window } = dom;

  // jsdom has no fetch; route relative URLs at the live server. For the
  // maintenance test, intercept public config so the test never edits data.json.
  window.fetch = (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url, BASE);
    if (maintenance && url.pathname === '/api/config') {
      return Promise.resolve(new Response(JSON.stringify({
        success: true,
        message: 'config retrieved',
        data: {
          logoUrl: '',
          websiteName: 'Expro Group',
          maintenanceMode: true,
          maintenanceMessage: 'Temporary maintenance for testing',
          email: 'support@example.com',
          supportEmail: 'support@example.com',
        },
      }), { status: 200, headers: { 'content-type': 'application/json' } }));
    }
    return fetch(url.href, init);
  };

  // Reveal-on-scroll: report every element as visible immediately.
  window.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
    unobserve() {}
    disconnect() {}
  };

  window.matchMedia = window.matchMedia || ((query) => ({
    matches: false, query, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
  }));

  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};

  return { dom, window, errors };
};

const run = async () => {
  // Bundle the real App for the browser-ish jsdom environment.
  await build({
    entryPoints: [path.join(ROOT, 'tests', 'render.entry.tsx')],
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    outfile: BUNDLE,
    jsx: 'automatic',
    loader: { '.css': 'empty' },
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'silent',
  });
  const bundleSource = fs.readFileSync(BUNDLE, 'utf8');

  console.log(`rendering against ${BASE}\n`);

  for (const route of ROUTES) {
    const { dom, window, errors } = makeDom(route.hash, route.maintenance);
    try {
      window.eval(bundleSource);
    } catch (err) {
      console.log(`  FAIL ${route.hash}\n       bundle threw: ${err.message}`);
      process.exitCode = 1;
      continue;
    }

    // Allow effects + data fetches + the preloader minimum to settle.
    await wait(1600);

    const text = window.document.body.textContent || '';
    const headings = [...window.document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent.trim()).filter(Boolean);

    check(`${route.hash} renders`, () => {
      const min = route.minChars ?? 200;
      assert.ok(text.length > min, `page body is nearly empty (${text.length} chars, expected > ${min})`);
      assert.ok(headings.length > 0, 'no headings rendered');
    });

    for (const needle of route.mustContain) {
      check(`${route.hash} contains "${needle}"`, () => {
        assert.ok(
          text.toLowerCase().includes(needle.toLowerCase()),
          `expected to find "${needle}"`
        );
      });
    }

    for (const needle of route.mustNotContain || []) {
      check(`${route.hash} excludes "${needle}"`, () => {
        assert.ok(
          !text.toLowerCase().includes(needle.toLowerCase()),
          `did not expect to find "${needle}"`
        );
      });
    }

    check(`${route.hash} has no console/jsdom errors`, () => {
      assert.deepEqual(errors, [], errors.join('\n'));
    });

    dom.window.close();
  }

  try { fs.unlinkSync(BUNDLE); } catch { /* ignore */ }
  console.log(`\n${passed} checks passed${process.exitCode ? ' — FAILURES PRESENT' : ''}`);
};

run().catch((err) => {
  console.error('Render test crashed:', err);
  process.exit(1);
});
