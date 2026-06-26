import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { SiteConfig } from '../../types';

export const ManageSettings: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [msg, setMsg] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    backend.getConfig().then(setConfig);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (config) {
      setConfig({ ...config, [e.target.name]: e.target.value });
    }
  };

  const addEmail = () => {
      if(newEmail && config) {
          const updated = config.notificationEmails ? [...config.notificationEmails, newEmail] : [newEmail];
          setConfig({...config, notificationEmails: updated});
          setNewEmail('');
      }
  };

  const removeEmail = (email: string) => {
      if(config && config.notificationEmails) {
          setConfig({...config, notificationEmails: config.notificationEmails.filter(e => e !== email)});
      }
  };

  const save = async () => {
    if (config) {
      await backend.updateConfig(config);
      setMsg('Settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Global Site Settings</h2>
      {msg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
            <h3 className="font-bold text-gray-400 border-b pb-2 mb-4">Notification Settings</h3>
        </div>
        <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Receive Contact Form Emails</label>
            <div className="flex gap-2 mb-2">
                <input className="border p-2 rounded flex-grow" placeholder="admin@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <button onClick={addEmail} className="bg-blue-600 text-white px-4 rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {config.notificationEmails?.map(email => (
                    <span key={email} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        {email}
                        <i onClick={() => removeEmail(email)} className="fas fa-times ml-2 cursor-pointer hover:text-red-500"></i>
                    </span>
                ))}
            </div>
        </div>

        <div className="md:col-span-2 mt-4">
            <h3 className="font-bold text-gray-400 border-b pb-2 mb-4">Contact Info</h3>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Company Logo URL</label>
          <input className="w-full border p-2 rounded" name="logoUrl" value={config.logoUrl} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
          <input className="w-full border p-2 rounded" name="phone" value={config.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input className="w-full border p-2 rounded" name="email" value={config.email} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
          <input className="w-full border p-2 rounded" name="address" value={config.address} onChange={handleChange} />
        </div>
        
        <div className="md:col-span-2 mt-4">
             <h3 className="font-bold text-gray-400 border-b pb-2 mb-4">Map & Social</h3>
        </div>
        <div className="md:col-span-2">
           <label className="block text-sm font-bold text-gray-700 mb-2">Google Map Embed URL (src)</label>
           <input className="w-full border p-2 rounded" name="mapUrl" value={config.mapUrl} onChange={handleChange} placeholder="https://www.google.com/maps/embed?..." />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Facebook URL</label>
          <input className="w-full border p-2 rounded" name="facebookUrl" value={config.facebookUrl} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn URL</label>
          <input className="w-full border p-2 rounded" name="linkedinUrl" value={config.linkedinUrl} onChange={handleChange} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">Footer Description</label>
          <textarea className="w-full border p-2 rounded" name="footerText" rows={3} value={config.footerText} onChange={handleChange}></textarea>
        </div>
      </div>
      <button onClick={save} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700">Save Settings</button>
    </div>
  );
};