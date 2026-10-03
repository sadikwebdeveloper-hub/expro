import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { backend } from '../../services/backend';
import { User } from '../../types';

type AdminLink = { path: string; name: string; icon: string };
type AdminNavGroup = { label: string; links: AdminLink[] };

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = backend.getCurrentUser();
    if (!currentUser) {
      navigate('/admin/login', { replace: true });
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [sidebarOpen]);

  const navigation: AdminNavGroup[] = useMemo(() => {
    const groups: AdminNavGroup[] = [
      {
        label: 'Workspace',
        links: [
          { path: '/admin/dashboard', name: 'Dashboard', icon: 'fa-chart-pie' },
          { path: '/admin/messages', name: 'Message inbox', icon: 'fa-inbox' },
          { path: '/admin/visitors', name: 'Visitor traffic', icon: 'fa-chart-line' },
        ],
      },
      {
        label: 'Manage content',
        links: [
          { path: '/admin/content', name: 'Pages & content', icon: 'fa-file-lines' },
          { path: '/admin/companies', name: 'Subsidiaries', icon: 'fa-building' },
          { path: '/admin/products', name: 'Products', icon: 'fa-box-open' },
          { path: '/admin/news', name: 'News & media', icon: 'fa-photo-film' },
        ],
      },
      {
        label: 'Administration',
        links: [
          { path: '/admin/settings', name: 'Global settings', icon: 'fa-sliders' },
          ...(user?.role === 'super_admin'
            ? [{ path: '/admin/users', name: 'Manage admins', icon: 'fa-users-gear' }]
            : []),
          { path: '/admin/profile', name: 'My profile', icon: 'fa-user-shield' },
        ],
      },
    ];
    return groups;
  }, [user?.role]);

  const activeLink = navigation.flatMap((group) => group.links).find((link) => link.path === location.pathname);
  const pageTitle = activeLink?.name || 'Admin workspace';
  const initial = (user?.fullName || user?.username || 'A').trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    backend.logoutApi();
    navigate('/admin/login', { replace: true });
  };

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500" aria-busy="true">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" aria-hidden />
          Loading admin workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 lg:flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        aria-label="Admin sidebar"
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[88vw] flex-col bg-[#0c192a] text-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:z-20 lg:w-[17.5rem] lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-6 py-6">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-600 text-lg font-black text-[#092016] shadow-lg shadow-emerald-900/30">
            E
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-[0.16em] text-white">EXPRO GROUP</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Admin workspace</p>
          </div>
          <button
            type="button"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="fas fa-xmark" aria-hidden />
          </button>
        </div>

        <div className="mx-4 mt-5 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-700 text-sm font-bold text-white ring-1 ring-white/10">
            {user.profilePic ? (
              <img src={user.profilePic} alt="" className="h-full w-full object-cover" />
            ) : initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.fullName || user.username}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium capitalize text-emerald-300">
              {user.role.replaceAll('_', ' ')}
            </p>
          </div>
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 ring-4 ring-emerald-400/10" aria-label="Signed in" />
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-6" aria-label="Admin navigation">
          <Link
            to="/"
            className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.045] px-3.5 py-3 text-sm font-semibold text-slate-300 transition hover:border-emerald-300/30 hover:bg-emerald-400/10 hover:text-white"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.07] text-xs text-emerald-300 transition group-hover:bg-emerald-400/15">
              <i className="fas fa-arrow-up-right-from-square" aria-hidden />
            </span>
            View public website
          </Link>

          {navigation.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition ${
                        active
                          ? 'bg-emerald-400/15 text-white ring-1 ring-inset ring-emerald-300/20'
                          : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <i className={`fas ${link.icon} w-5 text-center text-[14px] ${active ? 'text-emerald-300' : 'text-slate-500 group-hover:text-emerald-300'}`} aria-hidden />
                      <span className="flex-1">{link.name}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-rose-300 transition hover:bg-rose-400/10 hover:text-rose-200"
          >
            <i className="fas fa-arrow-right-from-bracket w-5 text-center" aria-hidden />
            Sign out
          </button>
          <p className="px-3.5 pt-3 text-[10px] text-slate-600">Expro Group · Admin</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 shadow-sm shadow-slate-900/[0.02] backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 lg:hidden"
            >
              <i className="fas fa-bars" aria-hidden />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.19em] text-slate-400 sm:block">Control room</p>
              <h1 className="truncate text-base font-bold text-slate-900 sm:mt-0.5 sm:text-lg">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700 sm:flex">
              <i className="fas fa-shield-halved" aria-hidden />
              Secure session
            </div>
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-xs font-semibold text-slate-800">{user.fullName || user.username}</p>
              <p className="mt-0.5 text-[10px] capitalize text-slate-400">{user.role.replaceAll('_', ' ')}</p>
            </div>
            <Link
              to="/admin/profile"
              aria-label="Open my profile"
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700 ring-2 ring-white shadow-sm"
            >
              {user.profilePic ? (
                <img src={user.profilePic} alt="" className="h-full w-full object-cover" />
              ) : initial}
            </Link>
          </div>
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
