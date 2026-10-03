import React from 'react';
import { Link } from 'react-router-dom';
import { SiteConfig } from '../types';

const FALLBACK_LOGO = 'https://nexalite-org.github.io/storage/logo.png';

export const Maintenance: React.FC<{ config: SiteConfig }> = ({ config }) => {
  const supportEmail = config.supportEmail || config.email;

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-ink-950 px-5 py-8 text-white sm:px-8">
      <div className="absolute inset-0 bg-mesh-hero opacity-70" aria-hidden />
      <div className="absolute right-4 top-12 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
      <div className="absolute bottom-6 left-5 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex min-w-0 items-center gap-3" aria-label={`${config.websiteName || 'Expro Group'} home`}>
            <img
              src={config.logoUrl || FALLBACK_LOGO}
              alt={config.websiteName || 'Expro Group'}
              className="max-h-12 w-auto max-w-[min(52vw,220px)] object-contain object-left"
              onError={(event) => { (event.currentTarget as HTMLImageElement).src = FALLBACK_LOGO; }}
            />
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-ink-200 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            Scheduled maintenance
          </span>
        </header>

        <section className="my-auto grid items-center gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-brand-300/20 bg-brand-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
              <i className="fas fa-screwdriver-wrench" aria-hidden />
              We’ll be back soon
            </span>
            <h1 className="mt-7 max-w-2xl text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              A little work behind the scenes.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink-200 sm:text-lg">
              {config.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.'}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
                >
                  <i className="fas fa-envelope" aria-hidden />
                  Contact support
                </a>
              )}
              <Link
                to="/admin/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                <i className="fas fa-lock" aria-hidden />
                Administrator sign in
              </Link>
            </div>
          </div>

          <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center rounded-full border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/20">
            <div className="absolute inset-5 rounded-full border border-dashed border-brand-300/20" aria-hidden />
            <div className="absolute inset-12 rounded-full border border-white/[0.08]" aria-hidden />
            <div className="relative grid h-36 w-36 place-items-center rounded-[2rem] border border-brand-300/20 bg-gradient-to-br from-brand-400/20 to-brand-400/5 text-brand-300 shadow-[0_20px_80px_-32px_rgba(16,185,129,0.8)] sm:h-44 sm:w-44">
              <i className="fas fa-gears text-6xl sm:text-7xl" aria-hidden />
            </div>
            <span className="absolute right-8 top-12 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-ink-900 text-brand-300 shadow-lg sm:right-12">
              <i className="fas fa-wrench" aria-hidden />
            </span>
            <span className="absolute bottom-12 left-7 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-ink-900 text-amber-300 shadow-lg sm:left-12">
              <i className="fas fa-screwdriver" aria-hidden />
            </span>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <span>{config.websiteName || 'Expro Group'}</span>
          <span>Thank you for your patience.</span>
        </footer>
      </div>
    </main>
  );
};
