import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { AboutContent, SiteConfig } from '../types';
import { Preloader } from '../components/Preloader';

export const About: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AboutContent | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'chairman' | 'md' | 'coordinator'>('chairman');

  useEffect(() => {
    Promise.all([
        backend.getAboutContent().then(setContent),
        backend.getConfig().then(setConfig)
    ]).then(() => {
        setTimeout(() => setLoading(false), 800);
    });
  }, []);

  if (loading) return <Preloader />;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="relative h-[450px] flex items-center justify-center bg-gray-900 text-white" style={{backgroundImage: "url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80')", backgroundAttachment: 'fixed', backgroundSize: 'cover'}}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-blue-900/60"></div>
        <div className="relative z-10 text-center container mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 font-serif">About Expro Group</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">Development, Transparency, and Quality of Service.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 space-y-24">
        
        {/* Strategies Section */}
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="relative">
             <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full z-0"></div>
             <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80" alt="Strategy" className="relative z-10 rounded-2xl shadow-2xl w-full" />
             <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-xl shadow-xl z-20 hidden md:block">
               <h4 className="font-bold text-2xl">Expro<br/>Strategies</h4>
             </div>
          </div>
          <div>
            <h6 className="text-blue-600 font-bold uppercase tracking-widest mb-4">Our Foundation</h6>
            <h2 className="text-4xl font-bold mb-8 text-gray-900">{content?.introTitle}</h2>
            <p className="text-gray-600 leading-8 text-lg text-justify whitespace-pre-line border-l-4 border-blue-500 pl-6">
              {content?.introText}
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="bg-gray-50 rounded-3xl p-10 shadow-inner">
           <div className="text-center mb-12">
             <h6 className="text-blue-600 font-bold uppercase tracking-widest mb-2">Our Goal</h6>
             <h2 className="text-4xl font-bold">Vision & Mission</h2>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1 bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-6">
                  <i className="fas fa-eye"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">Vision</h3>
                <p className="text-gray-600 leading-relaxed italic">"{content?.vision}"</p>
              </div>
              
              <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-600">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <h3 className="text-2xl font-bold">Mission</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {content?.mission?.map((m, i) => (
                    <div key={i} className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-3 text-lg"></i>
                      <span className="text-gray-700">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>

        {/* Leadership Messages Tabbed */}
        <div>
          <h2 className="text-4xl font-bold text-center mb-12">Leadership Messages</h2>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={() => setActiveTab('chairman')}
              className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'chairman' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Chairman
            </button>
            <button 
              onClick={() => setActiveTab('md')}
              className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'md' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Managing Director
            </button>
            <button 
              onClick={() => setActiveTab('coordinator')}
              className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'coordinator' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Coordinator
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {activeTab === 'chairman' && (
              <div className="grid md:grid-cols-12 gap-0 animate-fade-in-up">
                <div className="md:col-span-4 bg-gray-900 text-white p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-no-repeat bg-cover" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl mb-6 relative z-10">
                    <img src={content?.chairmanImage || "https://nexalite-org.github.io/storage/founder.png"} alt="Chairman" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif">{content?.chairmanName}</h3>
                  <p className="text-blue-400 font-bold uppercase text-sm tracking-wider mt-2">Founder & Chairman</p>
                </div>
                <div className="md:col-span-8 p-12 bg-white">
                  <i className="fas fa-quote-left text-5xl text-blue-100 mb-6 block"></i>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Message from the Chairman</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-line text-lg">
                    {content?.chairmanMessage}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'md' && (
              <div className="grid md:grid-cols-12 gap-0 animate-fade-in-up">
                <div className="md:col-span-4 bg-gray-900 text-white p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl mb-6 bg-gray-800 flex items-center justify-center">
                     {content?.mdImage ? (
                        <img src={content.mdImage} alt="MD" className="w-full h-full object-cover" />
                     ) : (
                        <i className="fas fa-user-tie text-6xl text-gray-600"></i>
                     )}
                  </div>
                  <h3 className="text-2xl font-bold font-serif">{content?.mdName}</h3>
                  <p className="text-blue-400 font-bold uppercase text-sm tracking-wider mt-2">Managing Director</p>
                </div>
                <div className="md:col-span-8 p-12 bg-white">
                  <i className="fas fa-quote-left text-5xl text-blue-100 mb-6 block"></i>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Message from the Managing Director</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-line text-lg">
                    {content?.mdMessage}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'coordinator' && (
              <div className="grid md:grid-cols-12 gap-0 animate-fade-in-up">
                <div className="md:col-span-4 bg-gray-900 text-white p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl mb-6 bg-gray-800 flex items-center justify-center">
                     {content?.coordinatorImage ? (
                        <img src={content.coordinatorImage} alt="Coordinator" className="w-full h-full object-cover" />
                     ) : (
                        <i className="fas fa-user-clock text-6xl text-gray-600"></i>
                     )}
                  </div>
                  <h3 className="text-2xl font-bold font-serif">{content?.coordinatorName}</h3>
                  <p className="text-blue-400 font-bold uppercase text-sm tracking-wider mt-2">Coordinator</p>
                </div>
                <div className="md:col-span-8 p-12 bg-white">
                  <i className="fas fa-quote-left text-5xl text-blue-100 mb-6 block"></i>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Message from the Coordinator</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4 whitespace-pre-line text-lg">
                    {content?.coordinatorMessage}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};