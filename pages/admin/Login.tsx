import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backend } from '../../services/backend';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we need setup first
    backend.checkSetup().then(needsSetup => {
      if (needsSetup) {
        navigate('/admin/setup');
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = await backend.login(username, password);
    if (user) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('Sending request...');
    await backend.forgotPassword(forgotEmail);
    setForgotMsg('If the email matches an account, we sent instructions.');
  };

  if (showForgot) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
                <p className="text-sm text-gray-500 mb-6">Enter your account email to receive reset instructions.</p>
                {forgotMsg && <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm">{forgotMsg}</div>}
                <form onSubmit={handleForgot} className="space-y-4">
                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 border rounded-lg" 
                        placeholder="admin@exprogroup.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Send Recovery Email</button>
                    <button type="button" onClick={() => setShowForgot(false)} className="w-full text-gray-500 text-sm mt-4">Back to Login</button>
                </form>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
             <i className="fas fa-shield-alt"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-500">Expro Group Management</p>
        </div>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <input 
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">
            Login to Dashboard
          </button>
        </form>
        <div className="mt-6 text-center">
            <button onClick={() => setShowForgot(true)} className="text-sm text-blue-600 hover:underline">Forgot Password?</button>
        </div>
      </div>
    </div>
  );
};