import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';

export const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState({ msgs: 0, products: 0, news: 0 });

  useEffect(() => {
    const load = async () => {
      const m = await backend.getMessages();
      const p = await backend.getProducts();
      const n = await backend.getNews();
      setCounts({ msgs: m.length, products: p.length, news: n.length });
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase">Messages</p>
              <h3 className="text-4xl font-bold text-gray-800">{counts.msgs}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
              <i className="fas fa-envelope"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase">Products</p>
              <h3 className="text-4xl font-bold text-gray-800">{counts.products}</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">
              <i className="fas fa-box"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase">News Items</p>
              <h3 className="text-4xl font-bold text-gray-800">{counts.news}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl">
              <i className="fas fa-newspaper"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
