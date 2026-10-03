import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const statCards = [
  { key: 'visitors', label: 'Site visits', icon: 'fa-eye', tint: 'bg-sky-50 text-sky-700 ring-sky-100' },
  { key: 'messages', label: 'Inbox messages', icon: 'fa-envelope', tint: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  { key: 'products', label: 'Products', icon: 'fa-cubes-stacked', tint: 'bg-violet-50 text-violet-700 ring-violet-100' },
  { key: 'subsidiaries', label: 'Subsidiaries', icon: 'fa-building', tint: 'bg-amber-50 text-amber-700 ring-amber-100' },
  { key: 'admins', label: 'Administrators', icon: 'fa-users', tint: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
  { key: 'news', label: 'News & media', icon: 'fa-newspaper', tint: 'bg-rose-50 text-rose-700 ring-rose-100' },
] as const;

const StatusRow: React.FC<{ label: string; status?: { verified: boolean; message: string } }> = ({ label, status }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
    <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${status?.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
      <i className={`fas ${status?.verified ? 'fa-check' : 'fa-triangle-exclamation'} text-xs`} aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-800">{label}</p>
      <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
        {status?.message || 'Status unavailable'}
      </p>
    </div>
  </div>
);

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || '—' : date.toLocaleString();
};

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setStats(await backend.getDashboardStats());
    } catch (error: any) {
      setLoadError(error?.message || 'Dashboard data could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-[#0c192a] px-5 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="absolute inset-0 bg-mesh-hero opacity-60" aria-hidden />
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />
              Workspace overview
            </span>
            <h2 className="mt-3 text-balance text-2xl font-bold text-white sm:text-3xl">Your group at a glance</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
              A clear view of your website activity, content and system health.
            </p>
          </div>
          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.12] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            <i className={`fas fa-rotate ${loading ? 'animate-spin' : ''}`} aria-hidden />
            Refresh data
          </button>
        </div>
      </section>

      {loadError && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError}</span>
          <button type="button" onClick={loadStats} className="font-bold underline underline-offset-2">Try again</button>
        </div>
      )}

      <section aria-label="Site statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const value = stats?.counts?.[card.key] ?? 0;
          return (
            <article key={card.key} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-500">{card.label}</p>
                  {loading && !stats ? (
                    <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-100" aria-label="Loading" />
                  ) : (
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{value.toLocaleString()}</p>
                  )}
                </div>
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg ring-1 ${card.tint}`}>
                  <i className={`fas ${card.icon}`} aria-hidden />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">System</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Service health</h3>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <i className="fas fa-heart-pulse" aria-hidden />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            <StatusRow label="Email delivery · SMTP" status={stats?.system?.smtp} />
            <StatusRow label="Media storage · Cloudinary" status={stats?.system?.cloudinary} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span><span className="font-semibold text-slate-700">Environment:</span> {stats?.system?.nodeEnv || '—'}</span>
            <span><span className="font-semibold text-slate-700">Uptime:</span> {Math.floor((stats?.system?.uptime || 0) / 60)} min</span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Inbox</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Latest messages</h3>
            </div>
            <Link to="/admin/messages" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50">
              Open inbox <i className="fas fa-arrow-right text-[10px]" aria-hidden />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {(stats?.recentMessages || []).slice(0, 5).map((message: any) => (
              <div key={message.id} className="py-3 first:pt-1 last:pb-1">
                <p className="truncate text-sm font-semibold text-slate-800">{message.subject || 'No subject'}</p>
                <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-slate-500">
                  <span>{message.name || 'Unknown sender'}</span>
                  <span aria-hidden>·</span>
                  <span>{message.date || 'Recently received'}</span>
                </p>
              </div>
            ))}
            {!stats?.recentMessages?.length && (
              <div className="grid min-h-28 place-items-center py-6 text-center text-sm text-slate-400">No messages yet.</div>
            )}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Audit trail</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Recent admin activity</h3>
          </div>
          <span className="text-xs text-slate-400">Latest actions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3.5 sm:px-6">Time</th>
                <th scope="col" className="px-5 py-3.5 sm:px-6">Administrator</th>
                <th scope="col" className="px-5 py-3.5 sm:px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats?.recentActivity || []).slice(0, 8).map((log: any) => (
                <tr key={log.id} className="text-slate-600 transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-500 sm:px-6">{formatDate(log.timestamp)}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 sm:px-6">{log.adminName || log.adminUsername || 'Admin'}</td>
                  <td className="px-5 py-3.5 sm:px-6">{log.action}</td>
                </tr>
              ))}
              {!stats?.recentActivity?.length && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400">No activity recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
