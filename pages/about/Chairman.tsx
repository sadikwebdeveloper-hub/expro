import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';

export const Chairman: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    backend.getAboutContent().then(setContent);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="relative h-[500px] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-blue-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>
        <div className="relative z-10 text-center px-4">
           <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl mx-auto mb-8">
               <img 
                 src={content?.chairmanImage || "https://nexalite-org.github.io/storage/founder.png"} 
                 alt="Chairman" 
                 className="w-full h-full object-cover" 
               />
           </div>
           <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif">{content?.chairmanName}</h1>
           <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">Founder & Chairman</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
         <div className="max-w-4xl mx-auto bg-white -mt-32 relative z-20 p-12 rounded-3xl shadow-2xl border-t-8 border-blue-600">
            <i className="fas fa-quote-left text-6xl text-blue-100 mb-8 block"></i>
            <h2 className="text-3xl font-bold mb-8 font-serif border-b pb-4">Message from the Chairman</h2>
            <div className="text-gray-600 text-lg leading-relaxed whitespace-pre-line text-justify">
               {content?.chairmanMessage}
            </div>
            <div className="mt-12 text-right">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" alt="Signature" className="h-16 ml-auto opacity-60" />
               <p className="font-bold text-gray-900 mt-2">{content?.chairmanName}</p>
               <p className="text-sm text-gray-500">Chairman, Expro Group</p>
            </div>
         </div>
      </div>
    </div>
  );
};