import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../services/backend';
import { Company } from '../types';
import { Preloader } from '../components/Preloader';
import { PageHero, Reveal, CtaBand } from '../components/ui';

export const Companies: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    let alive = true;
    backend.getCompanies().then((data) => {
      if (!alive) return;
      setCompanies(data);
      window.setTimeout(() => alive && setLoading(false), 700);
    });
    return () => { alive = false; };
  }, []);

  if (loading) return <Preloader />;

  return (
    <div>
      <PageHero
        eyebrow="Our Portfolio"
        title="Companies & subsidiaries"
        subtitle="A synergy of diverse entities, each specialised — all moving toward the same sustainable future."
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Our Companies' }]}
      />

      <section className="py-20 sm:py-24">
        <div className="container-x">
          {companies.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company, index) => (
                <Reveal key={company.id} delay={(index % 3) * 90}>
                  <article className="card card-hover group flex h-full flex-col p-8">
                    <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-ink-50 text-2xl text-ink-600 transition-all duration-500 group-hover:bg-brand-500 group-hover:text-white">
                      {company.image ? (
                        <img src={company.image} alt="" className="h-12 w-12 object-contain" />
                      ) : (
                        <i className={`fas ${company.icon || 'fa-building'}`} aria-hidden />
                      )}
                    </span>

                    <h2 className="mt-7 text-xl font-bold text-ink-900 transition-colors group-hover:text-brand-600">
                      {company.name}
                    </h2>
                    <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-500">{company.description}</p>

                    <div className="mt-7 border-t border-ink-900/[0.07] pt-5">
                      <Link
                        to="/contact"
                        className="group/link inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-600"
                      >
                        Enquire
                        <i className="fas fa-arrow-right text-[10px] transition-transform group-hover/link:translate-x-1" aria-hidden />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-ink-900/15 bg-ink-50/60 py-24 text-center">
              <i className="fas fa-building text-3xl text-ink-300" aria-hidden />
              <p className="mt-4 text-[15px] text-ink-500">Our portfolio is being updated. Please check back soon.</p>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        title="Interested in doing business with us?"
        text="We are open to partnerships that align with our vision of development and quality service."
      />
    </div>
  );
};
