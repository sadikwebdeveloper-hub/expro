import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { User } from '../../types';

export const AdminProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ fullName: '', password: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const u = backend.getCurrentUser();
    if (u) {
      setUser(u);
      setFormData({ fullName: u.fullName, password: '' });
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Only send password if it's not empty
    const updateData: any = { fullName: formData.fullName };
    if (formData.password) updateData.password = formData.password;
    
    await backend.updateProfile(user.id, updateData);
    setMsg('Profile updated successfully!');
    setTimeout(() => setMsg(''), 3000);
    
    // Refresh local user state
    const updated = backend.getCurrentUser();
    setUser(updated);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && user) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              await backend.updateProfile(user.id, { fullName: user.fullName, profilePic: base64 });
              const updated = backend.getCurrentUser();
              setUser(updated);
          };
          reader.readAsDataURL(file);
      }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-6">Admin Profile Security</h2>
      {msg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</div>}

      <div className="flex flex-col items-center mb-8">
         <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 mb-4 relative group cursor-pointer">
             {user.profilePic ? (
                 <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
                     <i className="fas fa-user"></i>
                 </div>
             )}
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                 <i className="fas fa-camera text-white text-2xl"></i>
             </div>
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} accept="image/*" />
         </div>
         <p className="text-sm text-gray-500">Click photo to update</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <input 
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            value={formData.fullName} 
            onChange={e => setFormData({...formData, fullName: e.target.value})} 
          />
        </div>
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">New Password (Leave blank to keep current)</label>
           <input 
             type="password"
             className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
             value={formData.password} 
             onChange={e => setFormData({...formData, password: e.target.value})} 
             placeholder="********"
           />
        </div>
        <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 border border-yellow-200">
           <i className="fas fa-lock mr-2"></i> Security Note: Changing your password will require you to log in again next session.
        </div>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg">
          Update Credentials
        </button>
      </form>
    </div>
  );
};