import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { MediaItem } from '../types';

export const Media: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    backend.getMedia().then(setMedia);
  }, []);

  return (
    <div className="animate-fade-in-up">
       <div className="relative h-[350px] flex items-center justify-center bg-gray-900 text-white">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80')"}}></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-4 font-serif">Media & Gallery</h1>
          <p className="text-xl opacity-90">Capturing moments of our journey and success.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Filter / Tabs (Visual only for now) */}
        <div className="flex justify-center gap-4 mb-12">
           <button className="px-6 py-2 rounded-full bg-blue-600 text-white font-bold">All</button>
           <button className="px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold transition">Events</button>
           <button className="px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold transition">Press</button>
           <button className="px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold transition">Awards</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl shadow-lg aspect-w-4 aspect-h-3 h-80 cursor-pointer">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                   <span className="text-blue-400 font-bold uppercase text-xs tracking-wider mb-1">{item.type}</span>
                   <h3 className="text-white text-xl font-bold">{item.title}</h3>
                </div>
              </div>
            ))}
        </div>
        {media.length === 0 && <div className="text-center py-20 text-gray-400">Loading gallery...</div>}
      </div>
    </div>
  );
};