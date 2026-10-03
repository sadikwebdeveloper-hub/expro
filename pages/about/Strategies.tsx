import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';
import { PageHero, Reveal, CtaBand, SmartImage } from '../../components/ui';

const PILLARS = [
  {
    icon: 'fa-chart-line',
    title: 'Growth',
    text: 'Consistent, compounding progress across our industrial and commercial sectors.',
    accent: 'bg-brand-50 text-brand-600',
  },
  {
    icon: 'fa-users',
    title: 'Human Capital',
    text: 'Recruiting skilled people, creating employment and treating employees as family.',
    accent: 'bg-ink-100 text-ink-700',
  },
  {
    icon: 'fa-hand-holding-heart',
    title: 'Responsibility',
    text: 'Social welfare and sustainable development carried into every decision.',
    accent: 'bg-gold-500/12 text-gold-600',
  },
];

export const Strategies: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    let alive = true;
    backend.getAboutContent().then((c) => {
      if (!alive) return;
      setContent(c);
    });
    return () => { alive = false; };
  }, []);


  const paragraphs = String(content?.introText || '')
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      <PageHero
        eyebrow="About Us"
        title={content?.introTitle || 'Strategic excellence'}
        subtitle="Our roadmap to sustainable development, disciplined execution and lasting impact."
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1600"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Our Strategies' }]}
      />

      {/* Narrative */}
      <section className="py-20 sm:py-24">
        <div className="container-x">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SmartImage
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=1200"
                alt="Expro Group strategy session"
                className="aspect-[4/5] rounded-3xl shadow-lift"
                imgClassName="h-full w-full object-cover"
              />
            </Reveal>

            <Reveal delay={120} className="lg:col-span-7">
              <span className="eyebrow">Core Principles</span>
              <h2 className="mt-5 text-3xl font-bold leading-[1.15] text-ink-900 sm:text-[2.5rem] text-balance">
                {content?.introTitle}
              </h2>

              <div className="mt-8 space-y-6">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-[16.5px] leading-[1.85] text-ink-600 text-pretty">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-[16.5px] leading-[1.85] text-ink-600">
                    Our strategy focuses on sustainable development, transparency and the highest standards of
                    quality across every subsidiary.
                  </p>
                )}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/about/vision" className="btn-dark">
                  Vision &amp; Mission <i className="fas fa-arrow-right text-sm" aria-hidden />
                </Link>
                <Link to="/companies" className="btn-outline">Our Companies</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-ink-50/70 py-20 sm:py-24">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 100}>
                <article className="card card-hover h-full p-8">
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl text-xl ${pillar.accent}`}>
                    <i className={`fas ${pillar.icon}`} aria-hidden />
                  </span>
                  <h3 className="mt-6 text-[19px] font-bold text-ink-900">{pillar.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">{pillar.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership shortcuts */}
      <section className="py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                { to: '/about/chairman', label: 'Chairman’s Message', name: content?.chairmanName, icon: 'fa-user-tie' },
                { to: '/about/md', label: 'MD’s Message', name: content?.mdName, icon: 'fa-briefcase' },
                { to: '/about/coordinator', label: 'Coordinator’s Message', name: content?.coordinatorName, icon: 'fa-people-arrows' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="card card-hover group flex items-center gap-4 p-6"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                    <i className={`fas ${item.icon}`} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-ink-900">{item.label}</span>
                    <span className="block truncate text-[13px] text-ink-400">{item.name}</span>
                  </span>
                  <i className="fas fa-arrow-right ml-auto text-[11px] text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </div>
  );
};
