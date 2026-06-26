import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { Visitor } from '../../types';

export const VisitorStats: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    backend.getVisitors().then(setVisitors);
  }, []);

  return (
    <div>
       <h2 className="text-3xl font-bold mb-6">Visitor Traffic</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
             <p className="text-gray-500 text-sm font-bold uppercase">Total Visits</p>
             <h3 className="text-4xl font-bold text-gray-800">{visitors.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
             <p className="text-gray-500 text-sm font-bold uppercase">Unique Today</p>
             <h3 className="text-4xl font-bold text-gray-800">
               {visitors.filter(v => v.date.includes(new Date().toLocaleDateString())).length}
             </h3>
          </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
         <div className="p-4 bg-gray-50 font-bold border-b">Recent Visitors Log</div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4">IP Address (Simulated)</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Browser / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visitors.slice(0, 50).map(v => (
                  <tr key={v.id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-mono text-blue-600 font-bold">{v.ip}</td>
                    <td className="p-4 text-sm font-bold text-gray-700">{v.date}</td>
                    <td className="p-4 text-xs text-gray-500 truncate max-w-xs" title={v.userAgent}>{v.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
         {visitors.length > 50 && <div className="p-4 text-center text-gray-500 text-sm">Showing last 50 records</div>}
       </div>
    </div>
  );
};