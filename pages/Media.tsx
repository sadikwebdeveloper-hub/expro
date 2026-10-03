import React, { useEffect, useMemo, useState } from 'react';
import { backend } from '../services/backend';
import { MediaItem, NewsItem } from '../types';
import { PageHero, Reveal, CtaBand, SmartImage } from '../components/ui';

export const Media: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  useEffect(() => {
    let alive = true;
    backend.getMedia().then((d) => alive && setMedia(d));
    backend.getNews().then((d) => alive && setNews(d));
    return () => { alive = false; };
  }, []);

  // Filters are derived from the real data instead of a fixed, possibly-empty list.
  const filters = useMemo(
    () => ['All', ...Array.from(new Set(media.map((item) => item.type).filter(Boolean)))],
    [media]
  );

  const visible = useMemo(
    () => (filter === 'All' ? media : media.filter((item) => item.type === filter)),
    [media, filter]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  return (
    <div>
      <PageHero
        eyebrow="Newsroom"
        title="Media & gallery"
        subtitle="Moments from our journey — milestones, programmes and the people behind them."
        image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Media' }]}
      />

      {/* News */}
      {news.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="container-x">
            <Reveal>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <span className="eyebrow">Press &amp; Updates</span>
                  <h2 className="mt-4 text-3xl font-bold text-ink-900 sm:text-[2.4rem]">Latest news</h2>
                </div>
                <span className="hidden shrink-0 text-[13px] font-medium text-ink-400 sm:block">
                  {news.length} article{news.length === 1 ? '' : 's'}
                </span>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item, index) => (
                <Reveal key={item.id} delay={(index % 3) * 90}>
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
                      <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-500">{item.content}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="bg-ink-50/70 py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <span className="eyebrow">Visual Stories</span>
                <h2 className="mt-4 text-3xl font-bold text-ink-900 sm:text-[2.4rem]">Our gallery</h2>
              </div>

              {filters.length > 1 && (
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
                  {filters.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`shrink-0 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-300 ${
                        filter === item ? 'bg-ink-900 text-white shadow-soft' : 'bg-white text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {visible.length > 0 ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item, index) => (
                <Reveal key={item.id} delay={(index % 3) * 80}>
                  <button
                    type="button"
                    onClick={() => setLightbox(item)}
                    className="group relative block h-72 w-full overflow-hidden rounded-2xl text-left shadow-soft"
                  >
                    <SmartImage
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0"
                      imgClassName="h-full w-full object-cover transition-transform duration-[1100ms] group-hover:scale-110"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" aria-hidden />
                    <span className="absolute inset-x-0 bottom-0 p-6">
                      <span className="inline-block rounded-full bg-brand-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                        {item.type}
                      </span>
                      <span className="mt-3 block text-[17px] font-bold text-white">{item.title}</span>
                    </span>
                    <span className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
                      <i className="fas fa-expand" aria-hidden />
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-ink-900/15 bg-white py-24 text-center">
              <i className="fas fa-images text-3xl text-ink-300" aria-hidden />
              <p className="mt-4 text-[15px] text-ink-500">Gallery images are being added. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink-950/90 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.title} className="max-h-[78vh] w-full rounded-2xl object-contain" />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[17px] font-bold text-white">{lightbox.title}</p>
                <p className="text-[12.5px] text-ink-400">{lightbox.type}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Close"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <i className="fas fa-xmark" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}

      <CtaBand
        title="Working on a story about us?"
        text="Our communications team can arrange interviews, imagery and background briefings."
      />
    </div>
  );
};
