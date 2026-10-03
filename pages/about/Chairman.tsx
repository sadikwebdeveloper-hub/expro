import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';
import { Preloader } from '../../components/Preloader';
import { LeaderMessage } from './LeaderMessage';

export const Chairman: React.FC = () => {
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
      name={content.chairmanName}
      role="Founder & Chairman"
      message={content.chairmanMessage}
      image={content.chairmanImage}
      heroTitle="A message from our Chairman"
      heroSubtitle="On responsibility, people and building value that outlasts us."
      heroImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1600"
      related={[
        { label: 'MD’s Message', to: '/about/md' },
        { label: 'Coordinator’s Message', to: '/about/coordinator' },
        { label: 'Vision & Mission', to: '/about/vision' },
      ]}
    />
  );
};
