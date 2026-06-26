import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { AboutContent, HeroSlide, Partner, ServiceCard, Achievement, Director } from '../../types';

export const ManageContent: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  
  const [activeTab, setActiveTab] = useState<'slider' | 'about' | 'directors' | 'partners' | 'services' | 'achievements'>('slider');

  // Edit States
  const [editingId, setEditingId] = useState<number | null>(null);

  // Forms
  const [newPartner, setNewPartner] = useState({ name: '', logo: '' });
  const [newService, setNewService] = useState({ title: '', description: '', icon: 'fa-star' });
  const [newAchievement, setNewAchievement] = useState({ title: '', image: '' });
  const [newDirector, setNewDirector] = useState({ name: '', position: '', image: '' });

  const loadAll = async () => {
      setSlides(await backend.getSlides());
      setAbout(await backend.getAboutContent());
      setPartners(await backend.getPartners());
      setServices(await backend.getServiceCards());
      setAchievements(await backend.getAchievements());
      setDirectors(await backend.getDirectors());
  }

  useEffect(() => { loadAll(); }, []);

  // --- Cancel Edit helper ---
  const resetForms = () => {
      setEditingId(null);
      setNewPartner({ name: '', logo: '' });
      setNewService({ title: '', description: '', icon: 'fa-star' });
      setNewAchievement({ title: '', image: '' });
      setNewDirector({ name: '', position: '', image: '' });
  };

  // --- Handlers ---
  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const handleAboutChange = (field: keyof AboutContent, value: string) => {
    if (about) setAbout({ ...about, [field]: value });
  };

  const handleLeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AboutContent) => {
    const file = e.target.files?.[0];
    if (file && about) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAbout({ ...about, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePartnerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPartner(p => ({ ...p, logo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleDirectorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setNewDirector(d => ({...d, image: reader.result as string}));
          reader.readAsDataURL(file);
      }
  };

  const saveSlides = async () => { await backend.updateSlides(slides); alert('Slides updated!'); };
  const saveAbout = async () => { if (about) { await backend.updateAboutContent(about); alert('About content updated!'); } };

  // Partners
  const startEditPartner = (p: Partner) => {
      setEditingId(p.id);
      setNewPartner({ name: p.name, logo: p.logo });
      window.scrollTo({top: 0, behavior: 'smooth'});
  };
  const submitPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await backend.updatePartner(editingId, newPartner);
    else await backend.addPartner(newPartner);
    resetForms();
    setPartners(await backend.getPartners());
  };
  const deletePartner = async (id: number) => { await backend.deletePartner(id); setPartners(await backend.getPartners()); };

  // Services
  const startEditService = (s: ServiceCard) => {
      setEditingId(s.id);
      setNewService({ title: s.title, description: s.description, icon: s.icon });
      window.scrollTo({top: 0, behavior: 'smooth'});
  };
  const submitService = async (e: React.FormEvent) => {
    e.preventDefault();
    if(editingId) {
        const updated = services.map(s => s.id === editingId ? { ...s, ...newService } : s);
        await backend.updateServiceCards(updated);
        setServices(updated);
    } else {
        const updated = [...services, { ...newService, id: Date.now() }];
        await backend.updateServiceCards(updated);
        setServices(updated);
    }
    resetForms();
  };
  const deleteService = async (id: number) => {
    const updated = services.filter(s => s.id !== id);
    await backend.updateServiceCards(updated);
    setServices(updated);
  };

  // Achievements
  const startEditAchievement = (a: Achievement) => {
      setEditingId(a.id);
      setNewAchievement({ title: a.title, image: a.image });
      window.scrollTo({top: 0, behavior: 'smooth'});
  };
  const submitAchievement = async (e: React.FormEvent) => {
      e.preventDefault();
      if(editingId) await backend.updateAchievement(editingId, newAchievement);
      else await backend.addAchievement(newAchievement);
      resetForms();
      setAchievements(await backend.getAchievements());
  };
  const deleteAchievement = async (id: number) => { await backend.deleteAchievement(id); setAchievements(await backend.getAchievements()); };

  // Directors
  const startEditDirector = (d: Director) => {
      setEditingId(d.id);
      setNewDirector({ name: d.name, position: d.position, image: d.image });
      window.scrollTo({top: 0, behavior: 'smooth'});
  };
  const submitDirector = async (e: React.FormEvent) => {
      e.preventDefault();
      if(editingId) await backend.updateDirector(editingId, newDirector);
      else await backend.addDirector(newDirector);
      resetForms();
      setDirectors(await backend.getDirectors());
  };
  const deleteDirector = async (id: number) => { await backend.deleteDirector(id); setDirectors(await backend.getDirectors()); };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Manage Content</h2>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {['slider', 'about', 'directors', 'partners', 'services', 'achievements'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab as any); resetForms(); }} className={`px-4 py-2 rounded font-bold capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                {tab}
            </button>
        ))}
      </div>

      {activeTab === 'slider' && (
        <div className="space-y-8">
          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white p-6 rounded-xl shadow-md border">
              <h4 className="font-bold mb-4">Slide #{index + 1}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase mb-1">Title</label>
                  <input className="w-full border p-2 rounded" value={slide.title} onChange={e => handleSlideChange(index, 'title', e.target.value)} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase mb-1">Subtitle</label>
                  <input className="w-full border p-2 rounded" value={slide.subtitle} onChange={e => handleSlideChange(index, 'subtitle', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase mb-1">Description</label>
                  <textarea className="w-full border p-2 rounded" rows={2} value={slide.description} onChange={e => handleSlideChange(index, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase mb-1">Image URL</label>
                  <input className="w-full border p-2 rounded" value={slide.image} onChange={e => handleSlideChange(index, 'image', e.target.value)} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase mb-1">Button Text</label>
                  <input className="w-full border p-2 rounded" value={slide.buttonText} onChange={e => handleSlideChange(index, 'buttonText', e.target.value)} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase mb-1">Button Link</label>
                  <input className="w-full border p-2 rounded" value={slide.link} onChange={e => handleSlideChange(index, 'link', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={saveSlides} className="bg-green-600 text-white px-6 py-3 rounded font-bold">Save Slider Changes</button>
        </div>
      )}

      {activeTab === 'about' && about && (
        <div className="bg-white p-8 rounded-xl shadow-md space-y-8">
          <div className="border-b pb-6">
             <h3 className="text-xl font-bold mb-4 text-blue-600">Strategies & Intro</h3>
             <textarea className="w-full border p-2 rounded" rows={4} value={about.introText} onChange={e => handleAboutChange('introText', e.target.value)} />
          </div>
          {[
            { role: 'Chairman', nameKey: 'chairmanName', msgKey: 'chairmanMessage', imgKey: 'chairmanImage' },
            { role: 'Managing Director', nameKey: 'mdName', msgKey: 'mdMessage', imgKey: 'mdImage' },
            { role: 'Coordinator', nameKey: 'coordinatorName', msgKey: 'coordinatorMessage', imgKey: 'coordinatorImage' }
          ].map((leader: any) => (
            <div key={leader.role} className="border-b pb-6">
                <h3 className="text-xl font-bold mb-4 text-blue-600">{leader.role}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold mb-2">Name</label>
                        <input className="w-full border p-2 rounded" value={(about as any)[leader.nameKey]} onChange={e => handleAboutChange(leader.nameKey, e.target.value)} />
                    </div>
                    <div>
                         <label className="block font-bold mb-2">Profile Picture</label>
                         <div className="flex items-center gap-4">
                             { (about as any)[leader.imgKey] && <img src={(about as any)[leader.imgKey]} className="w-12 h-12 rounded-full object-cover" alt="Thumb"/> }
                             <input type="file" accept="image/*" onChange={e => handleLeaderImageUpload(e, leader.imgKey)} className="text-sm" />
                         </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block font-bold mb-2">Message</label>
                        <textarea className="w-full border p-2 rounded" rows={4} value={(about as any)[leader.msgKey]} onChange={e => handleAboutChange(leader.msgKey, e.target.value)} />
                    </div>
                </div>
            </div>
          ))}
          <button onClick={saveAbout} className="bg-green-600 text-white px-6 py-3 rounded font-bold w-full">Save All Content</button>
        </div>
      )}

      {activeTab === 'directors' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-xl shadow h-fit border-t-4 border-blue-500">
               <h3 className="font-bold mb-4">{editingId ? 'Edit Director' : 'Add Director'}</h3>
               <form onSubmit={submitDirector} className="space-y-4">
                   <input className="w-full border p-2 rounded" placeholder="Full Name" value={newDirector.name} onChange={e => setNewDirector({...newDirector, name: e.target.value})} required />
                   <input className="w-full border p-2 rounded" placeholder="Position (e.g. Director, Finance)" value={newDirector.position} onChange={e => setNewDirector({...newDirector, position: e.target.value})} required />
                   <div className="border p-2 rounded">
                       <label className="block text-xs font-bold mb-1">Photo {editingId && '(Leave blank to keep)'}</label>
                       <input type="file" onChange={handleDirectorImageUpload} className="w-full text-sm" required={!editingId} />
                   </div>
                   <div className="flex gap-2">
                       <button className="flex-1 bg-blue-600 text-white py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
                       {editingId && <button type="button" onClick={resetForms} className="bg-gray-300 px-3 rounded">Cancel</button>}
                   </div>
               </form>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
               {directors.map(d => (
                   <div key={d.id} className="relative group bg-white p-4 rounded-xl shadow text-center">
                       <img src={d.image} className="w-24 h-24 mx-auto rounded-full object-cover mb-2" />
                       <h4 className="font-bold">{d.name}</h4>
                       <p className="text-sm text-gray-500">{d.position}</p>
                       <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                           <button onClick={() => startEditDirector(d)} className="text-blue-500 bg-blue-50 p-1 rounded"><i className="fas fa-edit"></i></button>
                           <button onClick={() => deleteDirector(d.id)} className="text-red-500 bg-red-50 p-1 rounded"><i className="fas fa-trash"></i></button>
                       </div>
                   </div>
               ))}
            </div>
          </div>
      )}

      {activeTab === 'partners' && (
        <div className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-1 bg-white p-6 rounded-xl shadow h-fit border-t-4 border-blue-500">
              <h3 className="font-bold mb-4">{editingId ? 'Edit Partner' : 'Add Partner'}</h3>
              <form onSubmit={submitPartner} className="space-y-4">
                  <input className="w-full border p-2 rounded" placeholder="Name" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} required />
                  <div className="border p-2 rounded">
                      <label className="block text-xs font-bold mb-1">Logo {editingId && '(Leave blank to keep)'}</label>
                      <input type="file" onChange={handlePartnerLogoUpload} className="w-full text-sm" required={!editingId} />
                  </div>
                  <div className="flex gap-2">
                       <button className="flex-1 bg-blue-600 text-white py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
                       {editingId && <button type="button" onClick={resetForms} className="bg-gray-300 px-3 rounded">Cancel</button>}
                   </div>
              </form>
           </div>
           <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {partners.map(p => (
                  <div key={p.id} className="relative group bg-white p-4 rounded-xl shadow flex items-center justify-center">
                      <img src={p.logo} alt={p.name} className="max-h-16 max-w-full" />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                           <button onClick={() => startEditPartner(p)} className="text-blue-500 bg-blue-50 p-1 rounded"><i className="fas fa-edit"></i></button>
                           <button onClick={() => deletePartner(p.id)} className="text-red-500 bg-red-50 p-1 rounded"><i className="fas fa-times"></i></button>
                       </div>
                  </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'services' && (
         <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white p-6 rounded-xl shadow h-fit border-t-4 border-blue-500">
              <h3 className="font-bold mb-4">{editingId ? 'Edit Feature' : 'Add Feature'}</h3>
              <form onSubmit={submitService} className="space-y-4">
                  <input className="w-full border p-2 rounded" placeholder="Title" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} required />
                  <input className="w-full border p-2 rounded" placeholder="Icon (fa-class)" value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})} required />
                  <textarea className="w-full border p-2 rounded" placeholder="Description" rows={3} value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} required />
                  <div className="flex gap-2">
                       <button className="flex-1 bg-blue-600 text-white py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
                       {editingId && <button type="button" onClick={resetForms} className="bg-gray-300 px-3 rounded">Cancel</button>}
                   </div>
              </form>
           </div>
           <div className="md:col-span-2 space-y-4">
               {services.map(s => (
                   <div key={s.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center group">
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><i className={`fas ${s.icon}`}></i></div>
                           <div>
                               <h4 className="font-bold">{s.title}</h4>
                               <p className="text-sm text-gray-500">{s.description}</p>
                           </div>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                           <button onClick={() => startEditService(s)} className="text-blue-500 bg-blue-50 p-2 rounded"><i className="fas fa-edit"></i></button>
                           <button onClick={() => deleteService(s.id)} className="text-red-500 bg-red-50 p-2 rounded"><i className="fas fa-trash"></i></button>
                       </div>
                   </div>
               ))}
           </div>
         </div>
      )}

      {activeTab === 'achievements' && (
         <div className="grid md:grid-cols-3 gap-8">
             <div className="md:col-span-1 bg-white p-6 rounded-xl shadow h-fit border-t-4 border-blue-500">
                <h3 className="font-bold mb-4">{editingId ? 'Edit Stat' : 'Add Stat'}</h3>
                <form onSubmit={submitAchievement} className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Title (e.g., '25 Years')" value={newAchievement.title} onChange={e => setNewAchievement({...newAchievement, title: e.target.value})} required />
                    <p className="text-xs text-gray-500">Optional icon image (leave blank to use default icon):</p>
                    <input type="text" className="w-full border p-2 rounded" placeholder="Image URL (optional)" value={newAchievement.image} onChange={e => setNewAchievement({...newAchievement, image: e.target.value})} />
                    <div className="flex gap-2">
                       <button className="flex-1 bg-blue-600 text-white py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
                       {editingId && <button type="button" onClick={resetForms} className="bg-gray-300 px-3 rounded">Cancel</button>}
                   </div>
                </form>
             </div>
             <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {achievements.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl shadow flex items-center gap-4 relative group">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            {a.image ? <img src={a.image} className="w-8 h-8" /> : <i className="fas fa-trophy text-blue-600"></i>}
                        </div>
                        <span className="font-bold">{a.title}</span>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                           <button onClick={() => startEditAchievement(a)} className="text-blue-500 bg-blue-50 p-1 rounded"><i className="fas fa-edit"></i></button>
                           <button onClick={() => deleteAchievement(a.id)} className="text-red-500 bg-red-50 p-1 rounded"><i className="fas fa-times"></i></button>
                       </div>
                    </div>
                ))}
             </div>
         </div>
      )}
    </div>
  );
};