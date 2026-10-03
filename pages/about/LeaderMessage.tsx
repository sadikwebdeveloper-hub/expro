import React from 'react';
import { Link } from 'react-router-dom';
import { PageHero, Reveal, CtaBand } from '../../components/ui';

export type LeaderMessageProps = {
  name: string;
  role: string;
  message: string;
  image?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  /** Other leaders shown as "continue reading" links. */
  related?: { label: string; to: string }[];
};

const DEFAULT_AVATAR = 'https://placehold.co/400x400/06192F/10B981?text=Expro';

/**
 * Shared layout for the Chairman / MD / Coordinator message pages. They only
 * differ in content, so the presentation lives in one place.
 */
export const LeaderMessage: React.FC<LeaderMessageProps> = ({
  name,
  role,
  message,
  image,
  heroTitle,
  heroSubtitle,
  heroImage,
  related = [],
}) => {
  const paragraphs = String(message || '')
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      <PageHero
        eyebrow={role}
        title={heroTitle}
        subtitle={heroSubtitle}
        image={heroImage}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About', to: '/about/strategies' }, { label: role }]}
      />

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Portrait card */}
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="overflow-hidden rounded-3xl border border-ink-900/[0.07] bg-white shadow-lift">
                  <div className="relative aspect-square bg-ink-100">
                    <img
                      src={image || DEFAULT_AVATAR}
                      alt={name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 to-transparent p-6 pt-16" aria-hidden>
                      <p className="text-[19px] font-bold text-white">{name}</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400">{role}</p>
                    </div>
                  </div>
                </div>

                {related.length > 0 && (
                  <nav className="mt-6 rounded-2xl border border-ink-900/[0.07] bg-white p-3 shadow-soft" aria-label="More messages">
                    <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
                      Also read
                    </p>
                    {related.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-ink-700 transition-colors hover:bg-ink-50 hover:text-brand-600"
                      >
                        <i className="fas fa-arrow-right text-[10px] text-brand-500" aria-hidden />
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                )}
              </div>
            </Reveal>

            {/* Message */}
            <Reveal delay={120} className="lg:col-span-8">
              <article className="max-w-3xl">
                <i className="fas fa-quote-left text-3xl text-brand-500/25" aria-hidden />
                <h2 className="mt-5 text-2xl font-bold leading-snug text-ink-900 sm:text-[2rem] text-balance">
                  {heroTitle}
                </h2>

                <div className="mt-8 space-y-6">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        className={`text-[16.5px] leading-[1.85] text-ink-600 text-pretty ${
                          index === 0 ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-brand-600' : ''
                        }`}
                      >
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-ink-900/15 bg-ink-50/60 px-6 py-10 text-center text-[15px] text-ink-500">
                      This message is being prepared for publication.
                    </p>
                  )}
                </div>

                <div className="mt-12 border-t border-ink-900/[0.07] pt-8">
                  <p className="text-[19px] font-bold text-ink-900">{name}</p>
                  <p className="mt-1 text-[11.5px] font-bold uppercase tracking-[0.2em] text-brand-600">{role}</p>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
};
