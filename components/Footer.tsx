import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { backend } from '../services/backend';
import { SiteConfig, Company } from '../types';

export const Footer: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    backend.getConfig().then(setConfig);
    backend.getCompanies().then(data => setCompanies(data.slice(0, 5))); // Show top 5 companies
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: About */}
          <div>
             <img 
               src={config?.logoUrl || "https://nexalite-org.github.io/storage/logo.png"} 
               alt="Logo" 
               className="h-14 w-auto bg-white rounded p-2 mb-6"
               onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/180x50?text=EXPRO'}
             />
             <p className="text-sm leading-relaxed mb-6 opacity-80">
               {config?.footerText}
             </p>
             <div className="flex gap-4">
               {config?.facebookUrl && <a href={config.facebookUrl} className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition"><i className="fab fa-facebook-f"></i></a>}
               {config?.linkedinUrl && <a href={config.linkedinUrl} className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-blue-700 transition"><i className="fab fa-linkedin-in"></i></a>}
               {config?.youtubeUrl && <a href={config.youtubeUrl} className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center hover:bg-red-600 transition"><i className="fab fa-youtube"></i></a>}
             </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-serif">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition"><i className="fas fa-chevron-right mr-2 text-xs"></i>Home</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition"><i className="fas fa-chevron-right mr-2 text-xs"></i>About Us</Link></li>
              <li><Link to="/products" className="hover:text-blue-400 transition"><i className="fas fa-chevron-right mr-2 text-xs"></i>Products & Services</Link></li>
              <li><Link to="/media" className="hover:text-blue-400 transition"><i className="fas fa-chevron-right mr-2 text-xs"></i>News & Media</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition"><i className="fas fa-chevron-right mr-2 text-xs"></i>Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Companies */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-serif">Our Companies</h4>
            <ul className="space-y-3 text-sm">
              {companies.map(c => (
                 <li key={c.id}>
                    <Link to="/companies" className="hover:text-blue-400 transition flex items-center">
                       <i className={`fas ${c.icon} mr-2 text-xs opacity-60`}></i> {c.name}
                    </Link>
                 </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-serif">Contact Info</h4>
            <ul className="space-y-4 text-sm">
               <li className="flex items-start">
                 <i className="fas fa-map-marker-alt mt-1 mr-3 text-blue-500"></i>
                 <span>{config?.address}</span>
               </li>
               <li className="flex items-start">
                 <i className="fas fa-phone mt-1 mr-3 text-blue-500"></i>
                 <span>{config?.phone}</span>
               </li>
               <li className="flex items-start">
                 <i className="fas fa-envelope mt-1 mr-3 text-blue-500"></i>
                 <span>{config?.email}</span>
               </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Centered */}
        <div className="border-t border-gray-800 pt-8 flex flex-col items-center justify-center text-center text-xs opacity-60">
           <p className="mb-2">&copy; {new Date().getFullYear()} Expro Group. All Rights Reserved.</p>
           <div className="space-x-4">
              <span className="cursor-pointer hover:text-white">Privacy Policy</span>
              <span className="cursor-pointer hover:text-white">Terms of Use</span>
           </div>
        </div>
      </div>
    </footer>
  );
};