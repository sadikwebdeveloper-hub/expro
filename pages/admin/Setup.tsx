import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backend } from '../../services/backend';

export const Setup: React.FC = () => {
  const [form, setForm] = useState({ username: '', password: '', confirmPass: '', fullName: '', email: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
     backend.checkSetup().then(needs => {
         if(!needs) navigate('/admin/login');
     });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(form.password !== form.confirmPass) {
        setError("Passwords do not match");
        return;
    }
    
    const success = await backend.setupAdmin(form);
    if (success) {
        alert("System Setup Complete! Please login.");
        navigate('/admin/login');
    } else {
        setError("Setup failed. System might already be initialized.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg border-t-8 border-blue-500">
            <h1 className="text-3xl font-bold mb-2">System Setup</h1>
            <p className="text-gray-500 mb-8">Create your Super Admin account to secure the system.</p>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700">Full Name</label>
                    <input required className="w-full border p-3 rounded-lg mt-1" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Recovery Email</label>
                    <input required type="email" className="w-full border p-3 rounded-lg mt-1" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700">Username</label>
                    <input required className="w-full border p-3 rounded-lg mt-1" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Password</label>
                        <input required type="password" className="w-full border p-3 rounded-lg mt-1" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Confirm</label>
                        <input required type="password" className="w-full border p-3 rounded-lg mt-1" value={form.confirmPass} onChange={e => setForm({...form, confirmPass: e.target.value})} />
                    </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 shadow-xl mt-4">
                    Complete Setup
                </button>
            </form>
        </div>
    </div>
  );
};
