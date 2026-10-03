import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';
import { Preloader } from '../../components/Preloader';
import { LeaderMessage } from './LeaderMessage';

export const Coordinator: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    backend.getAboutContent().then((c) => {
      if (!alive) return;
      setContent(c);
      window.setTimeout(() => alive && setLoading(false), 400);
    });
    return () => { alive = false; };
  }, []);

  if (loading || !content) return <Preloader />;

  return (
    <LeaderMessage
      name={content.coordinatorName}
      role="Coordinator"
      message={content.coordinatorMessage}
      image={content.coordinatorImage}
      heroTitle="A message from our Coordinator"
      heroSubtitle="Where strategy meets the ground — implementation, people and follow-through."
      heroImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1600"
      related={[
        { label: 'Chairman’s Message', to: '/about/chairman' },
        { label: 'MD’s Message', to: '/about/md' },
        { label: 'Vision & Mission', to: '/about/vision' },
      ]}
    />
  );
};
