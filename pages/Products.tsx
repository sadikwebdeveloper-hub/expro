import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { Product } from '../types';
import { Preloader } from '../components/Preloader';

export const Products: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    backend.getProducts().then(data => {
        setProducts(data);
        setTimeout(() => setLoading(false), 800);
    });
  }, []);

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 animate-fade-in-up">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Our Products</h1>
          <p className="text-xl text-gray-500">Explore our wide range of quality products across multiple industries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative h-72 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                    <span className="text-yellow-400 font-bold tracking-wider text-sm uppercase mb-1">{product.category}</span>
                    <h3 className="text-white text-2xl font-bold">{product.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm">High quality {product.category} product manufactured by Expro.</p>
                </div>
              </div>
            ))}
        </div>
        {products.length === 0 && <div className="text-center py-20 text-gray-400">Loading catalog...</div>}
      </div>
    </div>
  );
};