import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { NewsItem, MediaItem } from '../../types';

export const ManageNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'media'>('news');
  
  // News Form State
  const [newsEditingId, setNewsEditingId] = useState<number | null>(null);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', date: '', imageFile: null as File | null });
  
  // Media Form State
  const [mediaEditingId, setMediaEditingId] = useState<number | null>(null);
  const [mediaForm, setMediaForm] = useState({ title: '', type: 'Gallery' as const, imageFile: null as File | null });

  const load = async () => {
    setNews(await backend.getNews());
    setMedia(await backend.getMedia());
  };
  
  useEffect(() => { load(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'news' | 'media') => {
    const file = e.target.files?.[0];
    if (file) {
        if(type === 'news') setNewsForm(p => ({ ...p, imageFile: file }));
        else setMediaForm(p => ({ ...p, imageFile: file }));
    }
  };

  // --- News Handlers ---
  const startEditNews = (n: NewsItem) => {
      setNewsEditingId(n.id);
      setNewsForm({ title: n.title, content: n.content, date: n.date, imageFile: null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const cancelEditNews = () => {
      setNewsEditingId(null);
      setNewsForm({ title: '', content: '', date: '', imageFile: null });
  };

  const submitNews = async (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('title', newsForm.title);
      formData.append('content', newsForm.content);
      formData.append('date', newsForm.date);
      if(newsForm.imageFile) formData.append('image', newsForm.imageFile);

      if (newsEditingId) {
          await backend.updateNews(newsEditingId, formData);
          alert("News updated!");
      } else {
          await backend.addNews(formData);
          alert("News published!");
      }
      
      cancelEditNews();
      load();
  };

  // --- Media Handlers ---
  const startEditMedia = (m: MediaItem) => {
      setMediaEditingId(m.id);
      setMediaForm({ title: m.title, type: m.type, imageFile: null });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditMedia = () => {
      setMediaEditingId(null);
      setMediaForm({ title: '', type: 'Gallery', imageFile: null });
  };

  const submitMedia = async (e: React.FormEvent) => {
      e.preventDefault();
      // If adding, image is required. If editing, image is optional.
      if(!mediaEditingId && !mediaForm.imageFile) return alert("Image is required");
      
      const formData = new FormData();
      formData.append('title', mediaForm.title);
      formData.append('type', mediaForm.type);
      if(mediaForm.imageFile) formData.append('image', mediaForm.imageFile);

      if (mediaEditingId) {
          await backend.updateMedia(mediaEditingId, formData);
          alert("Media updated!");
      } else {
          await backend.addMedia(formData);
          alert("Media uploaded!");
      }
      
      cancelEditMedia();
      load();
  };

  return (
    <div>
        <div className="flex gap-4 mb-6">
            <button onClick={() => setActiveTab('news')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>News & Events</button>
            <button onClick={() => setActiveTab('media')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'media' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Gallery Media</button>
        </div>

        {activeTab === 'news' ? (
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className={`p-6 rounded-xl shadow-sm h-fit ${newsEditingId ? 'bg-yellow-50 border-t-4 border-yellow-500' : 'bg-white border-t-4 border-blue-500'}`}>
                        <h3 className="font-bold mb-4">{newsEditingId ? 'Edit News' : 'Add News Item'}</h3>
                        <form onSubmit={submitNews} className="space-y-4">
                            <input className="w-full border p-2 rounded" placeholder="Title" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                            <textarea className="w-full border p-2 rounded" placeholder="Content" rows={3} value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} required />
                            <input type="date" className="w-full border p-2 rounded" value={newsForm.date} onChange={e => setNewsForm({...newsForm, date: e.target.value})} required />
                            <div>
                                <label className="block text-xs font-bold mb-1">Image {newsEditingId && '(Leave blank to keep)'}</label>
                                <input type="file" onChange={e => handleFileChange(e, 'news')} className="w-full text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <button className={`flex-1 text-white py-2 rounded font-bold ${newsEditingId ? 'bg-yellow-500' : 'bg-blue-600'}`}>{newsEditingId ? 'Update' : 'Post News'}</button>
                                {newsEditingId && <button type="button" onClick={cancelEditNews} className="bg-gray-300 px-3 rounded">Cancel</button>}
                            </div>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    {news.map(n => (
                        <div key={n.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                            <img src={n.image} className="w-24 h-24 object-cover rounded" alt="thumb" />
                            <div className="flex-1">
                                <h4 className="font-bold">{n.title}</h4>
                                <p className="text-sm text-gray-500">{n.date}</p>
                                <p className="text-sm mt-1">{n.content}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => startEditNews(n)} className="text-blue-500 border border-blue-100 p-2 rounded hover:bg-blue-50"><i className="fas fa-edit"></i></button>
                                <button onClick={async () => { if(confirm('Delete news?')) { await backend.deleteNews(n.id); load(); } }} className="text-red-500 border border-red-100 p-2 rounded hover:bg-red-50"><i className="fas fa-trash"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className={`p-6 rounded-xl shadow-sm h-fit ${mediaEditingId ? 'bg-yellow-50 border-t-4 border-yellow-500' : 'bg-white border-t-4 border-blue-500'}`}>
                        <h3 className="font-bold mb-4">{mediaEditingId ? 'Edit Media' : 'Add Media'}</h3>
                        <form onSubmit={submitMedia} className="space-y-4">
                            <input className="w-full border p-2 rounded" placeholder="Title/Caption" value={mediaForm.title} onChange={e => setMediaForm({...mediaForm, title: e.target.value})} required />
                            <select className="w-full border p-2 rounded" value={mediaForm.type} onChange={e => setMediaForm({...mediaForm, type: e.target.value as any})}>
                                <option>Gallery</option>
                                <option>Slider</option>
                            </select>
                            <div>
                                <label className="block text-xs font-bold mb-1">Image {mediaEditingId && '(Leave blank to keep)'}</label>
                                <input type="file" onChange={e => handleFileChange(e, 'media')} className="w-full text-sm" required={!mediaEditingId} />
                            </div>
                            <div className="flex gap-2">
                                <button className={`flex-1 text-white py-2 rounded font-bold ${mediaEditingId ? 'bg-yellow-500' : 'bg-blue-600'}`}>{mediaEditingId ? 'Update' : 'Upload'}</button>
                                {mediaEditingId && <button type="button" onClick={cancelEditMedia} className="bg-gray-300 px-3 rounded">Cancel</button>}
                            </div>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {media.map(m => (
                        <div key={m.id} className="relative group rounded-lg overflow-hidden">
                            <img src={m.image} className="w-full h-32 object-cover" alt="media" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-2">
                                <button onClick={() => startEditMedia(m)} className="text-blue-500 bg-white p-2 rounded-full hover:bg-blue-50"><i className="fas fa-edit"></i></button>
                                <button onClick={async () => { if(confirm('Delete media?')) { await backend.deleteMedia(m.id); load(); } }} className="text-red-500 bg-white p-2 rounded-full hover:bg-red-50"><i className="fas fa-trash"></i></button>
                            </div>
                            <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs w-full p-1 truncate">{m.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};