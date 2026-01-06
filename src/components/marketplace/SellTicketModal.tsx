import React, { useState } from 'react';
import { X, Upload, Ticket as TicketIcon } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../translations';
import { Ticket } from '../../types';

interface SellTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListTicket: (ticket: Ticket) => void;
  lang: Language;
}

export const SellTicketModal: React.FC<SellTicketModalProps> = ({ isOpen, onClose, onListTicket, lang }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  const [form, setForm] = useState<Partial<Ticket>>({
      eventName: '',
      date: '',
      location: '',
      zone: '',
      seatNumber: '',
      originalPrice: 0,
      resalePrice: 0,
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400'
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newTicket: Ticket = {
          id: `t-${Date.now()}`,
          eventName: form.eventName || '',
          date: form.date || '',
          location: form.location || '',
          zone: form.zone || '',
          seatNumber: form.seatNumber || '',
          originalPrice: Number(form.originalPrice),
          resalePrice: Number(form.resalePrice),
          sellerName: 'You', // In a real app, from auth
          isVerified: true,
          image: form.image || '',
          status: 'AVAILABLE'
      };
      onListTicket(newTicket);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div className="flex items-center gap-2">
                 <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><TicketIcon size={20}/></div>
                 <h3 className="font-bold text-lg text-slate-800">{t.listTicket}</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.eventName}</label>
                <input required type="text" className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none font-bold" value={form.eventName} onChange={e => setForm({...form, eventName: e.target.value})} />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.date}</label>
                    <input required type="date" className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none font-bold" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.location}</label>
                    <input required type="text" className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none font-bold" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.zone}</label>
                    <input type="text" className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none font-bold" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.seat}</label>
                    <input type="text" className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none font-bold" value={form.seatNumber} onChange={e => setForm({...form, seatNumber: e.target.value})} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <div>
                    <label className="block text-xs font-bold text-yellow-600 uppercase mb-1">{t.originalPrice}</label>
                    <input required type="number" className="w-full p-3 bg-white rounded-xl border border-yellow-200 focus:ring-2 focus:ring-yellow-400 outline-none font-bold" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">{t.resalePrice}</label>
                    <input required type="number" className="w-full p-3 bg-white rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-400 outline-none font-bold text-emerald-600" value={form.resalePrice} onChange={e => setForm({...form, resalePrice: Number(e.target.value)})} />
                </div>
             </div>

             <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
                {t.submitListing}
             </button>
        </form>
      </div>
    </div>
  );
};