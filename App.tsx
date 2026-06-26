import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Contact } from './pages/Contact';
import { Companies } from './pages/Companies';
import { Media } from './pages/Media';
import { backend } from './services/backend';

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

const PublicLayout = () => {
  useEffect(() => {
    backend.trackVisit();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
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
