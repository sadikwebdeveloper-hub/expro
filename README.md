# Expro Group — Corporate Website

A full-stack corporate website for Expro Group: a React 19 front end, an Express 5
API, a JSON-backed store, and a complete transactional mail (SMTP) system with an
admin panel for content, users, settings and analytics.

---

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev               # Vite on :3000 (proxies /api) + API on :5000
```

Production:

```bash
npm run build             # -> dist/
npm start                 # Express serves the API *and* dist/ on one port
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server + API server together |
| `npm run build` | Production build to `dist/` |
| `npm start` | Serve API + built client |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | SMTP unit/integration + contact API end-to-end |
| `npm run test:smtp` | Mail service against a real local SMTP server |
| `npm run test:api` | `POST /api/messages` → SMTP, end to end |
| `npm run test:render` | Renders every route in jsdom (**needs the server running**) |

---

## SMTP

Mail is configured in the admin panel at **Settings → SMTP**, or via environment
variables as a fallback. Stored passwords are encrypted at rest with AES-256-GCM
(`server/services/cryptoService.js`).

| Setting | Notes |
| --- | --- |
| Host | e.g. `smtp.gmail.com` |
| Port | `465` = SSL, `587` = STARTTLS |
| Encryption | `SSL`, `TLS` (STARTTLS) or `None`. Wins over port-based detection |
| Username / Password | Gmail needs an **App Password**, not your account password |
| From name / From email | From address must match the authenticated user on Gmail |
| Reply-To | Where visitor replies land |

Feature switches: `enabled`, `enableContactForm`, `enableOtp`,
`enableForgotPassword`, `enableWelcome`.

### Emails that are sent

| Trigger | Recipient |
| --- | --- |
| Contact form submission | Every address in `contact.notificationEmails` |
| Contact form submission | The visitor (confirmation) |
| Admin invitation | The new admin (temporary password) |
| Password reset / OTP | The account holder |
| SMTP test | The address entered in Settings |

### IPv4 pinning — why `server/services/dnsResolver.js` exists

nodemailer 9 resolves the mail host itself and then picks a **random** entry from
the combined A + AAAA list (`formatDNSValue` in `nodemailer/lib/shared/index.js`).
Its transport-level `family` option is never read by `lib/smtp-connection`, so
`family: 4` silently does nothing. On any host that exposes an IPv6 interface
without a working IPv6 route, roughly half of all connections die with
`ENETUNREACH` — intermittent, and very hard to diagnose.

The resolver fixes this by resolving to IPv4 ourselves and handing nodemailer a
resolved **IP literal**, which short-circuits its random pick. `servername` is
still the real domain so SNI and certificate validation keep working.
`pickReachableAddress()` then fails over between the mail server's IPs instead of
leaving it to chance.

### Honest delivery reporting

`POST /api/messages` always stores the submission first, then reports what
actually happened with delivery:

```json
{ "emailNotification": { "delivered": true, "attempted": 2, "failed": 0, "skipped": false } }
```

The contact form shows a green confirmation, an amber "received but notification
unavailable", or a red error — it no longer claims success when mail failed.

---

## Tests

`npm test` boots a real SMTP server (`smtp-server`) on loopback and drives the
production `mailService` and Express app against it — the same code paths that
run in deployment, not stand-ins. 28 checks, covering:

- IPv4-only resolution, IP-literal passthrough, caching, unreachable-candidate skip
- Message delivery, `From` / `Reply-To` / body correctness
- Rejection on bad credentials, and behaviour when SMTP is unconfigured
- `testConnection()` success and failure
- Password encryption round-trip through stored settings
- Admin notification fan-out and visitor confirmation
- `POST /api/messages` end to end, validation rejection, and the SMTP-disabled path

Outbound SMTP to third-party providers is blocked on many CI/sandbox networks,
which is why the target server is local.

---

## Environment

See `.env.example`. The important ones:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `production` enables CSP + strict mail errors |
| `APP_URL` | Public origin, used for CORS and links in emails |
| `JWT_SECRET` | Session signing **and** the SMTP password encryption key |
| `SMTP_*` | Fallback SMTP config when the database has none |
| `CLOUDINARY_*` | Optional image hosting; falls back to local `uploads/` |
| `EXPRO_DATA_FILE` | Override the data file (used by tests) |

> **Careful with `JWT_SECRET`.** It also derives the key that decrypts the stored
> SMTP password. Changing it on an existing deployment invalidates that password —
> re-enter it in Settings → SMTP afterwards.

## Project layout

```
server/
  app.js              Express app, security middleware, static serving
  config/             env, defaults, permissions, upload
  controllers/        HTTP handlers
  middleware/         auth, validation, rate limits, errors
  routes/             route table
  services/           mail, settings, auth, crypto, cloudinary, logging
  database/           JSON store (swap for a real DB behind this interface)
pages/                public site + about sub-pages
pages/admin/          admin panel
components/           header, footer, preloader, shared UI primitives
tests/                SMTP, API and render suites
data.json             runtime content store
```
