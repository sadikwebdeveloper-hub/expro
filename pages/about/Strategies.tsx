import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';

export const Strategies: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    backend.getAboutContent().then(setContent);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="relative h-[400px] flex items-center justify-center bg-gray-900 text-white" style={{backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80')", backgroundAttachment: 'fixed', backgroundSize: 'cover'}}>
        <div className="absolute inset-0 bg-blue-900/70"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-4 font-serif">Strategic Excellence</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Our roadmap to sustainable development and innovation.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
         <div className="max-w-4xl mx-auto">
            <h6 className="text-blue-600 font-bold uppercase tracking-widest mb-4">Core Principles</h6>
            <h2 className="text-4xl font-bold mb-8 text-gray-900 font-serif">{content?.introTitle}</h2>
            
            <div className="prose prose-lg text-gray-600 text-justify leading-relaxed whitespace-pre-line">
              {content?.introText}
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
               <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
                  <div className="text-4xl text-blue-600 mb-4"><i className="fas fa-chart-line"></i></div>
                  <h3 className="text-xl font-bold mb-2">Growth</h3>
                  <p className="text-sm text-gray-500">Consistent progress in industrial and commercial sectors.</p>
               </div>
               <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-600">
                  <div className="text-4xl text-green-600 mb-4"><i className="fas fa-users"></i></div>
                  <h3 className="text-xl font-bold mb-2">Human Capital</h3>
                  <p className="text-sm text-gray-500">Creating skilled manpower and valuing employees.</p>
               </div>
               <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-purple-600">
                  <div className="text-4xl text-purple-600 mb-4"><i className="fas fa-hand-holding-heart"></i></div>
                  <h3 className="text-xl font-bold mb-2">Responsibility</h3>
                  <p className="text-sm text-gray-500">Social welfare and national sustainable development.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};