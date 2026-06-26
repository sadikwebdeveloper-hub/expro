import React, { useEffect, useState } from 'react';
import { backend } from '../../services/backend';
import { Message } from '../../types';

export const ManageMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    backend.getMessages().then(setMessages);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Message Inbox</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden h-[80vh] flex flex-col">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">All Messages ({messages.length})</div>
          <div className="overflow-y-auto flex-1">
            {messages.length === 0 && <div className="p-8 text-center text-gray-500">No messages yet.</div>}
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 border-b cursor-pointer transition hover:bg-blue-50 ${selectedMessage?.id === msg.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                   <h4 className="font-bold text-gray-800 truncate">{msg.name}</h4>
                   <span className="text-xs text-gray-500">{msg.date}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 truncate">{msg.subject}</p>
                <p className="text-xs text-gray-500 truncate">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm h-[80vh] flex flex-col p-8">
           {selectedMessage ? (
             <>
               <div className="border-b pb-6 mb-6">
                 <h3 className="text-2xl font-bold mb-2">{selectedMessage.subject}</h3>
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{selectedMessage.name}</span>
                    <span>&lt;{selectedMessage.email}&gt;</span>
                    <span className="text-gray-400">|</span>
                    <span>{selectedMessage.date}</span>
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                 {selectedMessage.message}
               </div>
               <div className="mt-6 pt-6 border-t flex gap-4">
                 <a href={`mailto:${selectedMessage.email}`} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
                   <i className="fas fa-reply mr-2"></i> Reply
                 </a>
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <i className="fas fa-envelope-open-text text-6xl mb-4 opacity-50"></i>
               <p className="text-lg">Select a message to read</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};