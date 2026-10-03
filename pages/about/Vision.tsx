import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';
import { Preloader } from '../../components/Preloader';
import { PageHero, Reveal, CtaBand, SmartImage } from '../../components/ui';

export const Vision: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    backend.getAboutContent().then((c) => {
      if (!alive) return;
      setContent(c);
      window.setTimeout(() => alive && setLoading(false), 500);
    });
    return () => { alive = false; };
  }, []);

  if (loading) return <Preloader />;

  const mission = content?.mission?.filter(Boolean) ?? [];

  return (
    <div>
      <PageHero
        eyebrow="About Us"
        title="Vision & mission"
        subtitle="The purpose that guides every company in the Expro Group portfolio."
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1600"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Vision & Mission' }]}
      />

      {/* Vision */}
      <section className="py-20 sm:py-24">
        <div className="container-x">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
                <i className="fas fa-eye" aria-hidden />
              </span>
              <h2 className="mt-7 text-3xl font-bold text-ink-900 sm:text-[2.5rem]">Our vision</h2>
              <blockquote className="mt-7 border-l-2 border-brand-500 pl-7">
                <p className="text-xl italic leading-relaxed text-ink-600 sm:text-[1.4rem] text-pretty">
                  “{content?.vision}”
                </p>
              </blockquote>
              <Link to="/about/chairman" className="btn-dark mt-10">
                Chairman’s Message <i className="fas fa-arrow-right text-sm" aria-hidden />
              </Link>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative">
                <div className="absolute -right-5 -top-5 h-40 w-40 rounded-3xl border border-brand-500/25" aria-hidden />
                <SmartImage
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200"
                  alt="Expro Group team planning"
                  className="relative aspect-[4/3] rounded-3xl shadow-lift"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="relative overflow-hidden bg-ink-950 py-20 sm:py-24">
        <div className="absolute inset-0 bg-mesh-hero opacity-70" aria-hidden />
        <div className="container-x relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow-light justify-center">Our Mission</span>
              <h2 className="mt-5 text-3xl font-bold text-white sm:text-[2.5rem] text-balance">
                What we commit to, every day
              </h2>
            </div>
          </Reveal>

          {mission.length > 0 ? (
            <div className="mt-14 grid gap-5 sm:grid-cols-2">
              {mission.map((item, index) => (
                <Reveal key={`${item}-${index}`} delay={(index % 2) * 90}>
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur transition-colors duration-500 hover:border-brand-400/40 hover:bg-white/[0.08]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500/15 text-[13px] text-brand-400">
                      <i className="fas fa-check" aria-hidden />
                    </span>
                    <p className="text-[16px] font-medium leading-relaxed text-ink-100">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-14 text-center text-[15px] text-ink-400">
              Our mission statement is being updated.
            </p>
          )}
        </div>
      </section>

      <CtaBand
        title="Share our commitment"
        text="Whether as a partner, a customer or a member of our team — there is a place for you here."
      />
    </div>
  );
};
