import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Outlet, useLocation, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BackToTop } from './components/ui';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Contact } from './pages/Contact';
import { Companies } from './pages/Companies';
import { Media } from './pages/Media';
import { backend } from './services/backend';
import { Maintenance } from './pages/Maintenance';
import { SiteConfig } from './types';

// About Sub-pages
import { Strategies } from './pages/about/Strategies';
import { Vision } from './pages/about/Vision';
import { Chairman } from './pages/about/Chairman';
import { MD } from './pages/about/MD';
import { Coordinator } from './pages/about/Coordinator';

// Admin
import { Login } from './pages/admin/Login';
import { Setup } from './pages/admin/Setup';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ManageProducts } from './pages/admin/ManageProducts';
import { ManageSettings } from './pages/admin/ManageSettings';
import { ManageContent } from './pages/admin/ManageContent';
import { ManageCompanies } from './pages/admin/ManageCompanies';
import { ManageNews } from './pages/admin/ManageNews';
import { AdminProfile } from './pages/admin/AdminProfile';
import { ManageMessages } from './pages/admin/ManageMessages';
import { VisitorStats } from './pages/admin/VisitorStats';
import { ManageUsers } from './pages/admin/ManageUsers';

/** Scroll to the top whenever the route changes (unless the URL carries a hash). */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
};

const PublicLayout = () => {
  const [siteConfig, setSiteConfig] = React.useState<SiteConfig | null>(null);

  useEffect(() => {
    let alive = true;
    backend.getConfig().then((config) => {
      if (!alive) return;
      setSiteConfig(config);
      if (!config.maintenanceMode) backend.trackVisit();
    });
    return () => { alive = false; };
  }, []);

  // Resolve public site availability before mounting any page content to avoid
  // briefly showing the site when maintenance mode is enabled.
  if (!siteConfig) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink-950 text-ink-300" aria-busy="true">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" aria-hidden />
          Loading site…
        </div>
      </main>
    );
  }

  if (siteConfig.maintenanceMode) return <Maintenance config={siteConfig} />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

const NotFound = () => (
  <section className="relative grid min-h-[70vh] place-items-center overflow-hidden bg-ink-950 px-6 py-24">
    <div className="absolute inset-0 bg-mesh-hero opacity-70" aria-hidden />
    <div className="relative text-center">
      <p className="text-[7rem] font-extrabold leading-none text-white/10 sm:text-[10rem]">404</p>
      <h1 className="-mt-10 text-3xl font-bold text-white sm:text-4xl">This page has moved on</h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-300">
        The page you were looking for doesn’t exist or has been relocated. Let’s get you back on track.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link to="/" className="btn-primary">Back to Home</Link>
        <Link to="/contact" className="btn-ghost-light">Contact Us</Link>
      </div>
    </div>
  </section>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Strategies />} />
          <Route path="/about/strategies" element={<Strategies />} />
          <Route path="/about/vision" element={<Vision />} />
          <Route path="/about/chairman" element={<Chairman />} />
          <Route path="/about/md" element={<MD />} />
          <Route path="/about/coordinator" element={<Coordinator />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/media" element={<Media />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/setup" element={<Setup />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="messages" element={<ManageMessages />} />
          <Route path="visitors" element={<VisitorStats />} />
          <Route path="settings" element={<ManageSettings />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="content" element={<ManageContent />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="news" element={<ManageNews />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="*" element={<div className="p-8">Page under construction</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
