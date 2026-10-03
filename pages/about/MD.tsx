import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';
import { LeaderMessage } from './LeaderMessage';

export const MD: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    let alive = true;
    backend.getAboutContent().then((c) => {
      if (!alive) return;
      setContent(c);
    });
    return () => { alive = false; };
  }, []);

  return (
    <LeaderMessage
      name={content?.mdName ?? ""}
      role="Managing Director"
      message={content?.mdMessage ?? ""}
      image={content?.mdImage ?? ""}
      heroTitle="A message from our Managing Director"
      heroSubtitle="Turning long-term vision into operations that deliver, every quarter."
      heroImage="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1600"
      related={[
        { label: 'Chairman’s Message', to: '/about/chairman' },
        { label: 'Coordinator’s Message', to: '/about/coordinator' },
        { label: 'Our Strategies', to: '/about/strategies' },
      ]}
    />
  );
};
