/**
 * Static overflow audit.
 *
 * A browser is not available in this environment, so instead of eyeballing the
 * CSS this parses the source for the constructs that actually cause horizontal
 * overflow — negative absolute offsets, transforms, fixed widths — and computes
 * the margin against the .container-x padding at each breakpoint.
 *
 * A negative offset only overflows when |offset| > the container's side padding.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Must match .container-x in index.css and the breakpoints in tailwind.config.js
const CONTAINER_PAD = { base: 20, sm: 24, lg: 32 };   // px-5 / sm:px-6 / lg:px-8
const TAILWIND_SPACING = 4;                            // 1 unit = 0.25rem = 4px
const SPACING_OVERRIDE = { 0.5: 2, 1.5: 6, 2.5: 10, 3.5: 14 };

const px = (unit) =>
  SPACING_OVERRIDE[unit] !== undefined ? SPACING_OVERRIDE[unit] : unit * TAILWIND_SPACING;

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.tsx?$/.test(entry.name) && !full.includes('/admin/')) files.push(full);
  }
};
walk(path.join(ROOT, 'pages'));
walk(path.join(ROOT, 'components'));

const OFFSET_RE = /(?:^|\s)(?:sm:|md:|lg:|xl:)?-(?:left|right)-(\d+(?:\.\d+)?)/g;
const FIXED_W_RE = /(?:^|\s)w-\[(\d{3,})px\]/g;
const MIN_W_RE = /(?:^|\s)min-w-\[(\d{3,})px\]/g;

let problems = 0;
const rows = [];

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const rel = path.relative(ROOT, file);
    const at = `${rel}:${i + 1}`;

    for (const m of line.matchAll(OFFSET_RE)) {
      const raw = m[0].trim();
      const prefix = raw.startsWith('sm:') ? 'sm' : raw.startsWith('lg:') ? 'lg'
        : raw.startsWith('md:') ? 'md' : raw.startsWith('xl:') ? 'xl' : 'base';
      const offset = px(parseFloat(m[1]));

      // The offset applies from the breakpoint upward, so check that breakpoint
      // and every wider one.
      for (const [bp, pad] of Object.entries(CONTAINER_PAD)) {
        const order = ['base', 'sm', 'lg'];
        if (order.indexOf(prefix) > order.indexOf(bp)) continue;
        const margin = pad - offset;
        const ok = margin >= 0;
        if (!ok) problems += 1;
        rows.push({
          at, cls: raw, breakpoint: bp, offset, pad, margin,
          status: ok ? 'ok' : 'OVERFLOW',
        });
      }
    }

    for (const re of [FIXED_W_RE, MIN_W_RE]) {
      for (const m of line.matchAll(re)) {
        const w = parseInt(m[1], 10);
        if (w > 360) {
          problems += 1;
          rows.push({ at, cls: m[0].trim(), breakpoint: 'all', offset: w, pad: 0, margin: 360 - w, status: 'TOO WIDE' });
        }
      }
    }
  });
}

// Only report the worst (smallest) margin per element+breakpoint
const seen = new Map();
for (const r of rows) {
  const key = `${r.at}|${r.cls}|${r.breakpoint}`;
  if (!seen.has(key)) seen.set(key, r);
}

console.log('Negative offsets vs .container-x padding\n');
for (const r of [...seen.values()].sort((a, b) => a.margin - b.margin)) {
  console.log(
    `  ${r.status.padEnd(8)} ${r.breakpoint.padEnd(5)} margin=${String(r.margin).padStart(4)}px  ` +
    `(-${r.offset}px offset, ${r.pad}px pad)  ${r.cls.padEnd(16)} ${r.at}`
  );
}

console.log('\nStructural guards\n');
const css = fs.readFileSync(path.join(ROOT, 'index.css'), 'utf8');
const header = fs.readFileSync(path.join(ROOT, 'components', 'Header.tsx'), 'utf8');

// Strip JS/JSX comments so an explanatory comment mentioning the old filter
// doesn't register as a live usage.
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const headerCode = stripComments(header);
const mainNav = headerCode.match(/<header\b[\s\S]*?<\/header>/)?.[0] || '';
const mainNavOpenTag = mainNav.match(/<header\b[^>]*>/)?.[0] || '';
const navSurfaceRule = css.match(/\.main-navigation-surface\s*\{([^}]*)\}/)?.[1] || '';
const logoImg = headerCode.match(/<img[\s\S]{0,400}?logoUrl[\s\S]{0,600}?\/>/);

const guards = [
  ['body has overflow-x: clip', /body\s*\{[^}]*overflow-x:\s*clip/s.test(css)],
  ['body has max-width: 100%', /body\s*\{[^}]*max-width:\s*100%/s.test(css)],
  ['box-sizing: border-box is global', /\*,\s*\*::before,\s*\*::after\s*\{\s*box-sizing:\s*border-box/s.test(css)],
  [
    'navbar, inner wrappers, and mobile drawer share the branded surface',
    /className=\{`main-navigation-surface sticky/.test(mainNavOpenTag) &&
      /className="container-x main-navigation-surface"/.test(mainNav) &&
      /className=\{`main-navigation-surface flex/.test(mainNav) &&
      /className="main-navigation-surface h-\[2px\] w-full"/.test(mainNav) &&
      /className=\{`main-navigation-surface absolute right-0/.test(headerCode),
  ],
  [
    'navbar surface is opaque #FDFEFF with no background image',
    /background-color:\s*#FDFEFF/i.test(navSurfaceRule) && /background-image:\s*none/i.test(navSurfaceRule),
  ],
  [
    'main navbar no longer uses the translucent hero gradient or glass blur',
    !/(?:bg-gradient-to-b|from-ink-950\/70|backdrop-blur|bg-white\/78)/.test(mainNavOpenTag),
  ],
  ['mobile drawer clips its off-screen panel', /fixed inset-0 z-\[60\] overflow-hidden/.test(headerCode)],
  ['header <img> located for inspection', Boolean(logoImg)],
  ['header logo has no brightness/invert filter', Boolean(logoImg) && !/brightness-0|invert/.test(logoImg[0])],
  ['header logo has no destructive filter anywhere in Header', !/brightness-0|\binvert\b/.test(headerCode)],
  ['header logo is width-constrained', /max-w-\[clamp\(/.test(headerCode)],
  ['header logo preserves aspect ratio', Boolean(logoImg) && /object-contain/.test(logoImg[0])],
  ['no 100vw anywhere', !files.some((f) => stripComments(fs.readFileSync(f, 'utf8')).includes('100vw'))],
  ['no full-screen Preloader remains', !files.some((f) => fs.readFileSync(f, 'utf8').includes('Preloader'))],
];

for (const [name, ok] of guards) {
  console.log(`  ${ok ? 'ok      ' : 'FAIL    '} ${name}`);
  if (!ok) problems += 1;
}

console.log(`\n${problems === 0 ? '✓ no overflow risks found' : `✗ ${problems} problem(s)`}`);
process.exit(problems === 0 ? 0 : 1);
