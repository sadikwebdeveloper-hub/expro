import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { SiteConfig } from '../types';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    backend.getConfig().then(setConfig);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    await backend.sendMessage(formData);
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="animate-fade-in-up bg-gray-50 min-h-screen">
       <div className="relative h-[400px] flex items-center justify-center bg-gray-900 text-white" style={{backgroundImage: "url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80')", backgroundAttachment: 'fixed', backgroundSize: 'cover'}}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-4 font-serif">Contact Us</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">We are always here to listen and help you move forward.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Info Box */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-10 rounded-3xl h-full shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
              <h3 className="text-3xl font-bold mb-8 font-serif">Get In Touch</h3>
              <div className="space-y-8 relative z-10">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl mr-4 flex-shrink-0">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Head Office</h5>
                    <p className="text-blue-100 whitespace-pre-line">{config?.address}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl mr-4 flex-shrink-0">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Email Us</h5>
                    <p className="text-blue-100">{config?.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl mr-4 flex-shrink-0">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Call Us</h5>
                    <p className="text-blue-100">{config?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 font-serif">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                    <input 
                      required 
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Email</label>
                    <input 
                      required 
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input 
                    required 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Inquiry about..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea 
                    required 
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                <button 
                  disabled={status === 'sending'}
                  className={`w-full py-4 rounded-full font-bold text-white transition-all transform hover:-translate-y-1 shadow-lg ${status === 'success' ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Embedded Map */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[450px]">
           <iframe 
             src={config?.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5983460988937!2d90.4190289759715!3d23.797313086973347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a0f443577d%3A0x6e65e656d0d21658!2sGulshan%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1714567890123!5m2!1sen!2sbd"} 
             width="100%" 
             height="100%" 
             style={{border:0}} 
             allowFullScreen={true} 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade">
           </iframe>
        </div>
      </div>
    </div>
  );
};