import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { Company } from '../types';
import { Preloader } from '../components/Preloader';

export const Companies: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    backend.getCompanies().then(data => {
        setCompanies(data);
        setTimeout(() => setLoading(false), 800);
    });
  }, []);

  if (loading) return <Preloader />;

  return (
    <div className="animate-fade-in-up">
       <div className="relative h-[400px] flex items-center justify-center bg-gray-900 text-white" style={{backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')", backgroundAttachment: 'fixed', backgroundSize: 'cover'}}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-4 font-serif">Our Companies</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">A synergy of diverse entities working towards a sustainable future.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <div key={company.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col items-start h-full group">
                {/* Logo or Icon Display */}
                <div className="h-20 mb-6 flex items-center">
                    {company.image ? (
                        <img src={company.image} alt={company.name} className="h-full w-auto object-contain max-w-[200px]" />
                    ) : (
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-3">
                            <i className={`fas ${company.icon}`}></i>
                        </div>
                    )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition">{company.name}</h3>
                <p className="text-gray-600 flex-grow leading-relaxed">{company.description}</p>
                <div className="mt-6 pt-6 border-t w-full">
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center cursor-pointer hover:underline">
                    View Profile <i className="fas fa-arrow-right ml-2 text-xs"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
          {companies.length === 0 && <div className="text-center py-20 text-gray-400">Loading ecosystem...</div>}
      </div>

      <div className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-3xl font-bold mb-6">Interested in doing business with us?</h2>
           <p className="mb-8 text-gray-600 max-w-2xl mx-auto">We are always open to new partnerships and opportunities that align with our vision of development and quality service.</p>
           <a href="/#/contact" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">Contact Business Development</a>
        </div>
      </div>
    </div>
  );
};