import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../services/backend';
import { SiteConfig, Company, NewsItem } from '../types';

const FALLBACK_LOGO = 'https://nexalite-org.github.io/storage/logo.png';

const SOCIALS: { key: keyof SiteConfig; icon: string; label: string }[] = [
  { key: 'facebookUrl', icon: 'fab fa-facebook-f', label: 'Facebook' },
  { key: 'instagramUrl', icon: 'fab fa-instagram', label: 'Instagram' },
  { key: 'linkedinUrl', icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
  { key: 'youtubeUrl', icon: 'fab fa-youtube', label: 'YouTube' },
  { key: 'twitterUrl', icon: 'fab fa-x-twitter', label: 'X' },
  { key: 'whatsappUrl', icon: 'fab fa-whatsapp', label: 'WhatsApp' },
  { key: 'telegramUrl', icon: 'fab fa-telegram', label: 'Telegram' },
];

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our Strategies', to: '/about/strategies' },
  { label: 'Vision & Mission', to: '/about/vision' },
  { label: 'Our Companies', to: '/companies' },
  { label: 'Products', to: '/products' },
  { label: 'Media & News', to: '/media' },
  { label: 'Contact Us', to: '/contact' },
];

export const Footer: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const year = new Date().getFullYear();

  useEffect(() => {
    let alive = true;
    backend.getConfig().then((c) => alive && setConfig(c));
    backend.getCompanies().then((d) => alive && setCompanies(d.slice(0, 5)));
    backend.getNews().then((d) => alive && setNews(d.slice(0, 3)));
    return () => { alive = false; };
  }, []);

  const activeSocials = SOCIALS.filter((s) => {
    const value = config?.[s.key] as string | undefined;
    return value && value !== '#' && value.trim().length > 0;
  });

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      <div className="absolute inset-0 bg-mesh-hero opacity-40" aria-hidden />

      {/* Newsletter band */}
      <div className="relative z-10 border-b border-white/[0.07]">
        <div className="container-x grid gap-6 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="text-2xl font-bold text-white sm:text-[1.7rem]">Stay close to our work</h3>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-300">
              Updates on new ventures, welfare programmes and milestones — no noise.
            </p>
          </div>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const email = config?.email;
              if (email) window.location.href = `mailto:${email}?subject=Subscribe to Expro Group updates`;
            }}
          >
            <label className="sr-only" htmlFor="footer-email">Email address</label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="you@company.com"
              className="h-13 w-full rounded-full border border-white/12 bg-white/[0.06] px-6 py-3.5 text-[15px] text-white placeholder:text-ink-400 backdrop-blur transition focus:border-brand-400/60 focus:bg-white/[0.09] focus:outline-none"
            />
            <button type="submit" className="btn-primary shrink-0">
              Subscribe <i className="fas fa-paper-plane text-sm" aria-hidden />
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="container-x relative z-10 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <img
              src={config?.logoUrl || FALLBACK_LOGO}
              alt={config?.websiteName || 'Expro Group'}
              className="h-12 w-auto rounded-lg bg-white p-2 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO; }}
            />
            <p className="mt-6 max-w-sm text-[14.5px] leading-relaxed text-ink-300">
              {config?.footerText}
            </p>

            {activeSocials.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2.5">
                {activeSocials.map((s) => (
                  <a
                    key={s.key}
                    href={config?.[s.key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-ink-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-brand-500 hover:text-white"
                  >
                    <i className={s.icon} aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <nav className="lg:col-span-2" aria-label="Footer">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.18em] text-white">Explore</h4>
            <ul className="mt-6 space-y-3 text-[14px]">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="group inline-flex items-center gap-2 transition-colors hover:text-brand-300">
                    <i className="fas fa-chevron-right text-[8px] text-brand-500/70 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Companies */}
          <div className="lg:col-span-3">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.18em] text-white">Our Companies</h4>
            <ul className="mt-6 space-y-3.5 text-[14px]">
              {companies.map((company) => (
                <li key={company.id}>
                  <Link to="/companies" className="group flex items-start gap-3 transition-colors hover:text-brand-300">
                    <i className={`fas ${company.icon || 'fa-building'} mt-1 w-3 text-[11px] text-brand-500/80`} aria-hidden />
                    <span className="leading-snug">{company.name}</span>
                  </Link>
                </li>
              ))}
              {companies.length === 0 && <li className="text-ink-500">—</li>}
            </ul>
          </div>

          {/* Contact + latest news */}
          <div className="lg:col-span-3">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.18em] text-white">Get in touch</h4>
            <ul className="mt-6 space-y-4 text-[14px]">
              {config?.address && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-brand-400">
                    <i className="fas fa-location-dot text-[11px]" aria-hidden />
                  </span>
                  <span className="leading-relaxed text-ink-300">{config.address}</span>
                </li>
              )}
              {config?.phone && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-brand-400">
                    <i className="fas fa-phone-alt text-[11px]" aria-hidden />
                  </span>
                  <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="transition hover:text-brand-300">
                    {config.phone}
                  </a>
                </li>
              )}
              {config?.email && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-brand-400">
                    <i className="fas fa-envelope text-[11px]" aria-hidden />
                  </span>
                  <a href={`mailto:${config.email}`} className="break-all transition hover:text-brand-300">
                    {config.email}
                  </a>
                </li>
              )}
            </ul>

            {news.length > 0 && (
              <div className="mt-8">
                <h4 className="text-[13px] font-bold uppercase tracking-[0.18em] text-white">Latest</h4>
                <ul className="mt-4 space-y-3 text-[13px]">
                  {news.map((item) => (
                    <li key={item.id}>
                      <Link to="/media" className="group block leading-snug text-ink-300 transition-colors hover:text-brand-300">
                        {item.title}
                      </Link>
                      <span className="text-[11px] text-ink-500">{item.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/[0.07]">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-[12.5px] text-ink-400 sm:flex-row">
          <p>&copy; {year} {config?.websiteName || 'Expro Group'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/contact" className="transition-colors hover:text-white">Terms of Use</Link>
            <Link to="/admin/login" className="flex items-center gap-1.5 transition-colors hover:text-white">
              <i className="fas fa-shield-halved text-[10px]" aria-hidden /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
