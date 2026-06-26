import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { backend } from '../../services/backend';
import { User } from '../../types';

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const u = backend.getCurrentUser();
    if (!u) {
      navigate('/admin/login');
    } else {
      setUser(u);
    }
  }, [navigate]);

  // Close sidebar automatically when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    backend.logout();
    navigate('/admin/login');
  };

  if (!user) return null;

  const links = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: 'fa-home' },
    { path: '/admin/messages', name: 'Message Inbox', icon: 'fa-envelope' },
    { path: '/admin/visitors', name: 'Visitor Tracking', icon: 'fa-globe' },
    { path: '/admin/settings', name: 'Global Settings', icon: 'fa-cog' },
    { path: '/admin/profile', name: 'My Profile', icon: 'fa-user-shield' },
    { path: '/admin/content', name: 'Pages & Content', icon: 'fa-file-alt' },
    { path: '/admin/companies', name: 'Subsidiaries', icon: 'fa-building' },
    { path: '/admin/products', name: 'Products', icon: 'fa-box' },
    { path: '/admin/news', name: 'News & Media', icon: 'fa-newspaper' },
  ];
  
  if (user.role === 'super_admin') {
      links.splice(4, 0, { path: '/admin/users', name: 'Manage Admins', icon: 'fa-users-cog' });
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-40 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="text-2xl focus:outline-none hover:text-blue-400 transition"
            >
                <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
            <span className="font-bold text-lg tracking-wide">Admin Panel</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
             {user.profilePic ? (
               <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-sm font-bold">{user.username[0].toUpperCase()}</div>
             )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 text-center border-b border-gray-800 bg-gray-800/50">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-500 overflow-hidden bg-gray-700 flex items-center justify-center">
             {user.profilePic ? (
               <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <span className="text-2xl font-bold">{user.username[0].toUpperCase()}</span>
             )}
          </div>
          <h4 className="font-bold text-lg truncate px-2">{user.fullName}</h4>
          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Back Button */}
          <Link 
            to="/" 
            className="flex items-center px-4 py-3 mb-4 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm group"
          >
            <i className="fas fa-arrow-left w-6 text-center mr-3 group-hover:-translate-x-1 transition-transform"></i>
            Back to Website
          </Link>

          <div className="border-t border-gray-800 my-2"></div>

          {links.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${location.pathname === link.path ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <i className={`fas ${link.icon} w-6 text-center mr-3`}></i>
              {link.name}
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors mt-8"
          >
            <i className="fas fa-sign-out-alt w-6 text-center mr-3"></i>
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300
        lg:ml-64
      `}>
         {/* Mobile Header Spacer */}
         <div className="h-16 lg:hidden"></div>
         
         <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
            <Outlet />
         </div>
      </div>
    </div>
  );
};