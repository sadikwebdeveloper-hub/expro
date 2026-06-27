import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';

interface DashboardStats {
  counts: {
    visitors: number;
    admins: number;
    messages: number;
    products: number;
    subsidiaries: number;
    news: number;
  };
  system: {
    smtp: { verified: boolean; message: string };
    cloudinary: { verified: boolean; message: string };
    nodeEnv: string;
    uptime: number;
  };
  recentMessages: any[];
  recentActivity: any[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  const cards = [
    { label: 'Visitors', value: stats?.counts.visitors ?? 0, color: 'blue', icon: 'fa-globe' },
    { label: 'Messages', value: stats?.counts.messages ?? 0, color: 'green', icon: 'fa-envelope' },
    { label: 'Products', value: stats?.counts.products ?? 0, color: 'purple', icon: 'fa-box' },
    { label: 'Subsidiaries', value: stats?.counts.subsidiaries ?? 0, color: 'orange', icon: 'fa-building' },
    { label: 'Admins', value: stats?.counts.admins ?? 0, color: 'indigo', icon: 'fa-users' },
    { label: 'News', value: stats?.counts.news ?? 0, color: 'pink', icon: 'fa-newspaper' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50 text-blue-600',
    green: 'border-green-500 bg-green-50 text-green-600',
    purple: 'border-purple-500 bg-purple-50 text-purple-600',
    orange: 'border-orange-500 bg-orange-50 text-orange-600',
    indigo: 'border-indigo-500 bg-indigo-50 text-indigo-600',
    pink: 'border-pink-500 bg-pink-50 text-pink-600',
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${colorMap[card.color]?.split(' ')[0]}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase">{card.label}</p>
                <h3 className="text-4xl font-bold text-gray-800">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${colorMap[card.color]}`}>
                <i className={`fas ${card.icon}`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">System Health</h3>
          <div className="space-y-3">
            <div className={`p-3 rounded-lg text-sm font-medium ${stats?.system.smtp?.verified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {stats?.system.smtp?.message || 'SMTP status unknown'}
            </div>
            <div className={`p-3 rounded-lg text-sm font-medium ${stats?.system.cloudinary?.verified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {stats?.system.cloudinary?.message || 'Cloudinary status unknown'}
            </div>
            <p className="text-sm text-gray-500">Environment: {stats?.system.nodeEnv} · Uptime: {Math.floor((stats?.system.uptime || 0) / 60)}m</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg mb-4">Recent Messages</h3>
          <div className="space-y-3">
            {(stats?.recentMessages || []).map((m: any) => (
              <div key={m.id} className="border-b border-gray-100 pb-2">
                <p className="font-medium text-sm">{m.subject}</p>
                <p className="text-xs text-gray-500">{m.name} · {m.date}</p>
              </div>
            ))}
            {!stats?.recentMessages?.length && <p className="text-gray-400 text-sm">No messages yet</p>}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Time</th>
                <th className="py-2">Admin</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentActivity || []).map((log: any) => (
                <tr key={log.id} className="border-b border-gray-100">
                  <td className="py-2">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-2">{log.adminName || log.adminUsername}</td>
                  <td className="py-2">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
