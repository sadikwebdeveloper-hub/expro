import React, { useEffect, useState } from 'react';

const FALLBACK_LOGO = 'https://nexalite-org.github.io/storage/logo.png';

export const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 14));
    }, 140);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-ink-950"
      role="status"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-mesh-hero opacity-70" aria-hidden />

      <div className="relative flex flex-col items-center">
        <div className="relative grid h-32 w-32 place-items-center">
          <span className="absolute inset-0 rounded-full border border-brand-500/20" aria-hidden />
          <span className="absolute inset-0 animate-spin-slow rounded-full border-t-2 border-brand-400" aria-hidden />
          <span className="absolute inset-3 rounded-full border border-white/[0.07]" aria-hidden />
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-lift">
            <img
              src={FALLBACK_LOGO}
              alt="Expro Group"
              className="h-11 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO; }}
            />
          </div>
        </div>

        <div className="mt-10 h-[3px] w-52 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-300 ease-out"
            style={{ width: `${Math.min(progress, 96)}%` }}
          />
        </div>

        <p className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.32em] text-ink-400">
          Loading Experience
        </p>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
};
