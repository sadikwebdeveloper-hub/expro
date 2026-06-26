import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent } from '../../types';

export const Vision: React.FC = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    backend.getAboutContent().then(setContent);
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="relative h-[400px] flex items-center justify-center bg-gray-900 text-white" style={{backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80')", backgroundAttachment: 'fixed', backgroundSize: 'cover'}}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-4 font-serif">Vision & Mission</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">Defining our purpose and future aspirations.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
         <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 md:order-1">
               <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6">
                  <i className="fas fa-eye"></i>
               </div>
               <h2 className="text-4xl font-bold mb-6 font-serif">Our Vision</h2>
               <p className="text-xl text-gray-600 leading-relaxed italic border-l-4 border-blue-600 pl-6">
                 "{content?.vision}"
               </p>
            </div>
            <div className="order-1 md:order-2">
               <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80" className="rounded-2xl shadow-2xl w-full" alt="Vision" />
            </div>
         </div>

         <div className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
               <div className="inline-block p-4 rounded-full bg-green-100 text-green-600 text-4xl mb-4"><i className="fas fa-bullseye"></i></div>
               <h2 className="text-4xl font-bold font-serif">Our Mission</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               {content?.mission?.map((item, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-xl shadow-md flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-4 text-xl flex-shrink-0"></i>
                    <p className="text-gray-700 font-medium leading-relaxed">{item}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};