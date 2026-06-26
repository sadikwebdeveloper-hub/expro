import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';

export const Coordinator: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    backend.getAboutContent().then(setContent);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white py-20">
         <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-blue-50 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
                   <div className="flex-shrink-0 text-center md:text-left">
                       <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center mb-6 mx-auto md:mx-0">
                           {content?.coordinatorImage ? (
                               <img src={content.coordinatorImage} alt={content.coordinatorName} className="w-full h-full object-cover" />
                           ) : (
                               <i className="fas fa-user-clock text-6xl text-gray-500"></i>
                           )}
                       </div>
                       <h2 className="text-2xl font-bold font-serif text-gray-900">{content?.coordinatorName}</h2>
                       <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">Coordinator</p>
                   </div>
                   
                   <div className="flex-grow">
                      <h3 className="text-3xl font-bold mb-8 font-serif text-blue-900">Coordinating Success</h3>
                      <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line text-justify">
                         {content?.coordinatorMessage}
                      </div>
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};