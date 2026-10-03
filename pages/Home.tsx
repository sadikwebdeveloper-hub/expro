import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../services/backend';
import {
  Achievement,
  Product,
  NewsItem,
  HeroSlide,
  AboutContent,
  Company,
  Partner,
  ServiceCard,
  Director,
} from '../types';
import { Reveal, SectionHeading, CountUp, CtaBand, SmartImage } from '../components/ui';

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
const Hero: React.FC<{ slides: HeroSlide[] }> = ({ slides }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = window.setInterval(() => setCurrent((p) => (p + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <section
      className="relative -mt-[76px] flex min-h-[88svh] items-center overflow-hidden bg-ink-950 pt-[76px] lg:min-h-[100svh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured highlights"
    >
      {/* Slides */}
      {slides.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== current}
        >
          {/*
            The scale lives in the keyframe, not an inline style. An inline
            `transform` is overwritten by the animation, which previously dropped
            the cover scale on the active slide. Scale starts above 1 so the
            translate never exposes an uncovered edge.
          */}
          <div
            className={`absolute inset-0 bg-cover bg-center ${index === current ? 'animate-kenburns' : ''}`}
            style={{ backgroundImage: `url(${item.image})` }}
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/25" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/60" aria-hidden />
      <div className="absolute inset-0 bg-mesh-hero opacity-40 mix-blend-screen" aria-hidden />

      <div className="container-x relative z-10 w-full py-14 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <span
            key={`eyebrow-${slide.id}`}
            className="eyebrow-light animate-fade-in-up"
            style={{ animationDelay: '80ms', opacity: 0 }}
          >
            {slide.subtitle}
          </span>

          <h1
            key={`title-${slide.id}`}
            className="mt-6 font-extrabold leading-[1.08] text-white animate-fade-in-up text-balance text-[clamp(2rem,1.4rem+3.2vw,4.4rem)]"
            style={{ animationDelay: '180ms', opacity: 0 }}
          >
            {slide.title}
          </h1>

          <p
            key={`desc-${slide.id}`}
            className="mt-6 max-w-[min(100%,36rem)] text-[16px] leading-relaxed text-ink-200 sm:mt-7 sm:text-lg animate-fade-in-up text-pretty"
            style={{ animationDelay: '300ms', opacity: 0 }}
          >
            {slide.description}
          </p>

          <div
            key={`cta-${slide.id}`}
            className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4 animate-fade-in-up"
            style={{ animationDelay: '420ms', opacity: 0 }}
          >
            <Link to={slide.link || '/about'} className="btn-primary">
              {slide.buttonText || 'Discover More'} <i className="fas fa-arrow-right text-sm" aria-hidden />
            </Link>
            <Link to="/contact" className="btn-ghost-light">
              Talk to Our Team
            </Link>
          </div>
        </div>

        {/* Controls */}
        {slides.length > 1 && (
          <div className="mt-10 flex items-center gap-5 sm:mt-14">
            <div className="flex items-center gap-2.5">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === current}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === current ? 'w-11 bg-brand-400' : 'w-5 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
            <span className="text-[13px] font-semibold tabular-nums text-ink-300">
              {String(current + 1).padStart(2, '0')}
              <span className="mx-1 text-ink-600">/</span>
              {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-ink-400">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-brand-400/80 to-transparent" aria-hidden />
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Service cards (overlapping the hero)                                */
/* ------------------------------------------------------------------ */
const ServiceStrip: React.FC<{ services: ServiceCard[] }> = ({ services }) => {
  if (services.length === 0) return null;
  return (
    <section className="container-x relative z-20 -mt-20">
      <div className="grid gap-5 md:grid-cols-3">
        {services.slice(0, 3).map((service, index) => (
          <Reveal key={service.id} delay={index * 110}>
            <div className="card card-hover group h-full p-8">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-xl text-brand-600 transition-all duration-500 group-hover:scale-105 group-hover:bg-brand-500 group-hover:text-white">
                <i className={`fas ${service.icon}`} aria-hidden />
              </span>
              <h3 className="mt-6 text-lg font-bold text-ink-900">{service.title}</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">{service.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-brand-600">
                Learn more
                <i className="fas fa-arrow-right text-[10px] transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */
export const Home: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [s, a, sv, ach, c, p, n, d, pt] = await Promise.all([
        backend.getSlides(),
        backend.getAboutContent(),
        backend.getServiceCards(),
        backend.getAchievements(),
        backend.getCompanies(),
        backend.getProducts(),
        backend.getNews(),
        backend.getDirectors(),
        backend.getPartners(),
      ]);
      if (!alive) return;
      setSlides(s); setAbout(a); setServices(sv); setAchievements(ach);
      setCompanies(c); setProducts(p); setNews(n); setDirectors(d); setPartners(pt);
    };
    load();
    return () => { alive = false; };
  }, []);


  const marqueeItems = partners.length > 0 ? partners : [];

  return (
    <div className="overflow-x-hidden">
      <Hero slides={slides} />

      <ServiceStrip services={services} />

      {/* ---------- Who we are ---------- */}
      {about && (
        <section className="py-24 sm:py-28">
          <div className="container-x">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
              <Reveal>
                <div className="relative">
                  <div className="absolute -left-5 -top-5 h-40 w-40 rounded-3xl border border-brand-500/25" aria-hidden />
                  <SmartImage
                    src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80&w=1200"
                    alt="Expro Group operations"
                    className="relative aspect-[4/3] rounded-3xl shadow-lift"
                    imgClassName="h-full w-full object-cover"
                  />
                  {/*
                    The offset must stay smaller than .container-x's padding at every
                    breakpoint (px-5 / sm:px-6 / lg:px-8), otherwise this badge pokes
                    past the viewport edge and creates a horizontal scrollbar.
                  */}
                  <div className="absolute -bottom-8 -right-2 rounded-2xl bg-ink-900 px-7 py-6 text-white shadow-lift sm:-right-4 lg:-right-6">
                    <p className="text-3xl font-extrabold text-brand-400">25+</p>
                    <p className="mt-1 text-[12.5px] uppercase tracking-[0.16em] text-ink-300">Years of Excellence</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <span className="eyebrow">Who We Are</span>
                <h2 className="mt-5 text-3xl font-bold leading-[1.15] text-ink-900 sm:text-[2.6rem] text-balance">
                  Building a sustainable future, together
                </h2>
                <p className="mt-6 text-[16px] leading-relaxed text-ink-500 text-pretty">
                  {about.introText
                    ? `${about.introText.split('\n')[0].slice(0, 320)}${about.introText.length > 320 ? '…' : ''}`
                    : 'We are committed to excellence across every sector we touch.'}
                </p>

                <ul className="mt-8 space-y-4">
                  {['Commitment to quality', 'Sustainable by design', 'Held to global standards'].map((point, index) => (
                    <li key={point} className="flex items-center gap-3.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500/12 text-[11px] text-brand-600">
                        <i className="fas fa-check" aria-hidden />
                      </span>
                      <span className="text-[15px] font-semibold text-ink-700">{point}</span>
                      {index === 0 && <span className="ml-auto hidden sm:block" aria-hidden />}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link to="/about/strategies" className="btn-dark">
                    Our Approach <i className="fas fa-arrow-right text-sm" aria-hidden />
                  </Link>
                  <Link to="/about/vision" className="btn-outline">
                    Vision &amp; Mission
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Chairman ---------- */}
      {about && (
        <section className="relative overflow-hidden bg-ink-50/70 py-24 sm:py-28">
          <div className="absolute inset-0 section-grid opacity-60" aria-hidden />
          <div className="container-x relative">
            <Reveal>
              <div className="overflow-hidden rounded-[2rem] border border-ink-900/[0.07] bg-white shadow-lift">
                <div className="grid lg:grid-cols-12">
                  <div className="relative flex flex-col items-center justify-center gap-5 bg-ink-950 px-8 py-14 text-center lg:col-span-4">
                    <div className="absolute inset-0 bg-mesh-hero opacity-60" aria-hidden />
                    <div className="relative h-44 w-44 overflow-hidden rounded-full ring-4 ring-brand-500/30">
                      <img
                        src={about.chairmanImage || 'https://nexalite-org.github.io/storage/founder.png'}
                        alt={about.chairmanName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="relative">
                      <h3 className="text-xl font-bold text-white">{about.chairmanName}</h3>
                      <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400">
                        Founder &amp; Chairman
                      </p>
                    </div>
                  </div>

                  <div className="px-8 py-14 sm:px-12 lg:col-span-8">
                    <i className="fas fa-quote-left text-3xl text-brand-500/25" aria-hidden />
                    <h2 className="mt-5 text-2xl font-bold text-ink-900 sm:text-[2rem]">A message from our leadership</h2>
                    <p className="mt-6 text-[16.5px] italic leading-relaxed text-ink-600 text-pretty">
                      “{about.chairmanMessage}”
                    </p>
                    <Link
                      to="/about/chairman"
                      className="group mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-brand-600"
                    >
                      Read the full message
                      <i className="fas fa-arrow-right text-[11px] transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- Impact areas ---------- */}
      {services.length > 0 && (
        <section className="py-24 sm:py-28">
          <div className="container-x">
            <Reveal>
              <SectionHeading
                eyebrow="What We Do"
                title="Our impact areas"
                subtitle="Programmes and business lines where Expro Group creates measurable, lasting value."
              />
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.id} delay={index * 90}>
                  <article className="card card-hover group relative h-full overflow-hidden p-8">
                    <span className="absolute right-6 top-6 text-5xl font-extrabold text-ink-900/[0.04]" aria-hidden>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-900 text-lg text-brand-400 transition-colors duration-500 group-hover:bg-brand-500 group-hover:text-white">
                      <i className={`fas ${service.icon}`} aria-hidden />
                    </span>
                    <h3 className="mt-6 text-lg font-bold text-ink-900">{service.title}</h3>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">{service.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Statistics ---------- */}
      {achievements.length > 0 && (
        <section className="relative overflow-hidden bg-ink-950 py-24">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600')" }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-mesh-hero opacity-70" aria-hidden />
          <div className="container-x relative">
            <Reveal>
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
                {achievements.map((achievement) => {
                  const raw = achievement.title || '';
                  const valuePart = raw.match(/[\d,]+\s*\S*/)?.[0] ?? raw;
                  const labelPart = raw.replace(valuePart, '').trim();
                  return (
                    <div key={achievement.id} className="text-center">
                      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur">
                        {achievement.image ? (
                          <img src={achievement.image} alt="" className="h-7 w-7 object-contain brightness-0 invert" />
                        ) : (
                          <i className="fas fa-trophy text-xl text-gold-400" aria-hidden />
                        )}
                      </span>
                      <p className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        <CountUp target={valuePart} />
                      </p>
                      <p className="mt-2 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-300">
                        {labelPart || 'Milestones'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- Companies ---------- */}
      <section className="py-24 sm:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              eyebrow="Our Ecosystem"
              title="Companies & subsidiaries"
              subtitle="A diversified portfolio working toward one goal: sustainable national progress."
            />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.slice(0, 6).map((company, index) => (
              <Reveal key={company.id} delay={index * 80}>
                <article className="card card-hover group h-full p-8">
                  <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-ink-50 text-xl text-ink-600 transition-colors duration-500 group-hover:bg-brand-500 group-hover:text-white">
                    {company.image ? (
                      <img src={company.image} alt="" className="h-9 w-9 object-contain" />
                    ) : (
                      <i className={`fas ${company.icon || 'fa-building'}`} aria-hidden />
                    )}
                  </span>
                  <h3 className="mt-6 text-[17px] font-bold text-ink-900 transition-colors group-hover:text-brand-600">
                    {company.name}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-500">{company.description}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 text-center">
              <Link to="/companies" className="btn-outline">
                View all subsidiaries <i className="fas fa-arrow-right text-sm" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Products ---------- */}
      {products.length > 0 && (
        <section className="bg-ink-50/70 py-24 sm:py-28">
          <div className="container-x">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                <SectionHeading
                  align="left"
                  eyebrow="What We Offer"
                  title="Featured products"
                />
                <Link to="/products" className="group inline-flex shrink-0 items-center gap-2 text-[14px] font-bold text-brand-600">
                  View full catalogue
                  <i className="fas fa-arrow-right text-[11px] transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {products.slice(0, 3).map((product, index) => (
                <Reveal key={product.id} delay={index * 90}>
                  <article className="group relative h-[26rem] overflow-hidden rounded-2xl shadow-soft">
                    <SmartImage
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0"
                      imgClassName="h-full w-full object-cover transition-transform duration-[1100ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 p-7">
                      <span className="inline-block rounded-full bg-brand-500/90 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white">
                        {product.category}
                      </span>
                      <h3 className="mt-3.5 text-xl font-bold text-white">{product.name}</h3>
                      <p className="mt-2 max-h-0 overflow-hidden text-[13.5px] leading-relaxed text-ink-200 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                        Premium quality, manufactured to international standards by Expro Group.
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Leadership ---------- */}
      {directors.length > 0 && (
        <section className="py-24 sm:py-28">
          <div className="container-x">
            <Reveal>
              <SectionHeading eyebrow="Leadership" title="Board of directors" />
            </Reveal>

            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {directors.map((director, index) => (
                <Reveal key={director.id} delay={index * 90}>
                  <figure className="group text-center">
                    <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-full ring-1 ring-ink-900/[0.08] ring-offset-4 ring-offset-white transition-all duration-500 group-hover:ring-brand-500/40">
                      <img
                        src={director.image || 'https://placehold.co/320x320/06192F/10B981?text=Expro'}
                        alt={director.name}
                        className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 grid place-items-center bg-ink-950/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Link to="/about" className="rounded-full border border-white/70 px-5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-white hover:text-ink-900">
                          View profile
                        </Link>
                      </div>
                    </div>
                    <figcaption className="mt-6">
                      <h3 className="text-[17px] font-bold text-ink-900 transition-colors group-hover:text-brand-600">
                        {director.name}
                      </h3>
                      <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                        {director.position}
                      </p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- News ---------- */}
      {news.length > 0 && (
        <section className="bg-ink-50/70 py-24 sm:py-28">
          <div className="container-x">
            <Reveal>
              <SectionHeading eyebrow="Press Room" title="Latest news & events" />
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {news.slice(0, 3).map((item, index) => (
                <Reveal key={item.id} delay={index * 90}>
                  <article className="card card-hover group flex h-full flex-col overflow-hidden">
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      className="relative h-52 shrink-0"
                      imgClassName="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                    <div className="flex flex-1 flex-col p-7">
                      <time className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-brand-600">{item.date}</time>
                      <h3 className="mt-3 text-[17px] font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-600">
                        {item.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 flex-1 text-[14px] leading-relaxed text-ink-500">{item.content}</p>
                      <Link to="/media" className="group/link mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-brand-600">
                        Read the story
                        <i className="fas fa-arrow-right text-[10px] transition-transform group-hover/link:translate-x-1" aria-hidden />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Partners marquee ---------- */}
      {marqueeItems.length > 0 && (
        <section className="border-y border-ink-900/[0.06] py-14">
          <div className="container-x">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.24em] text-ink-400">
              Trusted by partners &amp; clients
            </p>
          </div>
          <div className="mask-fade-x mt-9 overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-16">
              {[...marqueeItems, ...marqueeItems].map((partner, index) => (
                <img
                  key={`${partner.id}-${index}`}
                  src={partner.logo}
                  alt={partner.name}
                  title={partner.name}
                  className="h-11 w-auto object-contain opacity-45 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </div>
  );
};
