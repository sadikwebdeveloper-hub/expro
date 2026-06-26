import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { Product } from '../../types';

export const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState({ name: '', category: 'Agro', imageFile: null as File | null });

  const load = () => backend.getProducts().then(setProducts);

  useEffect(() => { load(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, imageFile: file }));
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, imageFile: null });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', category: 'Agro', imageFile: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    if (form.imageFile) {
      formData.append('image', form.imageFile);
    }

    if (editingId) {
        await backend.updateProduct(editingId, formData);
        alert('Product updated!');
    } else {
        await backend.addProduct(formData);
        alert('Product added!');
    }
    
    cancelEdit();
    
    const fileInput = document.getElementById('productImage') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
    
    load();
  };

  const handleDelete = async (id: number) => {
    if(window.confirm('Delete this product?')) {
      await backend.deleteProduct(id);
      load();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-1">
        <div className={`p-6 rounded-xl shadow-sm border-t-4 ${editingId ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-blue-600'}`}>
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input required className="w-full border rounded p-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
              <select className="w-full border rounded p-2" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>Agro</option>
                <option>Construction</option>
                <option>Food</option>
                <option>Fashion</option>
                <option>Energy</option>
                <option>Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Image {editingId && '(Leave blank to keep current)'}</label>
              <input 
                id="productImage" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="w-full text-sm" 
              />
              {form.imageFile && (
                <p className="text-xs text-green-600 mt-2">
                  Selected: {form.imageFile.name}
                </p>
              )}
            </div>
            <div className="flex gap-2">
                <button className={`flex-1 text-white py-2 rounded font-bold ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {editingId ? 'Update' : 'Add Product'}
                </button>
                {editingId && (
                    <button type="button" onClick={cancelEdit} className="bg-gray-300 px-4 rounded hover:bg-gray-400">Cancel</button>
                )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Image</th>
                  <th className="p-4 font-bold text-gray-600">Name</th>
                  <th className="p-4 font-bold text-gray-600">Category</th>
                  <th className="p-4 font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {p.image ? (
                          <img src={p.image} className="w-12 h-12 object-cover rounded" alt="thumb" />
                      ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">No Img</div>
                      )}
                    </td>
                    <td className="p-4 font-bold">{p.name}</td>
                    <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs uppercase">{p.category}</span></td>
                    <td className="p-4 flex gap-3">
                      <button onClick={() => startEdit(p)} className="text-blue-500 hover:text-blue-700" title="Edit">
                          <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700" title="Delete">
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