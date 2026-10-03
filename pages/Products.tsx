import React, { useEffect, useMemo, useState } from 'react';
import { backend } from '../services/backend';
import { Product } from '../types';
import { Preloader } from '../components/Preloader';
import { PageHero, Reveal, CtaBand, SmartImage } from '../components/ui';

export const Products: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let alive = true;
    backend.getProducts().then((data) => {
      if (!alive) return;
      setProducts(data);
      window.setTimeout(() => alive && setLoading(false), 700);
    });
    return () => { alive = false; };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesQuery = !q || product.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  if (loading) return <Preloader />;

  return (
    <div>
      <PageHero
        eyebrow="Catalogue"
        title="Products & services"
        subtitle="Quality-assured goods manufactured and distributed across our industrial sectors."
        image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-x">
          {/* Filters */}
          <Reveal>
            <div className="flex flex-col gap-5 rounded-2xl border border-ink-900/[0.07] bg-white p-5 shadow-soft lg:flex-row lg:items-center lg:justify-between">
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-300 ${
                      category === item
                        ? 'bg-ink-900 text-white shadow-soft'
                        : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="relative lg:w-72">
                <i className="fas fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[12px] text-ink-400" aria-hidden />
                <label htmlFor="product-search" className="sr-only">Search products</label>
                <input
                  id="product-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-full border border-ink-900/12 bg-white py-2.5 pl-11 pr-4 text-[14px] text-ink-900 placeholder:text-ink-300 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12"
                />
              </div>
            </div>
          </Reveal>

          <p className="mt-6 text-[13px] font-medium text-ink-400">
            Showing {filtered.length} of {products.length} products
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product, index) => (
                <Reveal key={product.id} delay={(index % 3) * 90}>
                  <article className="card card-hover group overflow-hidden">
                    <SmartImage
                      src={product.image}
                      alt={product.name}
                      className="relative h-64"
                      imgClassName="h-full w-full object-cover transition-transform duration-[1100ms] group-hover:scale-110"
                    />
                    <div className="p-7">
                      <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-700">
                        {product.category}
                      </span>
                      <h2 className="mt-4 text-[18px] font-bold text-ink-900 transition-colors group-hover:text-brand-600">
                        {product.name}
                      </h2>
                      <p className="mt-2.5 text-[14px] leading-relaxed text-ink-500">
                        High-quality {product.category.toLowerCase()} product, manufactured and quality-checked by Expro Group.
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-ink-900/15 bg-ink-50/60 py-24 text-center">
              <i className="fas fa-box-open text-3xl text-ink-300" aria-hidden />
              <p className="mt-4 text-[15px] text-ink-500">No products match your search.</p>
              <button
                type="button"
                onClick={() => { setQuery(''); setCategory('All'); }}
                className="btn-outline mt-6 !px-6 !py-2.5 text-[13.5px]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        title="Looking for something specific?"
        text="Tell us what you need and our commercial team will come back with availability and pricing."
      />
    </div>
  );
};
