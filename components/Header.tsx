import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { backend } from '../services/backend';
import { SiteConfig } from '../types';

const FALLBACK_LOGO = 'https://nexalite-org.github.io/storage/logo.png';

const ABOUT_LINKS = [
  { name: 'Our Strategies', path: '/about/strategies', icon: 'fa-chess-knight', blurb: 'How we plan and grow' },
  { name: 'Vision & Mission', path: '/about/vision', icon: 'fa-bullseye', blurb: 'Where we are headed' },
  { name: 'Chairman’s Message', path: '/about/chairman', icon: 'fa-user-tie', blurb: 'A word from the founder' },
  { name: 'MD’s Message', path: '/about/md', icon: 'fa-briefcase', blurb: 'Leadership in execution' },
  { name: 'Coordinator’s Message', path: '/about/coordinator', icon: 'fa-people-arrows', blurb: 'Delivery on the ground' },
];

const SOCIALS: { key: keyof SiteConfig; icon: string; label: string }[] = [
  { key: 'facebookUrl', icon: 'fab fa-facebook-f', label: 'Facebook' },
  { key: 'linkedinUrl', icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
  { key: 'youtubeUrl', icon: 'fab fa-youtube', label: 'YouTube' },
  { key: 'instagramUrl', icon: 'fab fa-instagram', label: 'Instagram' },
  { key: 'twitterUrl', icon: 'fab fa-x-twitter', label: 'X' },
];

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAbout, setMobileAbout] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const location = useLocation();
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    backend.getConfig().then((c) => alive && setConfig(c));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(y / max, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation and lock body scroll while mobile menu is open.
  useEffect(() => {
    setMobileOpen(false);
    setAboutOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const openAbout = () => {
    window.clearTimeout(closeTimer.current);
    setAboutOpen(true);
  };
  const scheduleCloseAbout = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setAboutOpen(false), 160);
  };

  const isActive = (path: string) => location.pathname === path;
  const isAboutActive = location.pathname.startsWith('/about');
  const isHome = location.pathname === '/';
  const headerShadow = !isHome || scrolled ? 'shadow-soft' : '';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Companies', path: '/companies' },
    { name: 'Products', path: '/products' },
    { name: 'Media', path: '/media' },
  ];

  const activeSocials = SOCIALS.filter((s) => {
    const value = config?.[s.key] as string | undefined;
    return value && value !== '#' && value.trim().length > 0;
  });

  const linkColor = 'text-ink-700 hover:text-brand-600';

  return (
    <>
      {/* Utility bar */}
      <div
        className={`relative z-40 hidden bg-ink-950 text-ink-200 transition-all duration-500 md:block ${
          scrolled ? '-mt-11 opacity-0' : 'mt-0 opacity-100'
        }`}
      >
        <div className="container-x flex h-11 items-center justify-between text-[12.5px]">
          <div className="flex items-center gap-7">
            {config?.phone && (
              <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="group flex items-center gap-2 hover:text-white">
                <i className="fas fa-phone-alt text-[10px] text-brand-400" aria-hidden />
                <span>{config.phone}</span>
              </a>
            )}
            {config?.email && (
              <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:text-white">
                <i className="fas fa-envelope text-[10px] text-brand-400" aria-hidden />
                <span>{config.email}</span>
              </a>
            )}
            <span className="hidden items-center gap-2 text-ink-400 lg:flex">
              <i className="fas fa-location-dot text-[10px] text-brand-400" aria-hidden />
              <span>{config?.address}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {activeSocials.map((s) => (
              <a
                key={s.key}
                href={config?.[s.key] as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-ink-300 transition hover:text-brand-400"
              >
                <i className={s.icon} aria-hidden />
              </a>
            ))}
            <span className="h-3.5 w-px bg-white/15" aria-hidden />
            <Link to="/admin/login" className="flex items-center gap-1.5 text-ink-300 transition hover:text-white">
              <i className="fas fa-lock text-[10px]" aria-hidden /> Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className={`main-navigation-surface sticky top-0 z-50 w-full transition-all duration-500 ${headerShadow}`}>
        <div className="container-x main-navigation-surface">
          <div className={`main-navigation-surface flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[68px]' : 'h-[76px]'}`}>
            <Link to="/" className="group flex min-w-0 shrink items-center gap-3" aria-label="Expro Group home">
              {/*
                No colour filter here. The previous `brightness-0 invert` forced every
                pixel black and then flipped it to pure white, which turned any logo
                with an opaque background into a solid white rectangle.
                max-w keeps a wide logo from shoving the menu button off-screen, and
                object-contain preserves the aspect ratio at any size.
              */}
              <img
                src={config?.logoUrl || FALLBACK_LOGO}
                alt={config?.websiteName || 'Expro Group'}
                className={`h-auto w-auto max-w-[clamp(112px,38vw,176px)] object-contain object-left transition-opacity duration-300 sm:max-w-[200px] ${
                  scrolled ? 'max-h-9' : 'max-h-11'
                } group-hover:opacity-85`}
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO; }}
              />
            </Link>

            {/* Desktop menu */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative rounded-full px-4 py-2 text-[14.5px] font-semibold transition-colors ${linkColor} ${
                    isActive(link.path) ? '!text-brand-600' : ''
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-500" aria-hidden />
                  )}
                </Link>
              ))}

              {/* About dropdown */}
              <div className="relative" onMouseEnter={openAbout} onMouseLeave={scheduleCloseAbout}>
                <button
                  type="button"
                  onClick={() => setAboutOpen((v) => !v)}
                  aria-expanded={aboutOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[14.5px] font-semibold transition-colors ${linkColor} ${
                    isAboutActive ? '!text-brand-600' : ''
                  }`}
                >
                  About Us
                  <i className={`fas fa-chevron-down text-[9px] transition-transform duration-300 ${aboutOpen ? 'rotate-180' : ''}`} aria-hidden />
                </button>

                <div
                  className={`absolute left-1/2 top-[calc(100%+14px)] w-[30rem] origin-top -translate-x-1/2 transition-all duration-300 ${
                    aboutOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-[0.97] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden rounded-2xl border border-ink-900/[0.08] bg-white p-2 shadow-lift">
                    {ABOUT_LINKS.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`group flex items-start gap-3.5 rounded-xl px-4 py-3 transition-colors ${
                          isActive(link.path) ? 'bg-brand-50' : 'hover:bg-ink-50'
                        }`}
                      >
                        <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[13px] transition-colors ${
                          isActive(link.path) ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-500 group-hover:bg-brand-500 group-hover:text-white'
                        }`}>
                          <i className={`fas ${link.icon}`} aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-[14px] font-semibold ${isActive(link.path) ? 'text-brand-700' : 'text-ink-800'}`}>
                            {link.name}
                          </span>
                          <span className="block text-[12.5px] text-ink-400">{link.blurb}</span>
                        </span>
                        <i className="fas fa-arrow-right ml-auto mt-2.5 text-[10px] text-ink-300 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link to="/contact" className="btn-primary ml-4 !px-6 !py-2.5 text-[14px]">
                Contact Us
              </Link>
            </nav>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="grid h-11 w-11 place-items-center rounded-xl border border-ink-900/10 text-ink-800 transition-colors lg:hidden"
            >
              <i className={`fas ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden />
            </button>
          </div>
        </div>

        {/* Reading progress */}
        <div className="main-navigation-surface h-[2px] w-full" aria-hidden>
          <div
            className="h-full origin-left bg-gradient-to-r from-brand-400 to-brand-600 transition-transform duration-150"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] overflow-hidden lg:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`main-navigation-surface absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink-900/[0.07] px-5 py-4">
            <img src={config?.logoUrl || FALLBACK_LOGO} alt="Expro Group" className="h-9 w-auto object-contain" />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-700"
            >
              <i className="fas fa-xmark" aria-hidden />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
            <Link to="/" className="block border-b border-ink-900/[0.06] py-3.5 text-[15px] font-semibold text-ink-800">
              Home
            </Link>

            <div className="border-b border-ink-900/[0.06]">
              <button
                type="button"
                onClick={() => setMobileAbout((v) => !v)}
                aria-expanded={mobileAbout}
                className="flex w-full items-center justify-between py-3.5 text-[15px] font-semibold text-ink-800"
              >
                About Us
                <i className={`fas fa-chevron-down text-[10px] text-ink-400 transition-transform ${mobileAbout ? 'rotate-180' : ''}`} aria-hidden />
              </button>
              <div className={`grid transition-all duration-300 ${mobileAbout ? 'grid-rows-[1fr] pb-3' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  {ABOUT_LINKS.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center gap-3 rounded-lg py-2.5 pl-3 text-[13.5px] text-ink-600 hover:bg-ink-50 hover:text-brand-600"
                    >
                      <i className={`fas ${link.icon} w-4 text-[11px] text-brand-500`} aria-hidden />
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block border-b border-ink-900/[0.06] py-3.5 text-[15px] font-semibold text-ink-800"
              >
                {link.name}
              </Link>
            ))}

            <Link to="/contact" className="btn-primary mt-6 w-full">
              Contact Us <i className="fas fa-arrow-right text-sm" aria-hidden />
            </Link>

            <div className="mt-8 space-y-3 text-[13px] text-ink-500">
              {config?.phone && (
                <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-50 text-brand-600">
                    <i className="fas fa-phone-alt text-[11px]" aria-hidden />
                  </span>
                  {config.phone}
                </a>
              )}
              {config?.email && (
                <a href={`mailto:${config.email}`} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-50 text-brand-600">
                    <i className="fas fa-envelope text-[11px]" aria-hidden />
                  </span>
                  {config.email}
                </a>
              )}
            </div>
          </nav>

          {activeSocials.length > 0 && (
            <div className="flex items-center justify-center gap-3 border-t border-ink-900/[0.07] px-5 py-4">
              {activeSocials.map((s) => (
                <a
                  key={s.key}
                  href={config?.[s.key] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-500 transition hover:bg-brand-500 hover:text-white"
                >
                  <i className={s.icon} aria-hidden />
                </a>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
};
