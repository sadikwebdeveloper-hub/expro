import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { backend } from '../services/backend';
import { SiteConfig } from '../types';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const location = useLocation();

  useEffect(() => {
    backend.getConfig().then(setConfig);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const aboutSubLinks = [
    { name: 'Strategies', path: '/about/strategies' },
    { name: 'Vision & Mission', path: '/about/vision' },
    { name: 'Chairman Message', path: '/about/chairman' },
    { name: 'MD Message', path: '/about/md' },
    { name: 'Coordinator Message', path: '/about/coordinator' },
  ];

  const mainLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Companies', path: '/companies' },
    { name: 'Products', path: '/products' },
    { name: 'Media', path: '/media' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAboutActive = location.pathname.startsWith('/about');

  return (
    <>
      {/* Top Bar */}
      <div className={`bg-gray-900 text-white py-2 text-sm transition-all duration-300 ${isScrolled ? '-mt-10 opacity-0 hidden md:block' : 'block'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-4">
            {config && (
              <>
                <span><i className="fas fa-phone-alt me-2 text-blue-500"></i>{config.phone}</span>
                <span className="hidden md:inline"><i className="fas fa-envelope me-2 text-blue-500"></i>{config.email}</span>
              </>
            )}
          </div>
          <div className="flex gap-4">
            {config && (
              <>
                {config.facebookUrl && <a href={config.facebookUrl} className="hover:text-blue-400 transition" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>}
                {config.linkedinUrl && <a href={config.linkedinUrl} className="hover:text-blue-400 transition" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>}
                {config.youtubeUrl && <a href={config.youtubeUrl} className="hover:text-red-500 transition" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'top-0 py-2 shadow-lg glass-nav' : 'top-[35px] py-4 glass-nav'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src={config?.logoUrl || "https://nexalite-org.github.io/storage/logo.png"} 
              alt="EXPRO GROUP" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://placehold.co/200x60?text=EXPRO+GROUP';
              }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/" 
              className={`font-medium transition-colors hover:text-blue-600 ${isActive('/') ? 'text-blue-600' : 'text-gray-800'}`}
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsAboutDropdownOpen(true)}
              onMouseLeave={() => setIsAboutDropdownOpen(false)}
            >
              <button className={`flex items-center font-medium transition-colors hover:text-blue-600 ${isAboutActive ? 'text-blue-600' : 'text-gray-800'}`}>
                About Us <i className="fas fa-chevron-down ml-1 text-xs"></i>
              </button>
              
              <div className={`absolute top-full left-0 w-64 bg-white shadow-xl rounded-b-lg border-t-2 border-blue-600 transition-all duration-300 transform origin-top ${isAboutDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="py-2">
                  {aboutSubLinks.map((sub) => (
                    <Link 
                      key={sub.path} 
                      to={sub.path}
                      className={`block px-6 py-3 text-sm hover:bg-gray-50 hover:text-blue-600 transition-colors ${isActive(sub.path) ? 'text-blue-600 font-bold bg-gray-50' : 'text-gray-700'}`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {mainLinks.slice(1).map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`font-medium transition-colors hover:text-blue-600 ${isActive(link.path) ? 'text-blue-600' : 'text-gray-800'}`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Desktop Social Links */}
             <div className="hidden xl:flex items-center gap-3 border-l pl-4 border-gray-300">
                {config?.facebookUrl && <a href={config.facebookUrl} className="text-gray-500 hover:text-blue-600" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>}
                {config?.linkedinUrl && <a href={config.linkedinUrl} className="text-gray-500 hover:text-blue-600" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>}
                {config?.youtubeUrl && <a href={config.youtubeUrl} className="text-gray-500 hover:text-red-500" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>}
             </div>

            <Link 
              to="/contact" 
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/40"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden text-gray-800 text-2xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t mt-2 p-4 shadow-xl max-h-[80vh] overflow-y-auto flex flex-col">
            <Link to="/" className="block py-3 text-gray-800 border-b hover:text-blue-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            
            {/* Mobile About Dropdown */}
            <div className="border-b">
              <button 
                onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                className="w-full flex justify-between items-center py-3 text-gray-800 font-medium hover:text-blue-600"
              >
                About Us <i className={`fas fa-chevron-down transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              {isAboutDropdownOpen && (
                <div className="bg-gray-50 pl-6 pb-2">
                   {aboutSubLinks.map((sub) => (
                    <Link 
                      key={sub.path} 
                      to={sub.path}
                      className="block py-2 text-gray-600 hover:text-blue-600 text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {mainLinks.slice(1).map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className="block py-3 text-gray-800 border-b hover:text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/contact" 
              className="block mt-4 text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>

            {/* Mobile Social Links */}
             <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
               {config?.facebookUrl && <a href={config.facebookUrl} className="text-gray-500 hover:text-blue-600 text-xl" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>}
               {config?.linkedinUrl && <a href={config.linkedinUrl} className="text-gray-500 hover:text-blue-600 text-xl" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>}
               {config?.youtubeUrl && <a href={config.youtubeUrl} className="text-gray-500 hover:text-red-500 text-xl" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>}
             </div>
          </div>
        )}
      </nav>
    </>
  );
};