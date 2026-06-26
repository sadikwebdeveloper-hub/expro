import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';

export const MD: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    backend.getAboutContent().then(setContent);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="bg-gray-100 py-20">
         <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-12 gap-12 items-center">
               <div className="md:col-span-4 text-center">
                  <div className="w-64 h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto bg-gray-300 flex items-center justify-center">
                      {content?.mdImage ? (
                          <img src={content.mdImage} alt={content.mdName} className="w-full h-full object-cover" />
                      ) : (
                          <i className="fas fa-user-tie text-8xl text-gray-500"></i>
                      )}
                  </div>
                  <h1 className="text-3xl font-bold mt-8 font-serif text-gray-900">{content?.mdName}</h1>
                  <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-2">Managing Director</p>
               </div>
               <div className="md:col-span-8">
                  <div className="bg-white p-12 rounded-3xl shadow-xl relative">
                     <div className="absolute -left-4 top-10 w-8 h-8 bg-white transform rotate-45 hidden md:block"></div>
                     <i className="fas fa-quote-left text-5xl text-blue-100 mb-6 block"></i>
                     <h2 className="text-2xl font-bold mb-6 font-serif">Driving Innovation & Excellence</h2>
                     <div className="text-gray-600 text-lg leading-relaxed whitespace-pre-line text-justify">
                        {content?.mdMessage}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};