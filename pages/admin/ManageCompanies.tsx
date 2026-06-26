import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { Company } from '../../types';

export const ManageCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ name: '', description: '', icon: 'fa-building', imageFile: null as File | null });

  const load = () => backend.getCompanies().then(setCompanies);
  useEffect(() => { load(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, imageFile: file }));
    }
  };

  const startEdit = (c: Company) => {
      setEditingId(c.id);
      setForm({ name: c.name, description: c.description, icon: c.icon, imageFile: null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setEditingId(null);
      setForm({ name: '', description: '', icon: 'fa-building', imageFile: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('icon', form.icon);
    if(form.imageFile) formData.append('image', form.imageFile);

    if (editingId) {
        await backend.updateCompany(editingId, formData);
        alert('Subsidiary updated!');
    } else {
        await backend.addCompany(formData);
        alert('Subsidiary added!');
    }
    
    cancelEdit();
    load();
  };

  const handleDelete = async (id: number) => {
    if(window.confirm('Remove this company?')) {
      await backend.deleteCompany(id);
      load();
    }
  };

  const icons = ['fa-building', 'fa-industry', 'fa-leaf', 'fa-graduation-cap', 'fa-hospital-user', 'fa-utensils', 'fa-tshirt', 'fa-tools', 'fa-shopping-bag', 'fa-snowflake', 'fa-gas-pump', 'fa-umbrella-beach'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className={`p-6 rounded-xl shadow-sm border-t-4 ${editingId ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-blue-600'}`}>
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Subsidiary' : 'Add Subsidiary'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
              <input required className="w-full border rounded p-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea required className="w-full border rounded p-2" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            
            {/* Logo Upload */}
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Logo Image (Optional)</label>
               <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm" />
               <p className="text-xs text-gray-500 mt-1">If no image is uploaded, the icon selected below will be used.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Fallback Icon</label>
              <div className="grid grid-cols-6 gap-2 border p-2 rounded">
                 {icons.map(icon => (
                   <div 
                     key={icon} 
                     onClick={() => setForm({...form, icon})} 
                     className={`p-2 text-center cursor-pointer rounded hover:bg-blue-100 ${form.icon === icon ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                   >
                     <i className={`fas ${icon}`}></i>
                   </div>
                 ))}
              </div>
            </div>
            <div className="flex gap-2">
                <button className={`flex-1 text-white py-2 rounded font-bold ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {editingId ? 'Update' : 'Add Company'}
                </button>
                {editingId && (
                    <button type="button" onClick={cancelEdit} className="bg-gray-300 px-4 rounded hover:bg-gray-400">Cancel</button>
                )}
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4">Logo/Icon</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                        {c.image ? (
                            <img src={c.image} className="w-12 h-12 object-contain rounded" alt="logo" />
                        ) : (
                            <div className="text-blue-600 text-xl"><i className={`fas ${c.icon}`}></i></div>
                        )}
                    </td>
                    <td className="p-4 font-bold">{c.name}</td>
                    <td className="p-4 text-sm text-gray-600 min-w-[200px]">{c.description}</td>
                    <td className="p-4 flex gap-3">
                      <button onClick={() => startEdit(c)} className="text-blue-500 hover:text-blue-700">
                          <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};