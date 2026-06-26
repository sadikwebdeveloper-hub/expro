import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { User } from '../../types';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'manager' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const load = () => backend.getUsers().then(setUsers);
  
  useEffect(() => { 
      load(); 
      setCurrentUser(backend.getCurrentUser());
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await backend.addUser(form);
    if(success) {
        setForm({ username: '', password: '', fullName: '', email: '', role: 'manager' });
        load();
    } else {
        alert("Failed. Username might exist.");
    }
  };

  const handleDelete = async (id: number) => {
      if(window.confirm("Delete this user?")) {
          await backend.deleteUser(id);
          load();
      }
  };

  if (currentUser?.role !== 'super_admin') {
      return <div className="p-10 text-center text-red-500 font-bold">Access Denied. Super Admin only.</div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm h-fit">
            <h3 className="font-bold text-xl mb-4">Add New Admin</h3>
            <form onSubmit={handleAdd} className="space-y-4">
                <input required placeholder="Full Name" className="w-full border p-2 rounded" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                <input required placeholder="Email" type="email" className="w-full border p-2 rounded" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <input required placeholder="Username" className="w-full border p-2 rounded" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                <input required placeholder="Password" type="password" className="w-full border p-2 rounded" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <select className="w-full border p-2 rounded" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="manager">Manager</option>
                    <option value="super_admin">Super Admin</option>
                </select>
                <button className="w-full bg-blue-600 text-white py-2 rounded">Create User</button>
            </form>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
            {users.map(u => (
                <div key={u.id} className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                            {u.fullName[0]}
                        </div>
                        <div>
                            <h4 className="font-bold">{u.fullName} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{u.role}</span></h4>
                            <p className="text-sm text-gray-500">{u.email}</p>
                            <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                    </div>
                    {u.id !== currentUser.id && (
                        <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><i className="fas fa-trash"></i></button>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};
