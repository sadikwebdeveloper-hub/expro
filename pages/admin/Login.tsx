import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backend } from '../../services/backend';

type ForgotStep = 'email' | 'otp' | 'password' | 'done';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    backend.checkSetup().then(needsSetup => {
      if (needsSetup) {
        navigate('/admin/setup');
      }
    });
  }, [navigate]);

  const resetForgotFlow = () => {
    setShowForgot(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotMsg('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { user, forcePasswordChange } = await backend.login(username, password, rememberMe);
    if (user) {
      if (forcePasswordChange) {
        navigate('/admin/profile');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError('Invalid credentials.');
    }
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('Sending request...');
    try {
      const result = await backend.forgotPassword(forgotEmail);
      if (result.otpSent) {
        setForgotMsg('If the email matches an account, we sent a verification code.');
        setForgotStep('otp');
      } else {
        setForgotMsg('If the email matches an account, we sent a verification code.');
      }
    } catch (err: any) {
      setForgotMsg(err.message || 'An error occurred. Please try again.');
    }
  };

  const handleForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('Verifying code...');
    const verified = await backend.verifyResetOtp(forgotEmail, forgotOtp);
    if (verified) {
      setForgotMsg('Code verified. Enter your new password.');
      setForgotStep('password');
    } else {
      setForgotMsg('Invalid or expired code. Please try again or resend.');
    }
  };

  const handleResendOtp = async () => {
    setForgotMsg('Resending code...');
    const result = await backend.resendOtp(forgotEmail, 'reset');
    setForgotMsg(result.otpSent ? 'A new code has been sent.' : 'If the email matches an account, we sent a verification code.');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setForgotMsg('Passwords do not match.');
      return;
    }
    setForgotMsg('Resetting password...');
    const success = await backend.resetPassword(forgotEmail, forgotOtp, newPassword);
    if (success) {
      setForgotStep('done');
      setForgotMsg('Password reset successfully. You can now log in.');
    } else {
      setForgotMsg('Password reset failed. Please start over.');
    }
  };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

          {forgotStep === 'email' && (
            <>
              <p className="text-sm text-gray-500 mb-6">Enter your account email to receive reset instructions.</p>
              {forgotMsg && <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm">{forgotMsg}</div>}
              <form onSubmit={handleForgotEmail} className="space-y-4">
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="admin@exprogroup.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Send Recovery Email</button>
                <button type="button" onClick={resetForgotFlow} className="w-full text-gray-500 text-sm mt-4">Back to Login</button>
              </form>
            </>
          )}

          {forgotStep === 'otp' && (
            <>
              <p className="text-sm text-gray-500 mb-6">Enter the 6-digit code sent to your email.</p>
              {forgotMsg && <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm">{forgotMsg}</div>}
              <form onSubmit={handleForgotOtp} className="space-y-4">
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  className="w-full px-4 py-3 border rounded-lg text-center tracking-widest text-lg"
                  placeholder="000000"
                  value={forgotOtp}
                  onChange={e => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Verify Code</button>
                <button type="button" onClick={handleResendOtp} className="w-full text-blue-600 text-sm">Resend Code</button>
                <button type="button" onClick={resetForgotFlow} className="w-full text-gray-500 text-sm mt-4">Back to Login</button>
              </form>
            </>
          )}

          {forgotStep === 'password' && (
            <>
              <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>
              {forgotMsg && <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm">{forgotMsg}</div>}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Reset Password</button>
                <button type="button" onClick={resetForgotFlow} className="w-full text-gray-500 text-sm mt-4">Back to Login</button>
              </form>
            </>
          )}

          {forgotStep === 'done' && (
            <>
              {forgotMsg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{forgotMsg}</div>}
              <button onClick={resetForgotFlow} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Back to Login</button>
            </>
          )}
        </div>
      </div>
    );
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
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
            Remember me
          </label>
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
