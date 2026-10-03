import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                       */
/* ------------------------------------------------------------------ */
export const Reveal: React.FC<{
  children?: ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Section heading                                                     */
/* ------------------------------------------------------------------ */
export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
}> = ({ eyebrow, title, subtitle, align = 'center', tone = 'dark', className = '' }) => (
  <div
    className={`${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}
  >
    {eyebrow && (
      <span
        className={`${tone === 'light' ? 'eyebrow-light' : 'eyebrow'} ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        {eyebrow}
      </span>
    )}
    <h2
      className={`mt-4 text-3xl sm:text-4xl lg:text-[2.7rem] lg:leading-[1.12] font-bold text-balance ${
        tone === 'light' ? 'text-white' : 'text-ink-900'
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className={`mt-5 text-base sm:text-lg leading-relaxed text-pretty ${
          tone === 'light' ? 'text-ink-200' : 'text-ink-500'
        }`}
      >
        {subtitle}
      </p>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/* Count-up statistic                                                  */
/* ------------------------------------------------------------------ */
export const CountUp: React.FC<{ target: string; className?: string; duration?: number }> = ({
  target,
  className = '',
  duration = 1800,
}) => {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const match = String(target).match(/[\d,]+/);
  const end = match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
  const prefix = String(target).slice(0, match?.index ?? 0);
  const suffix = match ? String(target).slice((match.index ?? 0) + match[0].length) : '';

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || end === 0) return;
    let frame = 0;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo for a satisfying settle
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * end));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Page hero (inner pages)                                             */
/* ------------------------------------------------------------------ */
export const PageHero: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  breadcrumb?: { label: string; to?: string }[];
}> = ({ eyebrow = 'Expro Group', title, subtitle, image, breadcrumb }) => (
  <section className="relative overflow-hidden bg-ink-950 pt-36 pb-20 sm:pt-44 sm:pb-24">
    {image && (
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900/92 to-ink-900/70" aria-hidden />
    <div className="absolute inset-0 bg-mesh-hero opacity-70" aria-hidden />

    <div className="container-x relative z-10">
      <Reveal>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-ink-300">
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && <i className="fas fa-chevron-right text-[9px] text-ink-500" aria-hidden />}
                {crumb.to ? (
                  <Link to={crumb.to} className="link-underline hover:text-brand-300">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <span className="eyebrow-light">{eyebrow}</span>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg text-pretty">
            {subtitle}
          </p>
        )}
      </Reveal>
    </div>

    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
  </section>
);

/* ------------------------------------------------------------------ */
/* Call to action band                                                 */
/* ------------------------------------------------------------------ */
export const CtaBand: React.FC<{
  title?: string;
  text?: string;
}> = ({
  title = 'Let’s build something enduring together',
  text = 'Partner with a group that measures success in decades, not quarters.',
}) => (
  <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-24">
    <div className="absolute inset-0 bg-mesh-hero opacity-80" aria-hidden />
    <div className="container-x relative z-10">
      <Reveal>
        <div className="flex flex-col items-center gap-10 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center backdrop-blur-xl sm:px-14">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl text-balance">{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-200 sm:text-lg">{text}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact" className="btn-primary">
              Start a Conversation <i className="fas fa-arrow-right text-sm" aria-hidden />
            </Link>
            <Link to="/companies" className="btn-ghost-light">
              Explore Our Portfolio
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Back to top                                                         */
/* ------------------------------------------------------------------ */
export const BackToTop: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-ink-900 text-white shadow-lift transition-all duration-300 hover:bg-brand-600 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <i className="fas fa-arrow-up" aria-hidden />
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Safe image with fallback                                            */
/* ------------------------------------------------------------------ */
export const SmartImage: React.FC<{
  src?: string;
  alt: string;
  fallback?: string;
  className?: string;
  imgClassName?: string;
}> = ({ src, alt, fallback, className = '', imgClassName = '' }) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resolved = src && !failed ? src : fallback;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      {resolved ? (
        <img
          src={resolved}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`relative transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-ink-100 text-ink-400">
          <i className="fas fa-image text-2xl" aria-hidden />
        </div>
      )}
    </div>
  );
};
