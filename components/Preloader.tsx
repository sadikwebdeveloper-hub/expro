import React from 'react';

export const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-700">
      <div className="relative">
        {/* Animated Circles */}
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping opacity-50 delay-150"></div>
        
        {/* Logo Container */}
        <div className="relative bg-white p-6 rounded-full shadow-2xl z-10 w-40 h-40 flex items-center justify-center animate-bounce-slow">
            <img 
                src="https://nexalite-org.github.io/storage/logo.png" 
                alt="Expro Group" 
                className="w-28 object-contain"
                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100x40?text=EXPRO'}
            />
        </div>
      </div>
      
      {/* Loading Bar */}
      <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-loading-bar"></div>
      </div>
      
      <p className="mt-4 text-blue-900 font-serif font-bold tracking-[0.2em] text-sm animate-pulse">
        LOADING EXPERIENCE
      </p>
    </div>
  );
};